type Part = { PartNumber: number, ETag: string }
type SessionState = { uploadId: string, key: string, parts: Part[] }

const mem = new Map<string, SessionState>()

export const state = {
  set(sessionId: string, s: SessionState) { mem.set(sessionId, s) },
  get(sessionId: string) { return mem.get(sessionId) || null },
  addPart(sessionId: string, part: Part) {
    const s = mem.get(sessionId); if (!s) return
    // evita duplicados / sobrescreve pelo PartNumber
    const idx = s.parts.findIndex(p => p.PartNumber === part.PartNumber)
    if (idx >= 0) s.parts[idx] = part; else s.parts.push(part)
  },
  del(sessionId: string) { mem.delete(sessionId) },
}