import React from 'react';
import { Appointment } from '@/types/appointment';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AppointmentListProps {
  appointments: Appointment[];
  selectedDate: Date;
  onEditAppointment: (appointment: Appointment) => void;
  view: 'daily' | 'weekly' | 'monthly';
}

const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  selectedDate,
  onEditAppointment,
  view
}) => {
  // Filter appointments based on view and selected date
  const filteredAppointments = React.useMemo(() => {
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    
    if (view === 'daily') {
      return appointments.filter(apt => apt.date === selectedDateStr);
    } 
    
    if (view === 'weekly') {
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return appointments.filter(apt => {
        const aptDate = parseISO(apt.date as string);
        return aptDate >= startOfWeek && aptDate <= endOfWeek;
      });
    }
    
    // Monthly view
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    return appointments.filter(apt => {
      const aptDate = parseISO(apt.date as string);
      return aptDate.getFullYear() === year && aptDate.getMonth() === month;
    });
  }, [appointments, selectedDate, view]);

  // Sort appointments by date and time
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return a.startTime.localeCompare(b.startTime);
  });

  // Group appointments by date
  const appointmentsByDate = sortedAppointments.reduce((acc, apt) => {
    if (!acc[apt.date]) {
      acc[apt.date] = [];
    }
    acc[apt.date].push(apt);
    return acc;
  }, {} as Record<string, Appointment[]>);

  if (sortedAppointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Consultas</CardTitle>
          <CardDescription>
            {view === 'daily' 
              ? 'Nenhuma consulta agendada para hoje'
              : view === 'weekly'
                ? 'Nenhuma consulta agendada para esta semana'
                : 'Nenhuma consulta agendada para este mês'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Consultas</CardTitle>
          <CardDescription>
            {filteredAppointments.length} 
            {filteredAppointments.length === 1 
              ? ' consulta agendada' 
              : ' consultas agendadas'}
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-[60vh] overflow-y-auto">
          {Object.entries(appointmentsByDate).map(([date, appointments]) => (
            <div key={date} className="mb-6">
              {view !== 'daily' && (
                <h3 className="text-md font-medium mb-2 text-gray-700 border-b pb-1">
                  {format(parseISO(date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </h3>
              )}
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <div 
                    key={appointment.id} 
                    className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col justify-center h-full">
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {appointment.startTime} - {appointment.endTime}
                        </span>
                        <span className="font-medium">{appointment.patientName}</span>
                        {appointment.notes && (
                          <span className="text-xs text-gray-500 mt-1">{appointment.notes}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {appointment.isLinkedToMedicalRecord && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Prontuário vinculado
                        </Badge>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onEditAppointment(appointment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentList;