import React from 'react';
import { 
  eachDayOfInterval, 
  endOfWeek, 
  format, 
  isSameDay, 
  isToday, 
  startOfWeek
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AppointmentModel } from '@/domain/model/appointment';

interface WeeklyViewProps {
  selectedDate: Date;
  appointments: AppointmentModel[];
  onAddAppointment: (date: Date) => void;
  onEditAppointment: (appointment: AppointmentModel) => void;
  onDateSelect: (date: Date) => void;
}

const WeeklyView: React.FC<WeeklyViewProps> = ({
  selectedDate,
  appointments,
  onAddAppointment,
  onEditAppointment,
  onDateSelect
}) => {
  const startDate = startOfWeek(selectedDate, { locale: ptBR });
  const endDate = endOfWeek(selectedDate, { locale: ptBR });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => isSameDay(apt.appointmentDate, date));
  };

  return (
    <div className="flex flex-col space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-end mb-4">
            <Button onClick={() => onAddAppointment(selectedDate)} className="text-gray-50 sm:w-40 w-full">
              <Plus className="h-4 w-4 mr-2" />
              Nova Consulta
            </Button>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, i) => (
              <div 
                key={i} 
                className={cn(
                  "flex flex-col border rounded cursor-pointer p-2 h-[calc(90vh-85px)] overflow-y-auto",
                  isToday(day) ? "bg-medical-light border-medical" : ""
                )}
                onClick={() => {
                  onDateSelect(day);
                  onAddAppointment(day);
                }}
              >
                <div className="text-center mb-2">
                  <div className="text-xs text-gray-500">
                    {format(day, 'EEEEEE', { locale: ptBR })}
                  </div>
                  <div className={cn(
                    "text-sm font-medium",
                    isToday(day) ? "text-medical" : ""
                  )}>
                    {format(day, 'dd')}
                  </div>
                </div>
                
                <div className="flex-1 space-y-1">
                  {getAppointmentsForDate(day).map(apt => (
                    <div 
                      key={apt.id} 
                      className="bg-medical-light border-l-2 border-medical p-1 rounded text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditAppointment(apt);
                      }}
                    >
                      <div className="font-medium truncate">{apt.patient.name}</div>
                      <div className="text-gray-500">
                        {format(apt.appointmentDate, 'HH:mm')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyView;
