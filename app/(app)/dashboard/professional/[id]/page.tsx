"use client";

import { professionalById } from "@/actions/auth/professional";
import PsychologistProfile, { TProfessional } from "@/components/PsychoProfile";
import { useParams } from "next/navigation";
import { useEffect, useState, startTransition } from "react";

export type TPsychologistProfile = {
  name: string;
  image: string;
  Professional: TProfessional[];
  onBack?: () => void;
};

const ProfessionalProfile = () => {
  const [profile, setProfile] = useState<TPsychologistProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();

  useEffect(() => {
    if (!id) return; // Evita chamadas desnecessárias se o id não existir
    startTransition(async () => {
      const data = await professionalById(id as string);

      if ("error" in data) {
        setError(data.error); // Se for um erro, salva no estado de erro
      } else if (data) {
        setProfile({
          ...data,
          Professional: Array.isArray(data.professional)
            ? data.professional
            : [data.professional],
        });
      }
    });
  }, [id]);

  if (!profile) {
    return <p>Carregando...</p>; // Evita erro de renderização antes da carga dos dados
  }

  return (
    <PsychologistProfile
      professional={profile.Professional[0]}
      name={profile.name}
      image={profile.image}
    />
  );
};

export default ProfessionalProfile;
