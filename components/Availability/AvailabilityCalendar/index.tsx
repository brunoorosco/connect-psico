import React from "react";
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
  cell: "relative h-16 w-full text-center text-sm transition-colors duration-150 hover:bg-transparent focus-within:z-10",
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
  const { editingDate, setEditingDate, currentMonth, setCurrentMonth, getAvailabilityForDate } =
    useAvailabilityLogic(selectedDate, weeklySchedules, dayAvailabilities);

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
                setCurrentMonth(month);
                onDateSelect(month);
              }}
              className="rounded-md border w-full"
              classNames={calendarClassNames}
              components={{
                DayContent: ({ date }) => (
                  <CustomCalendarDay
                    date={date}
                    selectedDate={selectedDate}
                    getAvailabilityForDate={getAvailabilityForDate}
                    onClick={setEditingDate}
                  />
                ),
              }}
            />

            <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span>Com disponibilidade</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full" />
                  <span>Sem disponibilidade</span>
                </div>
              </div>
              <span className="text-xs">Clique em um dia para editar</span>
            </div>
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
