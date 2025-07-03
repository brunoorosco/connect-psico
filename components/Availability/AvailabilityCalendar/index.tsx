import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { ptBR } from "date-fns/locale";
import DayScheduleModal from "../DayScheduleModal";
import { CustomCalendarDay } from "./CustomCalendarDay";
import { WeeklySchedule, DayAvailability } from "@/presentation/pages/availability";
import { useAvailabilityLogic } from "@/hooks/useAvailabilityService";

interface AvailabilityCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  weeklySchedules: WeeklySchedule[];
  dayAvailabilities: DayAvailability[];
  onDayAvailabilityUpdate: (dayAvailability: DayAvailability) => void;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
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
