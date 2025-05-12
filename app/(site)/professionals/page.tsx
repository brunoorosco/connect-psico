"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import { TherapistFilter } from "@/components/profissional/TherapistFilter";
import { ProfessionalCard } from "@/components/profissional/TherapistCard";
import { ProfessionalDetailsModal } from "@/components/profissional/TherapistDetails";
import { useSession } from "next-auth/react";
import { useProfessionalsFetcher } from "@/hooks/useProfissionals";

const FindTherapist = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedTherapist, setSelectedTherapist] = useState<any | null>(null);
  const [localSession, setLocalSession] = useState(null);
  const [allProfessionals, setProfessionals] = useState<any[]>([]);

  const navigate = useRouter();

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      setLocalSession(session as any);
    } else {
      setLocalSession(null);
    }
  }, [session, status]);

  const { professionals, total, loading, fetchProfessionals } = useProfessionalsFetcher();
  useEffect(() => {
    fetchProfessionals(1, 10);
  }, []);

  allProfessionals.filter((t: any) => t.especialidade?.includes(selectedSpecialty));

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
          <h1 className="text-3xl font-bold text-therapy-primary">Encontre seu Terapeuta</h1>
          <TherapistFilter
            selectedSpecialty={selectedSpecialty}
            onSpecialtyChange={setSelectedSpecialty}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => <TherapistCardSkeleton key={index} />)
            : Array.isArray(professionals) &&
              professionals.map((therapist: any) => (
                <ProfessionalCard
                  key={therapist.id}
                  professional={therapist}
                  onSelect={() => setSelectedTherapist(therapist)}
                />
              ))}
        </div>

        <ProfessionalDetailsModal
          open={selectedTherapist !== null}
          // onClose={() => setSelectedTherapist(null)}
          onOpenChange={() => setSelectedTherapist(null)}
          professional={selectedTherapist}
        />
      </div>
    </>
  );
};
export default FindTherapist;

const TherapistCardSkeleton = () => {
  return (
    <div className="animate-pulse rounded-xl border p-4 shadow-md space-y-4 bg-white">
      <div className="h-32 bg-gray-200 rounded-md" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-6 bg-gray-200 rounded w-full" />
    </div>
  );
};
