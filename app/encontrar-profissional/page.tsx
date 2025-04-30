"use client"

import { Filter, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TherapistCard } from "@/components/profissional/TherapistCard";
import { TherapistFilter } from "@/components/profissional/TherapistFilter";
import { TherapistDetails } from "@/components/profissional/TherapistDetails";
import { useState } from "react";

const FindTherapist = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedTherapist, setSelectedTherapist] = useState<number | null>(null);

  // Temporary mock data - this should come from your backend
  const therapists = [
    {
      id: 1,
      name: "Dra. Maria Silva",
      specialty: "Terapia Cognitivo-Comportamental",
      image: "/placeholder.svg",
      bio: "Especialista em TCC com 10 anos de experiência",
      price: "R$ 150,00",
    },
    {
      id: 2,
      name: "Dr. João Santos",
      specialty: "Psicanálise",
      image: "/placeholder.svg",
      bio: "Psicanalista com foco em traumas e ansiedade",
      price: "R$ 180,00",
    },
  ];

  const filteredTherapists = selectedSpecialty
    ? therapists.filter((t) => t.specialty === selectedSpecialty)
    : therapists;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Encontre seu Terapeuta</h1>
        <TherapistFilter
          selectedSpecialty={selectedSpecialty}
          onSpecialtyChange={setSelectedSpecialty}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTherapists.map((therapist) => (
          <TherapistCard
            key={therapist.id}
            therapist={therapist}
            onSelect={() => setSelectedTherapist(therapist.id)}
          />
        ))}
      </div>

      <TherapistDetails
        open={selectedTherapist !== null}
        onClose={() => setSelectedTherapist(null)}
        therapistId={selectedTherapist}
      />
    </div>
  );
};

export default FindTherapist;
