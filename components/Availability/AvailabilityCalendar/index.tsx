// AvailabilityCalendar.tsx
import React, { useCallback } from "react";
import { format, getDay, isSameMonth } from "date-fns"; // + isSameMonth, format, getDay
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { ptBR } from "date-fns/locale";
import DayScheduleModal from "../DayScheduleModal";
import { CustomCalendarDay } from "./CustomCalendarDay";
import { useAvailabilityLogic } from "@/hooks/useAvailabilityService";
import { IAvailabilityCalendar } from "./types";

const calendarClassNames = {
  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
  month: "space-y-4 flex-1",
  table: "w-full border-collapse space-y-1",
  head_row: "flex w-full",
  head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem] text-center",
  row: "flex w-full gap-1",
  cell: "relative h-20 w-full text-center text-sm transition-colors duration-150 hover:bg-transparent focus-within:z-10",
  day: "h-full w-full p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md",
  day_today: "ring-1 ring-medical text-medical-dark font-bold",
  day_selected: "bg-[#5847ebaa] text-white font-semibold  hover:text-white",
};

export const AvailabilityCalendar: React.FC<IAvailabilityCalendar> = ({
  selectedDate,
  onDateSelect,
  weeklySchedules,
  dayAvailabilities,
  onDayAvailabilityUpdate,
}) => {
  const {
    editingDate,
    setEditingDate,
    currentMonth,
    setCurrentMonth,
    // getAvailabilityForDate (vamos ignorar o do hook e fazer um com "gating" aqui)
  } = useAvailabilityLogic(selectedDate, weeklySchedules, dayAvailabilities);

  // >>> FIX PRINCIPAL: disponibilidade para o DIA respeitando o MÊS VISÍVEL (currentMonth)
  const getAvailabilityForVisibleMonth = useCallback(
    (d: Date) => {
      // 1) Se há registro diário salvo (banco/estado), ele SEMPRE vence
      const key = format(d, "yyyy-MM-dd");
      const fromDb = dayAvailabilities.find((da) => da.date === key);
      if (fromDb) return fromDb.timeSlots;

      // 2) Fallback do semanal APENAS se o dia pertence ao MÊS VISÍVEL
      if (!isSameMonth(d, currentMonth)) return [];

      const dow = getDay(d); // 0..6 (Dom..Sáb)
      const week = weeklySchedules.find((w) => w.dayOfWeek === dow);
      return week?.timeSlots ?? [];
    },
    [dayAvailabilities, weeklySchedules, currentMonth]
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Calendário de Disponibilidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              month={currentMonth}
              onSelect={(date) => date && onDateSelect(date)}
              locale={ptBR}
              onMonthChange={(month) => {
                // >>> NÃO troque o selectedDate aqui (isso polui a seleção)
                setCurrentMonth(new Date(month.getFullYear(), month.getMonth(), 1));
                // Remover esta linha evita efeitos colaterais:
                // onDateSelect(month);
              }}
              className="rounded-md border w-full"
              classNames={calendarClassNames}
              components={{
                DayContent: ({ date }) => (
                  <CustomCalendarDay
                    date={date}
                    selectedDate={selectedDate} // só para estilo/hoje/selecionado, se quiser
                    getAvailabilityForDate={getAvailabilityForVisibleMonth} // <<< usa o "gated"
                    onClick={setEditingDate}
                  />
                ),
              }}
            />
          </div>
        </CardContent>
      </Card>

      {editingDate && (
        <DayScheduleModal
          key={editingDate.toISOString()}
          date={editingDate}
          isOpen={!!editingDate}
          onClose={() => setEditingDate(null)}
          dayAvailabilities={dayAvailabilities}
          weeklySchedules={weeklySchedules}
          onDayAvailabilityUpdate={onDayAvailabilityUpdate}
        />
      )}
    </>
  );
};

export default AvailabilityCalendar;
