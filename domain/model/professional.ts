import { User } from "./user";

export type AvailableSlot = {
  date: Date;
  time: string;
};

type Professional = {
  id: string;
  especialidade: string[];
  experiencia?: string;
  abordagem: string;
  bio: string;
  valorAtendimento: string;
  education: string;
  publicoAlvo: string;
  numConselho: string;
  ufConselho: string;
  tipoAtendimento: "remote" | "presential" | "both";
  createdAt: Date;
  udpatedAt: Date;
};

export type ProfessionalModel = Professional & User;
