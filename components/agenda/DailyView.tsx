import React from "react";
import {
  format,
  isSameDay,
  getHours,
  addMinutes,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppointmentModel } from "@/domain/model/appointment";

interface DailyViewProps {
  selectedDate: Date;
  appointments: AppointmentModel[];
  onAddAppointment: (date: Date) => void;
  onEditAppointment: (appointment: AppointmentModel) => void;
}

const DailyView: React.FC<DailyViewProps> = ({
  selectedDate,
  appointments,
  onAddAppointment,
  onEditAppointment,
}) => {
  return (
    <div className="flex flex-col space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium hidden sm:block">
              {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </h3>
            <Button onClick={() => onAddAppointment(selectedDate)} className="text-gray-50 sm:w-40 w-full">
              <Plus className="h-4 w-4 mr-2" />
              Nova Consulta
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {Array.from({ length: 14 }).map((_, i) => {
              const hour = i + 7; // Começa às 9h
              const timeStr = `${hour.toString().padStart(2, "0")}:00`;

              const appointmentsAtTime = appointments.filter((apt) => {
                return (
                  isSameDay(apt.appointmentDate, selectedDate) &&
                  new Date(apt.appointmentDate).getHours()  === hour
                );
              });
              const blockDateTime = setMilliseconds(
                setSeconds(setMinutes(setHours(selectedDate, hour), 0), 0),
                0
              );

              return (
                <div key={i} className="flex border-t py-2">
                  <div className="w-16 text-gray-500 font-medium">{timeStr}</div>

                  <div className="flex-1 min-h-[50px]">
                    {appointmentsAtTime.length > 0 ? (
                      <div className="space-y-1 flex w-full">
                        {appointmentsAtTime
                        .sort((a, b) => a.appointmentDate.getTime() - b.appointmentDate.getTime())
                        .map((apt) => {
                          
                         const startTime = format(apt.appointmentDate, "HH:mm", { locale: ptBR });
                          return (
                            <div
                              key={apt.id}
                              className="bg-medical-light border-l-4 border-medical p-2 rounded cursor-pointer flex-1"
                              onClick={() => onEditAppointment(apt)}
                            >
                              <div className="font-medium">{apt.patient.name}</div>
                              <div className="text-xs text-gray-500">{startTime}</div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <button
                        className="w-full h-full min-h-[50px] rounded border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:bg-gray-50"
                        onClick={() => onAddAppointment(blockDateTime)}
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
