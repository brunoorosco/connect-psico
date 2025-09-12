import { PrismaClient } from "@prisma/client"
import { createHash } from "crypto"
const prisma = new PrismaClient()

const RESERVED = new Set(["admin", "api", "login", "signup", "settings", "me", "docs", "app"])

function slugify(s: string) {
  return (
    s
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "") // remove acentos
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-+/g, "-")
      .slice(0, 30) || "user"
  )
}

async function findUniqueUsername(base: string) {
  let candidate = base
  let n = 1
  // limite de tentativas razoável
  while (true) {
    if (!RESERVED.has(candidate)) {
      const exists = await prisma.professional.findFirst({ where: { username: candidate }, select: { id: true } })
      if (!exists) return candidate
    }
    n++
    candidate = `${base}-${n}`
    if (candidate.length > 35) candidate = `${base.slice(0, 28)}-${n}`
  }
}

async function run() {
  const BATCH = 500
  let skip = 0
  while (true) {
    const users = await prisma.professional.findMany({
      where: { username: null },
      select: { id: true, name: true, email: true },
      take: BATCH,
      skip,
      orderBy: { id: "asc" },
    })
    if (users.length === 0) break

    for (const u of users) {
      const baseRaw = u.name?.trim() || u.email.split("@")[0]
      const base = slugify(baseRaw)
      const username = await findUniqueUsername(base)
      await prisma.user.update({ where: { id: u.id }, data: { username } })
    }
    if (users.length < BATCH) break
    skip += BATCH
  }
  console.log("Backfill concluído")
}

run().finally(() => prisma.$disconnect())
