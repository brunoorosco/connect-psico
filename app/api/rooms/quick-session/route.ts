// app/api/rooms/quick-session/route.ts
import { createAdHocAppointment, getAppointmentByRoomId } from "@/actions/appointments/agendamentoRapido"
import { NextRequest, NextResponse } from "next/server"

/**
 * API para criar salas de videochamada sem agendamento prévio (ad-hoc)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { therapistId, patientId, scheduledFor, type, priceCents } = body

    // Validação básica
    if (!therapistId || !patientId) {
      return NextResponse.json(
        { error: "therapistId e patientId são obrigatórios" },
        { status: 400 }
      )
    }

    // Criar appointment ad-hoc usando a action
    const result = await createAdHocAppointment({
      professionalId: therapistId,
      patientId,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      tipoAtendimento: "online",
      priceCents: priceCents || 0,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Falha ao criar sala" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      roomId: result.roomId,
      appointmentId: result.appointment?.id,
      message: "Sala criada com sucesso",
      data: {
        roomId: result.roomId,
        therapistId,
        patientId,
        type: type || "ad-hoc",
        createdAt: result.appointment?.createdAt,
        scheduledFor: result.appointment?.appointmentDate,
        expiresAt: result.appointment?.expiresAt,
      },
    })
  } catch (error) {
    console.error("Erro ao criar sala rápida:", error)
    
    return NextResponse.json(
      { 
        error: "Erro ao criar sala",
        message: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    )
  }
}

/**
 * GET - Verificar se uma sala existe e está ativa
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get("roomId")

    if (!roomId) {
      return NextResponse.json(
        { error: "roomId é obrigatório" },
        { status: 400 }
      )
    }

    // Buscar appointment pelo roomId usando a action
    const result = await getAppointmentByRoomId(roomId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Sala não encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        roomId: result.appointment?.roomId,
        status: result.appointment?.status,
        appointmentDate: result.appointment?.appointmentDate,
        expiresAt: result.appointment?.expiresAt,
        professional: result.appointment?.professional,
        patient: result.appointment?.patient,
      },
    })
  } catch (error) {
    console.error("Erro ao buscar sala:", error)
    
    return NextResponse.json(
      { 
        error: "Erro ao buscar sala",
        message: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    )
  }
}