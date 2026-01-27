"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { Status } from "@prisma/client"

/**
 * Cria um agendamento regular (com data marcada)
 */
export async function createAppointment({
  professionalId,
  patientId,
  appointmentDate,
  tipoAtendimento = "ambos",
  priceCents = 0,
  expiresAt,
}: {
  professionalId: string
  patientId: string
  appointmentDate: Date
  tipoAtendimento?: string
  priceCents?: number
  expiresAt?: Date
}) {
  try {
    const appointment = await prisma.appointment.create({
      data: {
        professionalId,
        patientId,
        appointmentDate,
        status: "PENDING",
        tipoAtendimento,
        priceCents,
        expiresAt,
        roomId: crypto.randomUUID(), // Gera roomId automaticamente
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        professional: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    revalidatePath("/agendamentos")
    revalidatePath(`/app/${professionalId}/agendamentos`)

    return { success: true, appointment }
  } catch (error) {
    console.error("Erro ao criar agendamento:", error)
    return { success: false, error: "Falha ao criar agendamento" }
  }
}

/**
 * Cria uma sala de videochamada ad-hoc (sem agendamento prévio)
 * Para sessões rápidas/emergenciais
 */
export async function createAdHocAppointment({
  professionalId,
  patientId,
  scheduledFor,
  tipoAtendimento = "online",
  priceCents = 0,
}: {
  professionalId: string
  patientId: string
  scheduledFor?: Date
  tipoAtendimento?: string
  priceCents?: number
}) {
  try {
    const roomId = crypto.randomUUID()

    // Define data/hora: agora ou hora marcada
    const appointmentDate = scheduledFor || new Date()

    // Expira em 2 horas se for ad-hoc
    const expiresAt = new Date(appointmentDate.getTime() + 2 * 60 * 60 * 1000)

    const appointment = await prisma.appointment.create({
      data: {
        professionalId,
        patientId,
        appointmentDate,
        status: "CONFIRMED", // Já confirma automaticamente
        tipoAtendimento,
        priceCents,
        roomId,
        expiresAt,
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        professional: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    revalidatePath("/agendamentos")
    revalidatePath(`/app/${professionalId}/agendamentos`)

    return { success: true, appointment, roomId }
  } catch (error) {
    console.error("Erro ao criar sala ad-hoc:", error)
    return { success: false, error: "Falha ao criar sala" }
  }
}

/**
 * Busca um agendamento por ID
 */
export async function getAppointmentById(appointmentId: number) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        professional: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        payment: true,
      },
    })

    return { success: true, appointment }
  } catch (error) {
    console.error("Erro ao buscar agendamento:", error)
    return { success: false, error: "Agendamento não encontrado" }
  }
}

/**
 * Busca um agendamento por roomId
 */
export async function getAppointmentByRoomId(roomId: string) {
  try {
    const appointment = await prisma.appointment.findFirst({
      where: { roomId },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        professional: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    if (!appointment) {
      return { success: false, error: "Sala não encontrada" }
    }

    // Verificar se a sala expirou
    if (appointment.expiresAt && appointment.expiresAt < new Date()) {
      return { success: false, error: "Sala expirada" }
    }

    return { success: true, appointment }
  } catch (error) {
    console.error("Erro ao buscar sala:", error)
    return { success: false, error: "Erro ao buscar sala" }
  }
}

/**
 * Lista agendamentos de um profissional
 */
export async function getAppointmentsByProfessional({
  professionalId,
  status,
  startDate,
  endDate,
  limit = 50,
}: {
  professionalId: string
  status?: Status
  startDate?: Date
  endDate?: Date
  limit?: number
}) {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        professionalId,
        ...(status && { status }),
        ...(startDate &&
          endDate && {
            appointmentDate: {
              gte: startDate,
              lte: endDate,
            },
          }),
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        payment: true,
      },
      orderBy: {
        appointmentDate: "desc",
      },
      take: limit,
    })

    return { success: true, appointments }
  } catch (error) {
    console.error("Erro ao listar agendamentos:", error)
    return { success: false, error: "Falha ao listar agendamentos" }
  }
}

/**
 * Lista agendamentos de um paciente
 */
export async function getAppointmentsByPatient({
  patientId,
  status,
  limit = 50,
}: {
  patientId: string
  status?: Status
  limit?: number
}) {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        patientId,
        ...(status && { status }),
      },
      include: {
        professional: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        payment: true,
      },
      orderBy: {
        appointmentDate: "desc",
      },
      take: limit,
    })

    return { success: true, appointments }
  } catch (error) {
    console.error("Erro ao listar agendamentos do paciente:", error)
    return { success: false, error: "Falha ao listar agendamentos" }
  }
}

/**
 * Atualiza o status de um agendamento
 */
export async function updateAppointmentStatus({
  appointmentId,
  status,
  professionalId,
}: {
  appointmentId: number
  status: Status
  professionalId: string
}) {
  try {
    // Verificar se o profissional tem permissão
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { professionalId: true },
    })

    if (!appointment || appointment.professionalId !== professionalId) {
      return { success: false, error: "Não autorizado" }
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status,
        updatedAt: new Date(),
      },
    })

    revalidatePath("/agendamentos")
    revalidatePath(`/app/${professionalId}/agendamentos`)

    return { success: true, appointment: updated }
  } catch (error) {
    console.error("Erro ao atualizar status:", error)
    return { success: false, error: "Falha ao atualizar status" }
  }
}

/**
 * Confirma um agendamento
 */
export async function confirmAppointment({
  appointmentId,
  professionalId,
}: {
  appointmentId: number
  professionalId: string
}) {
  return updateAppointmentStatus({
    appointmentId,
    status: "CONFIRMED",
    professionalId,
  })
}

/**
 * Cancela um agendamento
 */
export async function cancelAppointment({
  appointmentId,
  userId,
  reason,
}: {
  appointmentId: number
  userId: string
  reason?: string
}) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: {
        professionalId: true,
        patientId: true,
      },
    })

    if (!appointment) {
      return { success: false, error: "Agendamento não encontrado" }
    }

    if (!userId) {
      return { success: false, error: "Agendamento não encontrado" }
    }

    // Verificar se o usuário tem permissão (profissional ou paciente)
    if (appointment.professionalId !== userId && appointment.patientId !== userId) {
      return { success: false, error: "Não autorizado" }
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "CANCELLED",
        updatedAt: new Date(),
      },
    })

    // Criar histórico do cancelamento
    await prisma.appointmentHistory.create({
      data: {
        appointmentId,
        action: "CANCELLED",
        performedBy: userId,
        performedAt: new Date(),
        reason: reason || "Cancelado pelo usuário",
      },
    })

    revalidatePath("/agendamentos")
    revalidatePath(`/app/${appointment.professionalId}/agendamentos`)

    return { success: true, appointment: updated }
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error)
    return { success: false, error: "Falha ao cancelar agendamento" }
  }
}

/**
 * Completa um agendamento (marca como realizado)
 */
export async function completeAppointment({
  appointmentId,
  professionalId,
}: {
  appointmentId: number
  professionalId: string
}) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { professionalId: true },
    })

    if (!appointment || appointment.professionalId !== professionalId) {
      return { success: false, error: "Não autorizado" }
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "CONCLUDED",
        updatedAt: new Date(),
      },
    })

    revalidatePath("/agendamentos")
    revalidatePath(`/app/${professionalId}/agendamentos`)

    return { success: true, appointment: updated }
  } catch (error) {
    console.error("Erro ao completar agendamento:", error)
    return { success: false, error: "Falha ao completar agendamento" }
  }
}

/**
 * Atualiza dados de um agendamento
 */
export async function updateAppointment({
  appointmentId,
  professionalId,
  data,
}: {
  appointmentId: number
  professionalId: string
  data: {
    appointmentDate?: Date
    tipoAtendimento?: string
    priceCents?: number
    expiresAt?: Date
  }
}) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { professionalId: true },
    })

    if (!appointment || appointment.professionalId !== professionalId) {
      return { success: false, error: "Não autorizado" }
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    })

    revalidatePath("/agendamentos")
    revalidatePath(`/app/${professionalId}/agendamentos`)

    return { success: true, appointment: updated }
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error)
    return { success: false, error: "Falha ao atualizar agendamento" }
  }
}

/**
 * Deleta um agendamento (soft delete - apenas cancela)
 */
export async function deleteAppointment({
  appointmentId,
  professionalId,
}: {
  appointmentId: number
  professionalId: string
}) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { professionalId: true, status: true },
    })

    if (!appointment || appointment.professionalId !== professionalId) {
      return { success: false, error: "Não autorizado" }
    }

    // Apenas permite deletar agendamentos pendentes
    if (appointment.status !== "PENDING") {
      return {
        success: false,
        error: "Apenas agendamentos pendentes podem ser deletados",
      }
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "CANCELLED",
        updatedAt: new Date(),
      },
    })

    revalidatePath("/agendamentos")
    revalidatePath(`/app/${professionalId}/agendamentos`)

    return { success: true }
  } catch (error) {
    console.error("Erro ao deletar agendamento:", error)
    return { success: false, error: "Falha ao deletar agendamento" }
  }
}

/**
 * Verifica se um horário está disponível
 */
export async function checkAppointmentAvailability({
  professionalId,
  appointmentDate,
  duration = 60, // minutos
}: {
  professionalId: string
  appointmentDate: Date
  duration?: number
}) {
  try {
    const startTime = new Date(appointmentDate)
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000)

    const conflicts = await prisma.appointment.findMany({
      where: {
        professionalId,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
        appointmentDate: {
          gte: new Date(startTime.getTime() - duration * 60 * 1000),
          lte: endTime,
        },
      },
    })

    return {
      success: true,
      available: conflicts.length === 0,
      conflicts,
    }
  } catch (error) {
    console.error("Erro ao verificar disponibilidade:", error)
    return { success: false, error: "Falha ao verificar disponibilidade" }
  }
}

/**
 * Busca agendamentos próximos (nas próximas 24h)
 */
export async function getUpcomingAppointments(professionalId: string) {
  try {
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    const appointments = await prisma.appointment.findMany({
      where: {
        professionalId,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
        appointmentDate: {
          gte: now,
          lte: tomorrow,
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        appointmentDate: "asc",
      },
    })

    return { success: true, appointments }
  } catch (error) {
    console.error("Erro ao buscar agendamentos próximos:", error)
    return { success: false, error: "Falha ao buscar agendamentos" }
  }
}

/**
 * Limpa salas expiradas (para rodar em um cron job)
 */
export async function cleanupExpiredRooms() {
  try {
    const now = new Date()

    const result = await prisma.appointment.updateMany({
      where: {
        expiresAt: {
          lt: now,
        },
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      data: {
        status: "CANCELLED",
        updatedAt: now,
      },
    })

    console.log(`Limpeza: ${result.count} salas expiradas foram canceladas`)

    return { success: true, count: result.count }
  } catch (error) {
    console.error("Erro ao limpar salas expiradas:", error)
    return { success: false, error: "Falha ao limpar salas" }
  }
}

/**
 * Estatísticas de agendamentos
 */
export async function getAppointmentStats(professionalId: string) {
  try {
    const [total, pending, confirmed, completed, cancelled] = await Promise.all([
      prisma.appointment.count({
        where: { professionalId },
      }),
      prisma.appointment.count({
        where: { professionalId, status: "PENDING" },
      }),
      prisma.appointment.count({
        where: { professionalId, status: "CONFIRMED" },
      }),
      prisma.appointment.count({
        where: { professionalId, status: "CONCLUDED" },
      }),
      prisma.appointment.count({
        where: { professionalId, status: "CANCELLED" },
      }),
    ])

    return {
      success: true,
      stats: {
        total,
        pending,
        confirmed,
        completed,
        cancelled,
      },
    }
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error)
    return { success: false, error: "Falha ao buscar estatísticas" }
  }
}
