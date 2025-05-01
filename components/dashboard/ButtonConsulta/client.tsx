'use client';
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export function ButtonStartClient({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  const handleStartConsultation = (patientId: string) => {
    window.location.href = `/dashboard/professional/${userId}/consulta?patientId=${patientId}`;
  };

  return (
    <Button
      size="sm"
      className="bg-therapy-primary hover:bg-therapy-primary/60 text-white"
      onClick={() => handleStartConsultation(id)}
    >
      <Calendar className="h-4 w-4 mr-1" />
      Iniciar
    </Button>
  );
}