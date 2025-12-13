"use server"
import { prisma } from "@/lib/db" // ou qualquer cliente DB que usar
import { auth } from "@/auth" // Certifique-se de que está importando corretamente
import { Patient } from "@/types/appointment"

export const getPatientsByIdProfessionalById = async (patientId: string): Promise<Patient[] | { error: string }> => {
  const session = await auth() // Obtém a sessão do usuário autenticado

  const getPatient = await prisma.patientProfessional.findFirst({
    where: {
      professionalId: session?.user.id,
      patientId: patientId
    },
    select: {
      patientId: true,
    },
  })

  if (!getPatient) throw Error("Paciente não encontrado")
  try {
    const patients = await prisma.pacientes.findMany({
      where: {
        patientId: getPatient.patientId,
        deletedAt: null,
      },
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
        responsibleName: true,
        responsiblePhone: true,
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
    const patientMapper = patients.map((item) => ({
      id: item.id,
      medicalRecordId: item.medicalRecordId,
      cep: item.cep,
      state: item.state,
      street: item.street,
      neighborhood: item.neighborhood,
      emergencyContact: item.emergencyContact,
      birthDate: item.birthDate,
      city: item.city,
      number: item.number,
      notes: item.notes,
      userId: item.patient.id,
      name: item.patient.name,
      email: item.patient.email,
      phone: item.patient.phone,
      image: item.patient.image,
      active: item.patient.active,
      responsibleName: item.responsibleName,
      responsiblePhone: item.responsiblePhone,
    }))

    return patientMapper as Patient[]
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error)
    return { error: "Erro ao buscar pacientes" }
  }
}
