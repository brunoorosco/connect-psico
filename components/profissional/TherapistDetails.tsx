
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, Calendar } from "lucide-react";
import { useState } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface TherapistDetailsProps {
  open: boolean;
  onClose: () => void;
  therapistId: number | null;
}

export const TherapistDetails = ({
  open,
  onClose,
  therapistId,
}: TherapistDetailsProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Mock data - this should come from your backend
  const therapist = {
    id: 1,
    name: "Dra. Maria Silva",
    specialty: "Terapia Cognitivo-Comportamental",
    image: "/placeholder.svg",
    bio: "Especialista em TCC com 10 anos de experiência",
    price: "R$ 150,00",
    education: [
      "Doutorado em Psicologia Clínica - USP",
      "Especialização em TCC - Instituto Beck",
    ],
    languages: ["Português", "Inglês"],
    approach: "Utilizo a Terapia Cognitivo-Comportamental para ajudar meus pacientes a identificarem e modificarem padrões de pensamento e comportamento que causam sofrimento.",
  };

  if (!therapistId) return null;

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Profissional</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <img
                src={therapist.image}
                alt={therapist.name}
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h3 className="text-xl font-semibold">{therapist.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {therapist.specialty}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Formação</h4>
                <ul className="list-disc list-inside text-sm">
                  {therapist.education.map((edu, index) => (
                    <li key={index}>{edu}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Idiomas</h4>
                <p className="text-sm">{therapist.languages.join(", ")}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Abordagem</h4>
                <p className="text-sm">{therapist.approach}</p>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  Agendar
                </Button>
                <Button variant="outline" className="flex-1">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Mensagem
                </Button>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Disponibilidade</h4>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
