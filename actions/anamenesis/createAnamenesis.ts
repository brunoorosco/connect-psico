"use server"
import { AnamnesisAdultModel, AnamnesisAdultSchema } from "@/domain/model/anamenese"
import { prisma } from "@/lib/db"

// export const AnamnesisService = {
//   async update(userId: string, data: Partial<AnamnesisAdultModel>) {
//     // Zod parcial (permite atualizar só alguns campos)
//     const validated = AnamnesisAdultSchema.partial().parse(data)

//     return prisma.anamnesisAdult.update({
//       where: { userId },
//       data: validated,
//     })
//   },

//   async getByUserId(userId: string) {
//     return prisma.anamnesisAdult.findUnique({
//       where: { userId },
//     })
//   },
// }

export const anamnesisCreate =async (data: AnamnesisAdultModel & { userId: string }) => {
  // Valida com Zod
  const validated = AnamnesisAdultSchema.parse(data)

  return await prisma.anamnesisAdult.create({
    data: validated,
  })
}

export const getAnamnesisByToken =async (token: string) => {
  const resp = await prisma.anamnesisTokens.findFirst({ where: { token: token } })
  console.log('resp :>> ', resp);
  return resp
}
