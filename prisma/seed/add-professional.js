const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const professionals = [
  {
    id: 1,
    numConselho: "12345678",
    ufConselho: "SP",
    publicoAlvo: "Adultos e adolescentes",
    especialidade: [
      "Terapia Cognitivo-Comportamental",
      "Ansiedade",
      "Depressão",
      "Desenvolvimento Pessoal"
    ],
    abordagem: "Terapia Cognitivo-Comportamental",
    education: "Mestrado em Psicologia Clínica - USP",
    bio: "Psicóloga clínica com mais de 10 anos de experiência em terapia cognitivo-comportamental, especializada em ansiedade e depressão.",
    valorAtendimento: "R$ 200,00",
    userId: "user_1",
    Comentarios: {
      create: [
        {
          content: "Excelente profissional, muito atenciosa e competente. Me ajudou muito com questões de ansiedade.",
          rating: "5",
          userId: "user_2",
        },
        {
          content: "Ótimas sessões, ambiente acolhedor e muito profissionalismo.",
          rating: "5",
          userId: "user_3",
        },
        {
          content: "Recomendo fortemente! Profissional extremamente capacitada.",
          rating: "4",
          userId: "user_4",
        },
      ]
    }
  },
  {
    id: 2,
    numConselho: "87654321",
    ufConselho: "RJ",
    publicoAlvo: "Crianças e famílias",
    especialidade: [
      "Psicologia Infantil",
      "Terapia Familiar",
      "TDAH",
      "Autismo"
    ],
    abordagem: "Terapia Sistêmica",
    education: "Doutorado em Psicologia - UFRJ",
    bio: "Especialista em psicologia infantil e terapia familiar, com foco em TDAH e transtornos do espectro autista.",
    valorAtendimento: "R$ 250,00",
    userId: "user_5",
    Comentarios: {
      create: [
        {
          content: "Muito paciente e dedicada, ajudou meu filho a lidar com o TDAH.",
          rating: "5",
          userId: "user_6",
        },
        {
          content: "As sessões familiares foram transformadoras para nossa dinâmica.",
          rating: "4",
          userId: "user_7",
        }
      ]
    }
  },
  {
    id: 3,
    numConselho: "45678912",
    ufConselho: "MG",
    publicoAlvo: "Adultos",
    especialidade: [
      "Psicanálise",
      "Trauma",
      "Relacionamentos",
      "Estresse"
    ],
    abordagem: "Psicanálise",
    education: "Especialização em Psicanálise - PUC-MG",
    bio: "Psicanalista com experiência em traumas e questões relacionais, oferecendo um espaço seguro para reflexões profundas.",
    valorAtendimento: "R$ 180,00",
    userId: "user_8",
    Comentarios: {
      create: [
        {
          content: "Profissional muito acolhedora, me ajudou a entender melhor meus traumas.",
          rating: "5",
          userId: "user_9",
        },
        {
          content: "As sessões são intensas, mas muito enriquecedoras.",
          rating: "4",
          userId: "user_10",
        }
      ]
    }
  }
];

async function main() {
  for (const professional of professionals) {
    await prisma.professional.create({
      data: professional,
    });
  }
  console.log("Seed concluído!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });