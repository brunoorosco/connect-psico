"use server"

import { prisma } from "@/lib/db"
import { z } from "zod"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

const AddConsultation = z.object({
  patientId: z.number(),
  notes: z.string(),
  prescription: z.string().optional(),
  professionalId: z.string(),
  summaryIdMongo: z.string().optional(),
})

export const createConsultation = async (data: z.infer<typeof AddConsultation>) => {
  const valid = await AddConsultation.safeParseAsync(data)

  if (!valid.success) {
    return { error: "Dados inválidos" }
  }

  try {
    const notePatient = await prisma.notePatient.create({
      data: {
        notes: valid.data.notes,
        patientId: valid.data.patientId,
        prescription: valid.data.prescription || "",
        professionalId: valid.data.professionalId,
        summaryIdMongo: valid.data.summaryIdMongo,
      },
    })
    return { success: "Consulta salva com sucesso", data: notePatient }
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return { error: "Erro ao enviar mensagem" }
    }

    throw error
  }
}

export default createConsultation
