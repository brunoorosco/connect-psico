"use server"
import { auth } from "@/auth"
import { PatientModel } from "@/domain/model/patient"
import { prisma } from "@/lib/db" // ou qualquer cliente DB que usar

export const getPatientByUserId = async (id: string) => {
  const session = await auth()
  try {
    const patient = await prisma.pacientes.findFirst({
      where: { patientId: String(id) },
      select: {
        id: true,
        medicalRecordId: true,
        cep: true,
        state: true,
        street: true,
        neighborhood: true,
        emergencyContact: true,
        birthDate: true,
        city: true,
        number: true,
        notes: true,
        patient: {
          select: {
            email: true,
            active: true,
            image: true,
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    })

    if (patient) {
      return {
        id: patient.id,
        medicalRecordId: patient.medicalRecordId,
        cep: patient.cep,
        state: patient.state,
        street: patient.street,
        neighborhood: patient.neighborhood,
        emergencyContact: patient.emergencyContact,
        birthDate: patient.birthDate,
        city: patient.city,
        number: patient.number,
        notes: patient.notes,
        patientId: patient.patient.id,
        name: patient.patient.name,
        email: patient.patient.email,
        phone: patient.patient.phone,
        image: patient.patient.image,
        active: patient.patient.active,
      } as Omit<PatientModel, "professionalId">
    }
    return null
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error)
    return { error: "Erro ao buscar pacientes" }
  }
}
