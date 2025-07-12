"use server";
import { prisma } from "@/lib/db";
type Params = {
  page?: number;
  limit?: number;
  search?: string;
  order?: "asc" | "desc";
  orderBy?: "name" | "email" | "createdAt";
};

export const getAllUsers = async ({
  page = 1,
  limit = 10,
  search,
  order,
  orderBy = "name",
}: Params) => {
  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: "insensitive" as const } },
          { name: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const users = await prisma.user.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {
      [orderBy]: order,
    },
  });

  const total = await prisma.user.count({ where });
  return { data: users, total };
};
