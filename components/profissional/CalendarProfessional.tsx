import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { ProfessionalModel } from "@/domain/model/professional";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import useSWR from 'swr';
import { fetchProfessionalSchedule } from "@/hooks/useProfissionals";

type ProfessionalProps = {
  professionalData: ProfessionalModel;
};

export const CalendarProfessional: React.FC<ProfessionalProps> = ({ professionalData }) => {
  const { data: session } = useSession();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const { data: agendaProfissional, error, isLoading, mutate } = useSWR(
    professionalData.id && selectedDate ? ['/professional-schedule', professionalData.id, selectedDate] : null,
    () => fetchProfessionalSchedule(professionalData.id, selectedDate),
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (!selectedDate || !agendaProfissional || agendaProfissional.length === 0) {
      setAvailableSlots([]);
      return;
    }

    const slots: string[] = agendaProfissional.map((interval: any) => {
      const start = new Date(interval.start);
      return format(start, "HH:mm");
    });

    setAvailableSlots(slots);
  }, [selectedDate, agendaProfissional]);

  const handleScheduleAppointment = () => {
    if (!selectedDate || !selectedSlot || !agendaProfissional) return;

    toast.success("Agendamento solicitado!", {
      description: `Consulta com ${agendaProfissional.name} agendada para ${format(
        selectedDate,
        "dd/MM/yyyy"
      )} às ${selectedSlot}.`,
    });
  };

  return (
    <TabsContent value="schedule" className="pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium mb-2">Selecione uma data:</h4>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date: Date | undefined) => date && setSelectedDate(date)}
            locale={ptBR}            
            className={cn("rounded-md border", "pointer-events-auto")}
          />
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Horários disponíveis:</h4>

          <div className="grid grid-cols-3 gap-2 min-h-[100px]">
            {isLoading ? (
              <p className="text-muted-foreground col-span-3">Carregando horários...</p>
            ) : error ? (
              <p className="text-muted-foreground col-span-3">Erro ao carregar agenda.</p>
            ) : availableSlots.length > 0 ? (
              availableSlots.map((slot) => (
                <Button
                  key={slot}
                  variant={selectedSlot === slot ? "default" : "outline"}
                  className={selectedSlot === slot ? "bg-therapy-primary hover:bg-therapy-tertiary" : ""}
                  onClick={() => setSelectedSlot(slot)}
                >
                  {slot}
                </Button>
              ))
            ) : (
              <p className="text-muted-foreground col-span-3">
                Não há horários disponíveis para esta data.
              </p>
            )}
          </div>

          {selectedDate && selectedSlot && (
            <div className="mt-6">
              <Button
                className="w-full bg-therapy-primary hover:bg-therapy-tertiary"
                onClick={handleScheduleAppointment}
              >
                Agendar consulta
              </Button>
              <p className="text-xs text-center mt-2 text-muted-foreground">
                {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })} às {selectedSlot}
              </p>
            </div>
          )}
        </div>
      </div>
    </TabsContent>
  );
};
