import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import axios from "axios";

export async function GET(request: Request) {
  try {
    // validarCRP('SP', '123456', '6');
    const mockData = {
      name: "John Doe",
      email: `john${Math.floor(Math.random() * 1000)}@example.com`,
      password: "hashedPassword123", // supondo que já está hash
      phone: "11999999999",
      numConselho: "12345678",
      ufConselho: "SP",
    };

    const result = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: mockData.name,
          email: mockData.email,
          password: mockData.password,
          phone: mockData.phone,
          role: UserRole.SUPERVISOR,
        },
      });
      const data = {
        userId: createdUser.id,
        numConselho: mockData.numConselho,
        ufConselho: mockData.ufConselho,
        // publicoAlvo: ["adultos", "adolescentes"],
        // especialidade: ["psicologia clínica"],
        //abordagem: "Cognitivo-comportamental",
      };
      const createdProfessional = await tx.professional.create({
        data,
      });

      return { user: createdUser, professional: createdProfessional };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 });
  }
}

async function validarCRP(uf: string, numero: string, digito: string) {
  try {
    const response = await axios.post("https://cadastro.cfp.org.br/api/consulta-profissional", {
      uf,
      numero,
      digito,
    });

    return response.data;
  } catch (error) {
    console.error("Erro ao validar CRP:", error);
    return null;
  }
}
