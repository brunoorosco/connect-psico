"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { customAlphabet } from "nanoid"
const nanoid = customAlphabet("1234567890", 5)

export async function getConsentStatus() {
  const session = await auth()

  if (!session?.user?.id) return { loggedIn: false }

  const user = await prisma.pacientes.findFirst({
    where: { patientId: session.user.id },
    select: { patientId: true, consentRecording: true },
  })
  return {
    loggedIn: true,
    hasRecordedChoice: user?.consentRecording !== null && user?.consentRecording !== undefined,
    consentValue: user?.consentRecording ?? null,
  }
}

export async function acceptConsent(consentVersion = "v1") {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Not authenticated")

  await prisma.$transaction(async (tx) => {
    const paciente = await tx.pacientes.findFirst({
      where: { patientId: session.user.id, deletedAt: null },
      select: { id: true },
    })

    if (paciente) {
      await tx.pacientes.update({
        where: { id: paciente.id },
        data: {
          consentRecording: true,
          consentRecordingAt: new Date(),
          consentVersion,
        },
      })
    } else {
      await tx.pacientes.create({
        data: {
          patientId: session.user.id as string,
          medicalRecordId: `PR-${nanoid()}`, // ou gere do jeito que usa aí
          consentRecording: true,
          consentRecordingAt: new Date(),
          consentVersion,
        },
      })
    }
  })

  revalidatePath("/app")
}

export async function declineConsent(consentVersion = 'v1') {
    const session = await auth()
    if (!session?.user?.id) throw new Error('Not authenticated')
  
    await prisma.$transaction(async (tx) => {
      const paciente = await tx.pacientes.findFirst({
        where: { patientId: session.user.id, deletedAt: null },
        select: { id: true },
      })
  
      if (paciente) {
        await tx.pacientes.update({
          where: { id: paciente.id },
          data: {
            consentRecording: false,
            consentRecordingAt: new Date(),
            consentVersion,
          },
        })
      } else {
        await tx.pacientes.create({
          data: {
            patientId: session.user.id as string,
            medicalRecordId: `PR-${nanoid()}`, // ou gere do jeito que usa aí
            consentRecording: false,
            consentRecordingAt: new Date(),
            consentVersion,
          },
        })
      }
    })
  
    revalidatePath('/app')
  }