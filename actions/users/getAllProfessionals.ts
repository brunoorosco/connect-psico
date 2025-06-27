"use server";
import { prisma } from "@/lib/db";

interface PaginationParams {
  page?: number;
  limit?: number;
}

export async function getProfessionalUsers({ page = 1, limit = 10 }: PaginationParams) {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: "SUPERVISOR",
        active: true,
        Professional: {
          isProfileCompleted: true,
        },
      },
      skip,
      take: limit,
      include: {
        Professional: { omit: { id: true } },
      },
      omit: {
        password: true,
        isTwoFactorAuthEnabled: true,
        twoFactorAuthVerified: true,
        emailVerified: true,
      },
    }),
    prisma.user.count({
      where: {
        role: "SUPERVISOR",
        Professional: {
          isProfileCompleted: true,
        },
      },
    }),
  ]);
  const mappedUsers = users.map((user) => {
    const { Professional, ...restUser } = user;

    // Pega o primeiro professional, caso exista
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
