"use client";

import React, { useState, useEffect, startTransition, useMemo, useCallback } from "react";
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
  const [availableSlots, setAvailableSlots] = useState<{ start: Date }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date } | null>(null);

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
  const availableDatesSet = useMemo(() => {
    const unique = new Set<string>();
    for (const slot of availableSlots) {
      const dateStr = format(slot.start, "yyyy-MM-dd");
      unique.add(dateStr);
    }
    return unique;
  }, [availableSlots]);

  const isDayDisabled = useCallback(
    (date: Date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dateStr = format(date, "yyyy-MM-dd");

      return date < today || !availableDatesSet.has(dateStr);
    },
    [availableDatesSet]
  );

  useEffect(() => {
    if (!agendaProfissional || agendaProfissional.length === 0) {
      setAvailableSlots([]);
      return;
    }

    const slots = agendaProfissional.map((interval: { start: string | Date }) => {
      const start = new Date(interval.start);
      start.setHours(start.getHours()); // ajuste para fuso se necessário
      return { start };
    });

    setAvailableSlots(slots);
  }, [agendaProfissional]);

  const handleScheduleAppointment = () => {
    if (!selectedSlot || !session?.user?.id) return;
    startTransition(async () => {
      const result = await createAppointment({
        patientId: session?.user.id as string,
        professionalId: professionalData.id,
        appointmentDate: selectedSlot.start,
      });

      if (result.error) {
        toast.error("Erro ao agendar", { description: result.error });
        return;
      }

      toast.success("Agendamento solicitado!", {
        description: `Consulta com ${professionalData.name} agendada para ${format(
          selectedSlot.start,
          "dd/MM/yyyy"
        )} às ${format(selectedSlot.start, "HH:mm")}.`,
      });

      mutate();
    });
  };
  const slotsForSelectedDate = availableSlots.filter(
    ({ start }) => format(start, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
  );

  return (
    <TabsContent value="schedule" className="pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendário */}
        <div>
          <h4 className="text-sm">Selecione uma data:</h4>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date: Date | undefined) => {
              if (date) {
                setSelectedDate(date);
                setSelectedSlot(null);
              }
            }}
            locale={ptBR}
            className={cn("rounded-md border pointer-events-auto max-w-none w-full")}
            disabled={isDayDisabled}
          />
        </div>

        {/* Horários disponíveis */}
        <div>
          <h4 className="text-sm font-medium mb-2">Horários disponíveis:</h4>

          <div className="grid grid-cols-3 gap-2 min-h-[100px]">
            {isLoading ? (
              <p className="text-muted-foreground col-span-3">Carregando horários...</p>
            ) : error ? (
              <p className="text-muted-foreground col-span-3">Erro ao carregar agenda.</p>
            ) : slotsForSelectedDate.length > 0 ? (
              slotsForSelectedDate.map((slot) => {
                const formatted = format(slot.start, "HH:mm");

                return (
                  <Button
                    key={slot.start.toISOString()}
                    variant={
                      selectedSlot?.start.getTime() === slot.start.getTime() ? "default" : "outline"
                    }
                    className={
                      selectedSlot?.start.getTime() === slot.start.getTime()
                        ? "bg-therapy-primary hover:bg-therapy-tertiary"
                        : ""
                    }
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {formatted}
                  </Button>
                );
              })
            ) : (
              <p className="text-muted-foreground col-span-3">
                Não há horários disponíveis para esta data.
              </p>
            )}
          </div>

          {selectedSlot && status === "authenticated" && (
            <div className="mt-6">
              <Button
                className="w-full bg-therapy-primary hover:bg-therapy-tertiary"
                onClick={handleScheduleAppointment}
              >
                Agendar consulta
              </Button>
              <p className="text-xs text-center mt-2 text-muted-foreground">
                {format(selectedSlot.start, "dd 'de' MMMM", { locale: ptBR })} às{" "}
                {format(selectedSlot.start, "HH:mm")}
              </p>
            </div>
          )}
        </div>
      </div>
    </TabsContent>
  );
};
