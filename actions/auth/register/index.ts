"use server"

import { prisma } from "@/lib/db"
import { RegisterSchema } from "@/schemas/auth"
import { createVerificationToken } from "@/services/auth"
import { UserRole } from "@prisma/client"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import bcryptjs from "bcryptjs"
import type { z } from "zod"
import { sendAccountVerificationEmail } from "../email-verification"
import { headers } from "next/headers"

/**
 * This method creates the user for Credentials provider
 * @param {z.infer<typeof RegisterSchema>} user - The new user data.
 * @returns {Promise<{error?: string, success?: string}>} The result of the password change request.
 */
export const register = async (user: z.infer<typeof RegisterSchema>) => {
  /* -------------------------------------------------
   * 🕳️ Honeypot (bots)
   * ------------------------------------------------- */
  if ((user as any).website) {
    return { error: "Cadastro inválido" }
  }

  const valid = await RegisterSchema.safeParse(user)

  if (!valid.success) {
    return {
      error: "Dados inválidos",
    }
  }

  const headersList = headers()

  const forwardedFor = headersList.get("x-forwarded-for")
  const realIp = headersList.get("x-real-ip")

  const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown"
  try {
    const { name, email, password } = user
    const hashedPassword = await bcryptjs.hash(password, 10)
    const createdUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isNewProfile: false,
        phone: user.phone.replace(/\D/g, ""),
        role: user.professional === true ? UserRole.SUPERVISOR : UserRole.DEFAULT,
        ipAddress: ip,
      },
    })

    if (user.professional) {
      await prisma.professional.create({
        data: {
          numConselho: user.numConselho,
          ufConselho: user.ufConselho,
          userId: createdUser.id, // assumindo que a tabela tem userId como FK
        },
      })
    }
    //Account verification flow with e-mail
    const verificationToken = await createVerificationToken(email)
    await sendAccountVerificationEmail(createdUser, verificationToken.token)
    return {
      success: "E-mail de verificação enviado",
    }
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          error: "Já existe uma conta relacionada a este e-mail.",
        }
      }
    }
    // return { error };

    throw error
  }
}
