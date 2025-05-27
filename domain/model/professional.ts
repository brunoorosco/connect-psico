import { User } from "./user";

export type AvailableSlot = {
  date: Date;
  time: string;
};

type Professional = {
  id: number;
  especialidade: string[];
  experiencia?: string;
  abordagem: string;
  bio: string;
  isProfileCompleted: boolean
  valorAtendimento: string;
  education: string;
  tempoConsulta: number
  publicoAlvo: string[];
  numConselho: string;
  ufConselho: string;
  tipoAtendimento: "remote" | "presential" | "both";
  createdAt: Date;
  udpatedAt: Date;
  phone: string
};

export type ProfessionalModel = Professional & User;
