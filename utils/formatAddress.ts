export const formatAddress = (
  street: string,
  number: string,
  neighborhood: string,
  city: string,
  state: string,
  cep: string
): string => {
  const addressParts: string[] = []

  // Adiciona rua e número (se ambos existirem)
  if (street?.trim() && number?.trim()) {
    addressParts.push(`${street.trim()}, ${number.trim()}`)
  } else if (street?.trim()) {
    addressParts.push(street.trim())
  } else if (number?.trim()) {
    addressParts.push(number.trim())
  }

  // Adiciona bairro
  if (neighborhood?.trim()) {
    addressParts.push(neighborhood.trim())
  }

  // Adiciona cidade e estado
  const cityStateParts: string[] = []
  if (city?.trim()) {
    cityStateParts.push(city.trim())
  }
  if (state?.trim()) {
    cityStateParts.push(state.trim())
  }
  if (cityStateParts.length > 0) {
    addressParts.push(cityStateParts.join(" - "))
  }

  // Adiciona CEP
  if (cep?.trim()) {
    addressParts.push(cep.trim())
  }

  // Retorna endereço formatado ou "-" se vazio
  return addressParts.length > 0 ? addressParts.join(" - ") : "-"
}

// Uso:

