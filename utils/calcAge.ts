/**
 * Calcula idade a partir da data de nascimento
 * @param birthDate - Data de nascimento (Date ou string no formato yyyy-mm-dd)
 * @returns idade em anos (number) ou null se inválido
 */
export function calcularIdade(birthDate: Date | string): number | null {
  if (!birthDate) return null

  const hoje = new Date()
  const nascimento = typeof birthDate === "string" ? new Date(birthDate) : birthDate

  // ⚠️ Verifica se é uma data válida
  if (!(nascimento instanceof Date) || isNaN(nascimento.getTime())) {
    return null
  }

  let idade = hoje.getFullYear() - nascimento.getFullYear()
  const mes = hoje.getMonth() - nascimento.getMonth()

  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--
  }

  return idade
}
