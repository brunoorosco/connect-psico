export type AvailableSlot = {
  date: Date;
  time: string;
}

export type ProfessionalModel = {
    id: string;
    name: string;
    image: string;
    especialidade: string[];
    experiencia?: string;
    abordagem: string;
    bio: string;
    valorAtendimento: string;
    education: string;
    publicoAlvo: string;
    numConselho: string;
    ufConselho: string;
    tipoAtendimento: "remote" | "presential" | "both"
  };