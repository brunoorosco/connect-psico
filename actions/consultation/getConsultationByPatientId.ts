"use server"

import { prisma } from "@/lib/db"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

export const getConsultaltionByPatientId = async (patientId: number) => {
  try {
    const notePatient = await prisma.notePatient.findMany({
      where: {
        patientId: patientId,
      },
      include: {
        professional: {
          select: {
            name: true,
          },
        },
      },
    })
    return { data: notePatient }
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return { error: "Erro ao enviar mensagem" }
    }

    throw error
  }
}

export default getConsultaltionByPatientId
