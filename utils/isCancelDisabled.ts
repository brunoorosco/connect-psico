import { isBefore, subHours } from "date-fns"

/**
 * Verifica se o botão de cancelamento deve estar desabilitado
 * @param sessionDate Data e hora agendada da sessão
 * @returns true se o botão deve estar desabilitado
 */
export function isCancelDisabled(sessionDate: Date) {
  const now = new Date()
  const limit = subHours(sessionDate, 2) // limite = 2h antes da sessão

  // Se já passou do limite → desabilita o botão
  console.log(limit, now)
  return isBefore(limit, now)
}
