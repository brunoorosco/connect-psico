import React from 'react';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { AppointmentModel } from '@/domain/model/appointment';

interface MonthlyViewProps {
  selectedDate: Date;
  appointments: AppointmentModel[];
  onAddAppointment: (date: Date) => void;
  onDateSelect: (date: Date | undefined) => void;
}

const MonthlyView: React.FC<MonthlyViewProps> = ({
  selectedDate,
  appointments,
  onAddAppointment,
  onDateSelect
}) => {
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => isSameDay(apt.appointmentDate, date));
  };

  return (
    <div className="flex flex-col space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
            </h3>
            <Button onClick={() => onAddAppointment(selectedDate)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Consulta
            </Button>
          </div>
          
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            locale={ptBR}
            className="rounded-md border pointer-events-auto"
            classNames={{
              day_today: "bg-medical-light text-medical-dark font-bold",
              day_selected: "bg-medical !text-white hover:bg-medical focus:bg-medical",
            }}
            components={{
              DayContent: ({ date }) => {
                const dayAppointments = getAppointmentsForDate(date);
                const isSelected = selectedDate && isSameDay(selectedDate, date);
                
                return (
                  <div className="flex flex-col items-center w-full h-full">
                    <div className={cn("flex items-center justify-center", isSelected ? "text-white" : "")}>
                      {format(date, 'd')}
                    </div>
                    {dayAppointments.length > 0 && (
                      <div className="w-full flex justify-center mt-1">
                        <div className={cn(
                          "h-1 w-1 rounded-full",
                          isSelected ? "bg-white" : "bg-medical"
                        )} />
                      </div>
                    )}
                  </div>
                );
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyView;
