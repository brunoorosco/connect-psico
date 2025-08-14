const TZ_OFFSET = -3 // America/Sao_Paulo (UTC-3). Ajuste se necessário.

function getNowInTZ() {
  const now = new Date()
  // Ajuste simples de fuso, sem considerar horário de verão (o Brasil não usa mais)
  now.setHours(now.getUTCHours() + TZ_OFFSET)
  return now
}

export function inQuietHours(date = getNowInTZ()) {
  const h = date.getHours()
  return h >= 22 || h < 8 // 22:00–07:59
}

export function nextQuietEndISO(date = getNowInTZ()) {
  const next = new Date(date)
  if (date.getHours() < 8) {
    next.setHours(8, 0, 0, 0)
  } else {
    next.setDate(next.getDate() + 1)
    next.setHours(8, 0, 0, 0)
  }
  // volta para UTC pra salvar no banco
  next.setHours(next.getHours() - TZ_OFFSET)
  return next.toISOString()
}

export function addMinutesISO(minutes: number, base = new Date()) {
  return new Date(base.getTime() + minutes * 60_000).toISOString()
}
