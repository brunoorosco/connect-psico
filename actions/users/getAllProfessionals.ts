"use server";
import { prisma } from "@/lib/db";

interface PaginationParams {
  page?: number;
  limit?: number;
  specialty?: string;
}

export async function getProfessionalUsers({ page = 1, limit = 10, specialty }: PaginationParams) {
  const skip = (page - 1) * limit;

  const where: any = {
    role: "SUPERVISOR",
    active: true,
    Professional: {
      isProfileCompleted: true,
      visivel: true,
    },
  };

  if (specialty && specialty!=='none') {
    // Assumindo que Professional possui campo 'especialidade' do tipo string ou array de strings
    // Ajuste se for diferente (ex: array, JSON, etc)
    where.Professional.especialidade = {
      has: specialty,
    };
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      include: {
        Professional: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  // Remove campos sensíveis manualmente, cria objeto final
  const mappedUsers = users.map((user) => {
    const {
      password,
      isTwoFactorAuthEnabled,
      twoFactorAuthVerified,
      emailVerified,
      Professional,
      ...restUser
    } = user;

    // Caso Professional seja undefined, garantir objeto vazio
    const professionalData = Professional ?? {};

    return {
      ...restUser,
      ...professionalData,
    };
  });

  return {
    data: mappedUsers,
    total,
    page,
    lastPage: Math.ceil(total / limit),
  };
}
