import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, Calendar } from "lucide-react";
import { useState } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { ProfessionalModel } from "./TherapistCard";

interface TherapistDetailsProps {
  open: boolean;
  onClose: () => void;
  therapist: ProfessionalModel | null;
}

export const TherapistDetails = ({ open, onClose, therapist }: TherapistDetailsProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { data: session, status } = useSession();

  console.log(therapist);

  if (!therapist) return null;

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Profissional</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <img
                src={therapist?.image}
                alt={therapist?.name}
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h3 className="text-xl font-semibold">{therapist?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {therapist?.Professional[0].publicoAlvo}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-xl font-semibold">Especialista</h4>
                <p className="text-sm text-muted-foreground">
                  {therapist?.Professional[0].especialidade.join(",  ")}
                </p>
              </div>
              <div>
                <h4 className="text-xl font-semibold">Bio</h4>
                <p className="text-sm text-muted-foreground">{therapist?.Professional[0].bio}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Formação</h4>
                <ul className="list-disc list-inside text-sm">
                  {therapist?.Professional[0].education}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Idiomas</h4>
                //
                {/* <p className="text-sm">{therapist.languages.join(", ")}</p> */}
              </div>
              <div>
                <h4 className="font-semibold mb-2">Abordagem</h4>
                <p className="text-sm">{therapist?.Professional[0].abordagem}</p>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" disabled={status === "unauthenticated"}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Agendar
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={status === "unauthenticated"}
                >
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
