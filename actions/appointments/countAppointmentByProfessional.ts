"use server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export const countAppointmentsByProfessional = async () => {
  const session = await auth();
  if (!session) {
    throw new Error("User not found");
  }

  const resp = await prisma.appointment.count({
    where: {
      professionalId: session.user.id,
    },
  });
  return { total: resp}
};

export const countcompletedConsultations = async () => {
  return {
    completedConsultations: 95,
  };
};
export const countScheduledConsultations = async () => {
  return {
    scheduledConsultations: 30,
  };
};
export const countPendingConsultations = async () => {
  return {
    pendingConsultations: 10,
  };
};
export const countRemoteConsultations = async () => {
  return {
    remoteConsultations: 50,
  };
};
export const countInPersonConsultations = async () => {
  return {
    inPersonConsultations: 85,
  };
};
