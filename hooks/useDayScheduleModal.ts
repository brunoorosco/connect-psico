"use client";

import { useEffect, useState } from "react";
import { format, getDay } from "date-fns";
import { toast } from "sonner";
import { DayAvailability, TimeSlot, WeeklySchedule } from "@/presentation/pages/availability/types";

export function useDayScheduleModal(
  date: Date,
  isOpen: boolean,
  dayAvailabilities: DayAvailability[],
  weeklySchedules: WeeklySchedule[],
  onDayAvailabilityUpdate: (dayAvailability: DayAvailability) => void,
  onClose: () => void
) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const dateStr = format(date, "yyyy-MM-dd");
    const existingAvailability = dayAvailabilities.find((d) => d.date === dateStr);

    if (existingAvailability) {
      setTimeSlots(existingAvailability.timeSlots);
      setIsEditing(true);
    } else {
      const dayOfWeek = getDay(date);
      const weeklySchedule = weeklySchedules.find((w) => w.dayOfWeek === dayOfWeek);
      setTimeSlots(weeklySchedule?.timeSlots || []);
      setIsEditing(false);
    }
  }, [date, isOpen, dayAvailabilities, weeklySchedules]);

  const handleAddTimeSlot = (newSlot: Omit<TimeSlot, "id">) => {
    const timeSlot: TimeSlot = {
      ...newSlot,
      id: `${Date.now()}-${Math.random()}`,
    };
    setTimeSlots((prev) => [...prev, timeSlot]);
  };

  const handleRemoveTimeSlot = (slotId: string) => {
    setTimeSlots((prev) => prev.filter((slot) => slot.id !== slotId));
  };

  const handleSave = () => {
    const dateStr = format(date, "yyyy-MM-dd");

    const hasConflict = timeSlots.some((slot, index, arr) => {
      const [startHour1, startMinute1] = slot.startTime.split(":").map(Number);
      const [endHour1, endMinute1] = slot.endTime.split(":").map(Number);
      const start1 = startHour1 * 60 + startMinute1;
      const end1 = endHour1 * 60 + endMinute1;

      return arr.some((otherSlot, i) => {
        if (i === index) return false;

        const [startHour2, startMinute2] = otherSlot.startTime.split(":").map(Number);
        const [endHour2, endMinute2] = otherSlot.endTime.split(":").map(Number);
        const start2 = startHour2 * 60 + startMinute2;
        const end2 = endHour2 * 60 + endMinute2;

        return (start1 < end2 && end1 > start2) || (start1 >= start2 && end1 <= end2);
      });
    });

    if (hasConflict) {
      toast.error("Há intervalos sobrepostos ou inválidos. Corrija antes de salvar.");
      return;
    }

    onDayAvailabilityUpdate({ date: dateStr, timeSlots });
    onClose();
  };

  const sortedTimeSlots = [...timeSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));

  return {
    timeSlots,
    isEditing,
    sortedTimeSlots,
    handleAddTimeSlot,
    handleRemoveTimeSlot,
    handleSave,
  };
}
