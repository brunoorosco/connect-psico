import { findResetPasswordTokenByToken } from "@services/auth"
import { findUserbyEmail } from "@services/index"

/**
 * Verifica se o token é válido antes de mostrar o formulário
 * @param {string | null} token - O token de reset de senha
 * @returns {Promise<{valid: boolean, error?: string}>} O resultado da validação
 */
export const validateResetToken = async (token: string | null) => {
  if (!token) {
    return { valid: false, error: "Token não encontrado" }
  }

  const existingToken = await findResetPasswordTokenByToken(token)

  if (!existingToken) {
    return { valid: false, error: "Token inválido ou já utilizado" }
  }

  const hasExpired = new Date(existingToken.expires) < new Date()
  if (hasExpired) {
    return { valid: false, error: "Token expirado. Solicite uma nova redefinição de senha." }
  }

  const existingUser = await findUserbyEmail(existingToken.email)
  if (!existingUser) {
    return { valid: false, error: "Usuário não encontrado" }
  }

  return { valid: true }
}
