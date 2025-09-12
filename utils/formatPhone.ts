export function formatPhone(phone?: string) {
  if (!phone) return "-"

  // remove tudo que não é número
  const digits = phone.replace(/\D/g, "")

  // se tiver 11 dígitos -> (XX) XXXXX-XXXX
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }

  // se tiver 10 dígitos -> (XX) XXXX-XXXX
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
  }

  // se não encaixar em formatos conhecidos, retorna apenas os números
  return digits
}
