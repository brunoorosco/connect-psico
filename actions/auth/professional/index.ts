"use server";

import { PsychologistProfileProps } from "@/components/PsychoProfile";
import { prisma } from "@/lib/db";

const mockData = [
  {
    id: "1",
    name: "Dra. Maria Silva",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
    bio: "Psicóloga clínica com mais de 10 anos de experiência em terapia cognitivo-comportamental, especializada em ansiedade e depressão.",
    specialties: [
      { id: 1, name: "Terapia Cognitivo-Comportamental" },
      { id: 2, name: "Ansiedade" },
      { id: 3, name: "Depressão" },
      { id: 4, name: "Desenvolvimento Pessoal" },
    ],
    experience: "10+ anos de prática clínica",
    education: "Mestrado em Psicologia Clínica - USP",
    price: "R$ 200,00 / sessão",
    rating: 4.9,
    reviews: [
      {
        id: 1,
        author: "João P.",
        content:
          "Excelente profissional, muito atenciosa e competente. Me ajudou muito com questões de ansiedade.",
        rating: 5,
      },
      {
        id: 2,
        author: "Ana M.",
        content: "Ótimas sessões, ambiente acolhedor e muito profissionalismo.",
        rating: 5,
      },
      {
        id: 3,
        author: "Carlos R.",
        content: "Recomendo fortemente! Profissional extremamente capacitada.",
        rating: 4,
      },
    ],
  },
];

type Teste = PsychologistProfileProps | { error: string };

export const professionalById = async (id: string): Promise<Teste> => {
  const professional = await prisma.user.findFirst({
    where: { id: "cm7ay7v7800010dl881sy8dv5" },
    omit: {
      password: true,
      emailVerified: true,
      isTwoFactorAuthEnabled: true,
      twoFactorAuthVerified: true,
    },
    include: {
      Professional: {
        include: {
          Comentarios: true,
        },
      },
    },
  });
  if (!professional) {
    return { error: "Usuário não encontrado" };
  }
  console.log(professional);
  return professional;
};
