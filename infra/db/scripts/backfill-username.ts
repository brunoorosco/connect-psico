import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

const RESERVED = new Set(["admin", "api", "login", "signup", "settings", "me", "docs", "app"])

function createUsername(fullName: string) {
  const parts = fullName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .split(/\s+/)

  if (parts.length === 1) return parts[0].toLowerCase()

  const first = parts[0].toLowerCase()
  const last = parts[parts.length - 1].toLowerCase()

  return `${first}.${last}`
}

async function run() {
  const BATCH = 100
  let skip = 0
  while (true) {
    const users = await prisma.user.findMany({
      where: { Professional: { username: null }, role: "SUPERVISOR" },
      select: { id: true, name: true, email: true },
      take: BATCH,
      skip,
      orderBy: { id: "asc" },
    })
    if (users.length === 0) break
    console.log("Quantidade de Usuarios:",users.length)
    for (const u of users) {
      const baseRaw = u.name?.trim() || u.email.split("@")[0]
      const nickname = createUsername(baseRaw)
      console.log("Nome::", u, " | username:: ", nickname)
      const resp = await prisma.professional.update({ where: { userId: u.id }, data: { username: nickname } })
      console.log("Sucesso::", resp.userId)
    }
    if (users.length < BATCH) break
    skip += BATCH
  }
  console.log("Backfill concluído")
}

run().finally(() => prisma.$disconnect())
