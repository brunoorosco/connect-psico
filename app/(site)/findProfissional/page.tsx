'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// import { supabase } from "@/integrations/supabase/client";
// import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import { TherapistFilter } from "@/components/profissional/TherapistFilter";
import { TherapistCard } from "@/components/profissional/TherapistCard";
import { TherapistDetails } from "@/components/profissional/TherapistDetails";
import { useSession } from "next-auth/react";

const FindTherapist = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedTherapist, setSelectedTherapist] = useState<string | null>(null);
  const [localSession, setLocalSession] = useState(null);
  const navigate = useRouter();
  
  const { data: session, status} = useSession()

  useEffect(() => {
    if (status === 'authenticated') {
      setLocalSession(session as any);
    } else {
      setLocalSession(null);
    }
  }, [session, status]);

  const therapists = [
    {
      id: "1",
      name: "Dra. Maria Silva",
      specialty: "Terapia Cognitivo-Comportamental",
      image: "/placeholder.svg",
      bio: "Especialista em TCC com 10 anos de experiência",
      price: "R$ 150,00",
    },
    {
      id: "2",
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

  const handleChatClick = (therapistId: string) => {
    if (!session) {
      toast.info("É necessário fazer login para iniciar uma conversa");
      
      // Store the therapist ID in localStorage so we can return to it after login
      localStorage.setItem("selectedTherapistId", therapistId.toString());
      
      // Redirect to login page
      navigate.push("/login");
      return;
    }
    
    // If user is logged in, show the therapist details
    setSelectedTherapist(therapistId);
  };

  return (
    <>
      <Navbar />
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
            //   onChatClick={() => handleChatClick(therapist.id)}
            />
          ))}
        </div>

        <TherapistDetails
          open={selectedTherapist !== null}
          onClose={() => setSelectedTherapist(null)}
          therapistId={selectedTherapist}
        //   onChatClick={handleChatClick}
        />
      </div>
    </>
  );
};
export default FindTherapist;