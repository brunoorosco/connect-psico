import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      id: "cm7160cum000012pxyao5055w",
      name: "Bruno Orosco",
      email: "brunoorosco@gmail.com",
      emailVerified: new Date(),
      image: "https://example.com/avatar1.png",
      phone: "+5511940714391",
      role: "ADMIN",
      password: "$2a$10$b63pPPvrsOlDDByzkNoRj.4qsd.3E8XzdrNXaFkPBHeAF6l6QFi4u",
      isTwoFactorAuthEnabled: false,
      twoFactorAuthVerified: "",
    },
  });

  console.log("✅ Seed executado com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
