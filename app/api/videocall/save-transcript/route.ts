import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import dbConnect, { Transcription } from "@/lib/mongo"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { roomId, transcript, sessionId } = await req.json()

        if (!roomId) {
            return NextResponse.json({ error: "Room ID or Order ID is required" }, { status: 400 })
        }

        // 1. Tentar encontrar a sala e verificar participação
        const participant = await prisma.videoCallParticipant.findUnique({
            where: {
                userId_roomId: {
                    userId: session.user.id,
                    roomId: roomId
                }
            }
        })

        // 2. Identificar Paciente e Profissional
        let patientId = ""
        let professionalId = ""

        // Tentativa 1: Buscar agendamento
        const appointment = await prisma.appointment.findFirst({
            where: { roomId: roomId }
        })

        if (appointment) {
            patientId = appointment.patientId
            professionalId = appointment.professionalId
        } else {
            // Fallback: Participantes
            const allParticipants = await prisma.videoCallParticipant.findMany({
                where: { roomId },
                include: { user: true }
            })

            const professional = allParticipants.find(p => p.user.role !== 'DEFAULT')
            const patient = allParticipants.find(p => p.user.role === 'DEFAULT')

            if (professional) professionalId = professional.user.id
            if (patient) patientId = patient.user.id
        }

        if (!patientId || !professionalId) {
            return NextResponse.json({ error: "Could not identify patient/professional" }, { status: 400 })
        }

        // 3. Buscar o ID interno do Paciente (tabela paicentes)
        const pacienteRecord = await prisma.pacientes.findFirst({
            where: { patientId: patientId }
        })

        if (!pacienteRecord) {
            return NextResponse.json({ error: "Patient record not found" }, { status: 404 })
        }

        // 4. Salvar Transcrição no MongoDB (Devido ao tamanho do texto)
        await dbConnect();

        const mongoTranscription = await Transcription.create({
            userId: session.user.id,
            patientId: patientId,
            sessionId: sessionId || roomId,
            summary: "",
            text: transcript || "Sem transcrição.",
        });

        const mongoId = mongoTranscription._id.toString();

        // 5. Salvar NotePatient com referência ao Mongo
        const note = await prisma.notePatient.create({
            data: {
                patientId: pacienteRecord.id,
                professionalId: professionalId,
                notes: "",
                summaryIdMongo: mongoId,
                prescription: "",
            },
        })

        return NextResponse.json({ success: true, noteId: note.id, mongoId })

    } catch (error: any) {
        console.error("Error saving transcript:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
