"use server"
import { ProfessionalModel } from "@/domain/model/professional"
import { User } from "@/domain/model/user"
import { prisma } from "@/lib/db"

type GetProfessionalByIdResult = Pick<
  User,
  "id" | "name" | "email" | "active" | "phone" | "createdAt" | "updatedAt" | "image"
> &
  Partial<ProfessionalModel>

export const getProfessionalById = async (id: string): Promise<GetProfessionalByIdResult | null> => {
  const user = await prisma.user.findUnique({
    where: { id, active: true },
    select: {
      id: true,
      name: true,
      email: true,
      active: true,
      createdAt: true,
      updatedAt: true,
      phone: true,
      Professional: true,
      image: true,
    },
  })

  if (!user) return null

  const { Professional, ...restUser } = user

  return {
    ...restUser,
    ...(Professional || {}),
  } as GetProfessionalByIdResult
}
