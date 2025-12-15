export const sanitizeTaxId = (value?: string | null) => {
  if (!value) return null
  const digits = value.replace(/\D/g, "")
  if (digits.length === 11 || digits.length === 14) return digits
  return null
}

const isRepeatedSequence = (digits: string) => digits.split("").every((char) => char === digits[0])

export const isValidCpf = (digits: string) => {
  if (digits.length !== 11 || isRepeatedSequence(digits)) return false

  const calcDigit = (slice: string, factor: number) => {
    const total = slice.split("").reduce((sum, char, index) => sum + Number(char) * (factor - index), 0)
    const rest = (total * 10) % 11
    return rest === 10 ? 0 : rest
  }

  const firstDigit = calcDigit(digits.slice(0, 9), 10)
  const secondDigit = calcDigit(digits.slice(0, 10), 11)

  return firstDigit === Number(digits[9]) && secondDigit === Number(digits[10])
}

export const isValidCnpj = (digits: string) => {
  if (digits.length !== 14 || isRepeatedSequence(digits)) return false

  const calcDigit = (slice: string, multipliers: number[]) => {
    const total = slice.split("").reduce((sum, char, index) => sum + Number(char) * multipliers[index], 0)
    const rest = total % 11
    return rest < 2 ? 0 : 11 - rest
  }

  const firstDigit = calcDigit(digits.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const secondDigit = calcDigit(digits.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])

  return firstDigit === Number(digits[12]) && secondDigit === Number(digits[13])
}

export const getValidTaxId = (value?: string | null) => {
  const digits = sanitizeTaxId(value)
  if (!digits) return null
  if (digits.length === 11 && isValidCpf(digits)) return digits
  if (digits.length === 14 && isValidCnpj(digits)) return digits
  return null
}
