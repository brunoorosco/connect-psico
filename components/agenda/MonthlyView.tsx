import React from "react";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { AppointmentModel } from "@/domain/model/appointment";

interface MonthlyViewProps {
  selectedDate: Date;
  appointments: AppointmentModel[];
  onAddAppointment: (date: Date) => void;
  onDateSelect: (date: Date | undefined) => void;
}
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

const MonthlyView: React.FC<MonthlyViewProps> = ({
  selectedDate,
  appointments,
  onAddAppointment,
  onDateSelect,
}) => {
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter((apt) => isSameDay(apt.appointmentDate, date));
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          {/* <h3 className="text-lg font-medium">
            {format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
          </h3> */}
          <Button onClick={() => onAddAppointment(selectedDate)} className="text-gray-50">
            <Plus className="h-4 w-4 mr-2" />
            Nova Consulta
          </Button>
        </div>

        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          locale={ptBR}
          className="rounded-md border w-full"
          classNames={calendarClassNames}
          components={{
            DayContent: ({ date }) => {
              const dayAppointments = getAppointmentsForDate(date);
              const isSelected = selectedDate && isSameDay(selectedDate, date);

              return (
                <div className="flex flex-col items-center justify-center h-full w-full cursor-pointer group">
                  <div
                    className={cn(
                      "flex items-center justify-center",
                      isSelected ? "text-white" : ""
                    )}
                  >
                    {format(date, "d")}
                  </div>
                  {dayAppointments.length > 0 && (
                    <div className="w-full flex justify-center mt-1">
                      <div
                        className={cn(
                          "h-1 w-1 rounded-full",
                          isSelected ? "bg-gray-500" : "bg-medical"
                        )}
                      />
                    </div>
                  )}
                </div>
              );
            },
          }}
        />
      </CardContent>
    </Card>
  );
};

export default MonthlyView;
