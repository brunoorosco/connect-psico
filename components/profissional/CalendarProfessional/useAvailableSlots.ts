import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import useSWR from "swr";
import { fetchProfessionalSchedule } from "@/hooks/useProfissionals";

export function useAvailableSlots(professionalId: number, selectedDate: Date) {
  const [availableSlots, setAvailableSlots] = useState<{ start: Date }[]>([]);

  const { data, error, isLoading, mutate } = useSWR(
    professionalId && selectedDate
      ? ["/professional-schedule", professionalId, selectedDate]
      : null,
    () => fetchProfessionalSchedule(professionalId, selectedDate),
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (!data || data.length === 0) {
      setAvailableSlots([]);
      return;
    }

    const slots = data.map((interval: { start: string | Date }) => ({
      start: new Date(interval.start),
    }));

    setAvailableSlots(slots);
  }, [data]);

  const availableDatesSet = useMemo(() => {
    const unique = new Set<string>();
    for (const slot of availableSlots) {
      unique.add(format(slot.start, "yyyy-MM-dd"));
    }
    return unique;
  }, [availableSlots]);

  return {
    availableSlots,
    availableDatesSet,
    isLoading,
    error,
    mutate,
  };
}
