import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Appointment } from '@/types/appointment';

interface DailyViewProps {
  selectedDate: Date;
  appointments: Appointment[];
  onAddAppointment: (date: Date) => void;
  onEditAppointment: (appointment: Appointment) => void;
}

const DailyView: React.FC<DailyViewProps> = ({
  selectedDate,
  appointments,
  onAddAppointment,
  onEditAppointment
}) => {
  return (
    <div className="flex flex-col space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </h3>
            <Button onClick={() => onAddAppointment(selectedDate)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Consulta
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {Array.from({ length: 12 }).map((_, i) => {
              const hour = i + 8; // Start from 8 AM
              const timeStr = `${hour.toString().padStart(2, '0')}:00`;
              const appointmentsAtTime = appointments.filter(apt => 
                apt.date === format(selectedDate, 'yyyy-MM-dd') && 
                apt.startTime.startsWith(hour.toString().padStart(2, '0'))
              );
              
              return (
                <div key={i} className="flex border-t py-2">
                  <div className="w-16 text-gray-500 font-medium">
                    {timeStr}
                  </div>
                  <div className="flex-1 min-h-[50px]">
                    {appointmentsAtTime.length > 0 ? (
                      <div className="space-y-1">
                        {appointmentsAtTime.map(apt => (
                          <div 
                            key={apt.id} 
                            className="bg-medical-light border-l-4 border-medical p-2 rounded cursor-pointer"
                            onClick={() => onEditAppointment(apt)}
                          >
                            <div className="font-medium">{apt.patientName}</div>
                            <div className="text-xs text-gray-500">
                              {apt.startTime} - {apt.endTime}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <button 
                        className="w-full h-full min-h-[50px] rounded border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:bg-gray-50"
                        onClick={() => onAddAppointment(selectedDate)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        <span className="text-sm">Adicionar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyView;