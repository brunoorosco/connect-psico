import { TimeInterval } from "@/schemas/PsicologoProfileSchema";

// export type Professional = {
//   id: string;
//   name: string;
//   profilePhoto?: string;
//   specialties: string[];
//   experience: number;
//   approach: string;
//   sessionPrice: number;
//   sessionDuration: number;
//   appointmentType: "remote" | "presential" | "both";
//   availableDays: string[];
//   availableHours: TimeInterval[];
// }

export type AvailableSlot = {
  date: Date;
  time: string;
}

export type ProfessionalModel = {
    id: string;
    name: string;
    image: string;
    Professional: Professional[];
  };
  type Professional = {
    especialidade: string[];
    abordagem: string;
    bio: string;
    valorAtendimento: string;
    education: string;
    publicoAlvo: string;
    numConselho: string;
    ufConselho: string;
    tipoAtendimento: "remote" | "presential" | "both"
  };