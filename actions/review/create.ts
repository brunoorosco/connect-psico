"use server"

import { auth } from "@/auth"
import { updateAppointmentStatusReviewRepository } from "@/infra/db/repositories/appointment"
import { createReviewRepository } from "@/infra/db/repositories/review"
import { prisma } from "@/lib/db"
import { z } from "zod"

const createReviewSchema = z.object({
  profissionalId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1),
})

export async function createReviewAction(input: { profissionalId: string; rating: number; comment: string }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  const parsed = createReviewSchema.safeParse(input)
  if (!parsed.success) throw new Error("Dados inválidos")

  // último appointment desse paciente com o profissional
  const lastAppt = await prisma.appointment.findFirst({
    where: { professionalId: input.profissionalId, patientId: session.user.id, status: "CONCLUDED" },
    orderBy: { appointmentDate: "desc" },
    select: { id: true },
  })

  if (!lastAppt) throw new Error("Nenhum atendimento encontrado com este profissional.")

  const resp = await createReviewRepository({
    userId: session.user.id as string,
    appointmentId: lastAppt.id,
    professionalId: input.profissionalId,
    rating: input.rating,
    comment: input.comment,
  })

  await updateAppointmentStatusReviewRepository(Number(resp.appointmentId))

  return resp
}
