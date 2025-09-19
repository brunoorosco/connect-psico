"use server"
import { TProfessional } from "@/domain/model/professional"
import { User } from "@/domain/model/user"
import { prisma } from "@/lib/db"

type GetProfessionalByIdResult = Pick<
  User,
  "id" | "name" | "email" | "active" | "phone" | "createdAt" | "updatedAt" | "image"
> &
  TProfessional

export const getProfessionalByUsername = async (username: string): Promise<GetProfessionalByIdResult | null> => {
  const user = await prisma.user.findMany({
    where: { active: true, role: "SUPERVISOR", Professional: { username } },
    select: {
      id: true,
      name: true,
      email: true,
      active: true,
      phone: true,
      Professional: true,
      image: true,
    },
  })

  if (!user || user.length === 0) return null
  const { Professional, ...restUser } = user[0]

  return {
    ...restUser,
    ...(Professional || {}),
  } as GetProfessionalByIdResult
}
