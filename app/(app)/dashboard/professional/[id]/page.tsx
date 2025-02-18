"use client";

import { professionalById } from "@/actions/auth/professional";
import PsychologistProfile, {
  PsychologistProfileProps,
} from "@/components/PsychoProfile";
import { useParams } from "next/navigation";
import { useEffect, useState, startTransition } from "react";

const ProfessionalProfile = () => {
  const [profile, setProfile] = useState<PsychologistProfileProps | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();

  useEffect(() => {
    if (!id) return; // Evita chamadas desnecessárias se o id não existir
    startTransition(async () => {
      const data = await professionalById(id as string);

      if ("error" in data) {
        setError(data.error); // Se for um erro, salva no estado de erro
      } else if (data) {
        setProfile(data); // Se for um array de profissionais, pega o primeiro
      }
    });
  }, [id]);

  if (!profile) {
    return <p>Carregando...</p>; // Evita erro de renderização antes da carga dos dados
  }

  return <PsychologistProfile profile={profile} />;
};

export default ProfessionalProfile;
