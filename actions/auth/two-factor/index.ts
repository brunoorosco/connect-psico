"use server"

import { sendOtpEmail } from "@/infra/email"
import { prisma } from "@/lib/db"
import { findUserbyEmail } from "@/services"
import { createTwoFactorAuthToken, findTwoFactorAuthTokeByToken, findTwoFactorAuthTokenByEmail } from "@/services/auth"
import type { User } from "@prisma/client"
import crypto from "node:crypto"

/**
 * This method sends an e-mail to the user with the 6 digits code to login
 * when Two Factor Authentication is enabled
 * @param {User} user
 * @param {string} token
 * @returns
 */
/**
 * This method sends an e-mail to the user with the 6 digits code to login
 * when Two Factor Authentication is enabled
 * @param {User} user - The user to send the verification email to.
 * @param {string} token - The verification token.
 * @returns {Promise<{ error?: string, success?: string }>} An object indicating the result of the operation.
 */
export const sendTwoFactorAuthEmail = async (user: User, token: string) => {
  const { OTP_SUBJECT } = process.env

  if (!OTP_SUBJECT) {
    return {
      error: "Configuração de ambiente insuficiente para envio de e-mail.",
    }
  }

  const { email } = user
  try {
    const { success, error } = await sendOtpEmail(email, token)
    if (!success)
      return {
        error,
      }
    return {
      success: "E-mail enviado com sucesso",
    }
  } catch (error) {
    return { error }
  }
}

/**
 * This method updates the user's record with the date and time the
 * Two Factor Authentication was verified
 * @param token
 * @returns
 */
export const verifyTwoFactorToken = async (token: string) => {
  const existingToken = await findTwoFactorAuthTokeByToken(token)
  if (!existingToken) {
    return {
      error: "Código de verificação não encontrado",
    }
  }

  const isTokenExpired = new Date(existingToken.expires) < new Date()
  if (isTokenExpired) {
    return {
      error: "Código de verificação expirado",
    }
  }

  const user = await findUserbyEmail(existingToken.email)
  if (!user) {
    return {
      error: "Usuário não encontrado",
    }
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorAuthVerified: new Date(),
      },
    })

    await prisma.twoFactorToken.delete({
      where: {
        id: existingToken.id,
      },
    })

    return {
      success: "Autênticação de dois fatores verificada",
    }
  } catch (err) {
    return { error: "Erro ao verificar o  código de autenticação de 2 fatores" }
  }
}

/**
 * Reenvia o código OTP para o e-mail do usuário
 */
export const resendOtpCode = async (email: string) => {
  if (!email) {
    return { error: "E-mail não informado" }
  }

  try {
    const existingUser = await findUserbyEmail(email)

    if (!existingUser) {
      return { error: "Usuário não encontrado" }
    }

    const otpCode = await createTwoFactorAuthToken(email)

    // Envia o e-mail
    await sendOtpEmail(email, otpCode.token)

    return { success: "Código reenviado com sucesso" }
  } catch {
    return { error: "Erro ao reenviar código" }
  }
}
