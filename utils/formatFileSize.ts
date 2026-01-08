export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

  // Calcula o índice da unidade (0 para Bytes, 1 para KB, etc)
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  // Retorna o valor formatado com 2 casas decimais (ou 0 se for Bytes)
  return parseFloat((bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 2)) + " " + sizes[i]
}

export const isPreviewable = (fileType: string): boolean => {
  const previewableTypes = ["application/pdf", "image/jpeg", "image/png", "image/gif", "image/webp"]
  return previewableTypes.includes(fileType)
}
