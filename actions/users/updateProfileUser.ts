"use server"

import { prisma } from "@/lib/db"
import type { z } from "zod"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { userSchemaProfile } from "@/domain/model/user"
import { deleteImageFromCloudinary } from "@/actions/deleteImage"

/**
 * Atualiza o perfil profissional do usuário
 * @param {string} userId - ID do usuário a ser atualizado.
 * @param {z.infer<typeof userSchemaProfile>} data - Dados atualizados do perfil.
 * @returns {Promise<{error?: string, success?: string}>}
 */
export const updateUserProfile = async (userId: string, data: z.infer<typeof userSchemaProfile>) => {
  const valid = await userSchemaProfile.safeParseAsync(data)

  if (!valid.success) {
    return {
      error: "Dados inválidos. Verifique os campos e tente novamente.",
    }
  }

  try {
    // Se houver uma nova foto, deletar a antiga antes de atualizar
    if (data.image) {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { image: true }
      })

      if (currentUser?.image && currentUser.image !== data.image) {
        // Deletar a imagem antiga do Cloudinary
        // console.log("🗑️ Deletando imagem antiga do usuário DEFAULT:", currentUser.image)
        await deleteImageFromCloudinary(currentUser.image)
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.telefone.replace(/\D/g, ""),
        image: data.image,
      },
    })

    return {
      success: "Perfil atualizado com sucesso!",
    }
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          error: "Já existe um usuário com este e-mail ou telefone.",
        }
      }
    }
    console.error(error)
    return {
      error: "Erro inesperado ao atualizar o perfil.",
    }
  }
}
