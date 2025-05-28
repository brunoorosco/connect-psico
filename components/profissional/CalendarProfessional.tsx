import React, { useState, useEffect, startTransition, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { ProfessionalModel } from "@/domain/model/professional";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import { fetchProfessionalSchedule } from "@/hooks/useProfissionals";
import { createAppointment } from "@/actions/appointments";

type ProfessionalProps = {
  professionalData: ProfessionalModel;
};

export const CalendarProfessional: React.FC<ProfessionalProps> = ({ professionalData }) => {
  const { data: session, status } = useSession();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableDatesSet, setAvailableDatesSet] = useState<Set<string>>(new Set());

  const {
    data: agendaProfissional,
    error,
    isLoading,
    mutate,
  } = useSWR(
    professionalData.id && selectedDate
      ? ["/professional-schedule", professionalData.id, selectedDate]
      : null,
    () => fetchProfessionalSchedule(professionalData.id, selectedDate),
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (!agendaProfissional || agendaProfissional.length === 0) {
      setAvailableSlots([]);
      setAvailableDatesSet(new Set());
      return;
    }

    // Slots para horários
    const slots: string[] = agendaProfissional.map((interval: { start: Date }) => {
      const start = new Date(interval.start);
      start.setHours(start.getHours() + 3);
      return format(start, "HH:mm");
    });
    setAvailableSlots(slots);

    // Datas disponíveis (sem duplicatas) para o calendário
    const dates = new Set(
      agendaProfissional.map((interval: { start: Date }) =>
        format(new Date(interval.start), "yyyy-MM-dd")
      )
    );
    setAvailableDatesSet(dates);
  }, [agendaProfissional]);

  const combineDateAndTime = (date: Date, timeString: string): Date => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const combinedDate = new Date(date);
    combinedDate.setHours(hours - 3, minutes, 0, 0);
    return combinedDate;
  };

  const handleScheduleAppointment = () => {
    if (!selectedDate || !selectedSlot || !agendaProfissional) return;

    startTransition(async () => {
      const result = await createAppointment({
        patientId: session?.user.id as string,
        professionalId: professionalData.id,
        appointmentDate: combineDateAndTime(selectedDate, selectedSlot),
      });
      if (result.error) {
        toast.error("Erro ao enviar mensagem", {
          description: result.error,
        });
        return;
      }

      toast.success("Agendamento solicitado!", {
        description: `Consulta com ${professionalData.name} agendada para ${format(
          selectedDate,
          "dd/MM/yyyy"
        )} às ${selectedSlot}.`,
      });
      mutate();
    });
  };

  return (
    <TabsContent value="schedule" className="pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm">Selecione uma data:</h4>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date: Date | undefined) =>
              date && (setSelectedDate(date), setSelectedSlot(null))
            }
            locale={ptBR}
            className={cn("rounded-md border pointer-events-auto max-w-none w-full")}
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const dateStr = format(date, "yyyy-MM-dd");

              return date < today || date.getDay() === 0 || !availableDatesSet.has(dateStr);
            }}
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
                  className={
                    selectedSlot === slot ? "bg-therapy-primary hover:bg-therapy-tertiary" : ""
                  }
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

          {selectedDate && selectedSlot && status === "authenticated" && (
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
