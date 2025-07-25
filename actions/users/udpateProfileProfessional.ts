"use server";

import { prisma } from "@/lib/db";
import { profileSchema, ProfileFormValues } from "@/schemas/PsicologoProfileSchema";
import type { z } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

/**
 * Atualiza o perfil profissional do usuário
 * @param {string} userId - ID do usuário a ser atualizado.
 * @param {z.infer<typeof profileSchema>} data - Dados atualizados do perfil.
 * @returns {Promise<{error?: string, success?: string}>}
 */
export const updateProfessionalProfile = async (
  userId: string,
  data: z.infer<typeof profileSchema>
) => {
  const valid = await profileSchema.safeParseAsync(data);

  if (!valid.success) {
    return {
      error: "Dados inválidos. Verifique os campos e tente novamente.",
    };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone.replace(/\D/g, ""),
        image: data.profilePhoto,
        Professional: {
          upsert: {
            create: {
              bio: data.bio,
              numConselho: data.numConselho,
              ufConselho: data.ufConselho,
              education: data.education,
              experiencia: data.experiencia,
              isProfileCompleted: data.isProfileCompleted,
              especialidade: data.especialidade,
              valorAtendimento: data.valorAtendimento,
              tempoConsulta: data.tempoConsulta,
              publicoAlvo: data.publicoAlvo,
              tipoAtendimento: data.tipoAtendimento,
            },
            update: {
              bio: data.bio,
              numConselho: data.numConselho,
              ufConselho: data.ufConselho,
              education: data.education,
              experiencia: data.experiencia,
              isProfileCompleted: data.isProfileCompleted,
              especialidade: data.especialidade,
              valorAtendimento: data.valorAtendimento,
              tempoConsulta: data.tempoConsulta,
              publicoAlvo: data.publicoAlvo,
              tipoAtendimento: data.tipoAtendimento,
            },
          },
        },
      },
    });

    return {
      success: "Perfil atualizado com sucesso!",
    };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          error: "Já existe um usuário com este e-mail ou telefone.",
        };
      }
    }
    console.error(error);
    return {
      error: "Erro inesperado ao atualizar o perfil.",
    };
  }
};
