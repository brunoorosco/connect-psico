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
        Professional: {
          some: {},
        },
      },
      skip,
      take: limit,
      include: {
        Professional: true,
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
        Professional: {
          some: {},
        },
      },
    }),
  ]);
  return {
    data: users,
    total,
    page,
    lastPage: Math.ceil(total / limit),
  };
}
