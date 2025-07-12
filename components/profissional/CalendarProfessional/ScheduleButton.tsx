import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { createAppointment } from "@/actions/appointments";
import { IScheduleButton } from "./types";

export function ScheduleButton({ selectedSlot, userId, professional, onSuccess }: IScheduleButton) {
  const [isLoading, setIsLoading] = useState(false);
  const handleClick = async () => {
    setIsLoading(true);
    try {
      const result = await createAppointment({
        patientId: userId,
        professionalId: professional.userId,
        appointmentDate: selectedSlot.start,
      });

      if (result.error) {
        toast.error("Erro ao agendar", { description: result.error });
        return;
      }

      toast.success("Agendamento solicitado!", {
        description: `Consulta com ${professional.name} agendada para ${format(
          selectedSlot.start,
          "dd/MM/yyyy"
        )} às ${format(selectedSlot.start, "HH:mm")}.`,
      });

      onSuccess();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <Button
        className="w-full bg-therapy-primary hover:bg-therapy-tertiary"
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? "Aguardando..." : "Agendar consulta"}
      </Button>
      <p className="text-xs text-center mt-2 text-muted-foreground">
        {format(selectedSlot.start, "dd 'de' MMMM", { locale: ptBR })} às {format(selectedSlot.start, "HH:mm")}
      </p>
    </div>
  );
}
