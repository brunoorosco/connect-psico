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

export const anamnesisCreate = (data: AnamnesisAdultModel & { userId: string }) => {
  // Valida com Zod
  const validated = AnamnesisAdultSchema.parse(data)

  return prisma.anamnesisAdult.create({
    data: validated,
  })
}
