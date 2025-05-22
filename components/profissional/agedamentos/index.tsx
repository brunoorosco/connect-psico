"use client";
import React, { useState } from "react";
import AppointmentList from "./AppointmentList";
import CalendarHeader from "./CalendarHeader";
import AppointmentModal from "./AppointmentModal";
import { Calendar } from "@/components/ui/calendar";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Appointment, CalendarViewType } from "@/domain/model/appointment";
import { mockAppointments } from "./mockData";
import CalendarNavigation from "@/components/dashboard/CalendarNavigation";

const AppointmentCalendar: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarViewType>("daily");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const { toast } = useToast();

  const handleSaveAppointment = (appointment: Appointment) => {
    if (editingAppointment) {
      // Update existing appointment
      setAppointments(appointments.map((apt) => (apt.id === appointment.id ? appointment : apt)));

      toast({
        title: "Consulta atualizada",
        description: `A consulta de ${appointment.patient} foi atualizada com sucesso.`,
      });
    } else {
      // Add new appointment
      setAppointments([...appointments, appointment]);

      toast({
        title: "Consulta agendada",
        description: `Nova consulta para ${appointment.patient} agendada com sucesso.`,
      });
    }

    setIsModalOpen(false);
    setEditingAppointment(null);
  };

  const handleAddAppointment = (date: Date) => {
    setSelectedDate(date);
    setEditingAppointment(null);
    setIsModalOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    // setSelectedDate(parseISO(appointment.createdAt));
    setIsModalOpen(true);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    //@ts-ignore
    return appointments.filter((apt) => apt.date === dateStr);
  };

  const renderCalendarContent = () => {
    if (view === "daily") {
      return (
        <div className="flex flex-col space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </h3>
                <Button onClick={() => handleAddAppointment(selectedDate)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Consulta
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {Array.from({ length: 12 }).map((_, i) => {
                  const hour = i + 8; // Start from 8 AM
                  const timeStr = `${hour.toString().padStart(2, "0")}:00`;
                  const appointmentsAtTime = appointments.filter(
                    (apt) =>
                      //@ts-ignore
                      apt.date === format(selectedDate, "yyyy-MM-dd") &&
                      //@ts-ignore
                      apt.startTime.startsWith(hour.toString().padStart(2, "0"))
                  );

                  return (
                    <div key={i} className="flex border-t py-2">
                      <div className="w-16 text-gray-500 font-medium">{timeStr}</div>
                      <div className="flex-1 min-h-[50px]">
                        {appointmentsAtTime.length > 0 ? (
                          <div className="space-y-1">
                            {appointmentsAtTime.map((apt) => (
                              <div
                                key={apt.id}
                                className="bg-medical-light border-l-4 border-medical p-2 rounded cursor-pointer"
                                onClick={() => handleEditAppointment(apt)}
                              >
                                <div className="font-medium">{/* {apt.patientName} */}</div>
                                <div className="text-xs text-gray-500">
                                  {/* {apt.startTime} - {apt.endTime} */}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <button
                            className="w-full h-full min-h-[50px] rounded border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:bg-gray-50"
                            onClick={() => handleAddAppointment(selectedDate)}
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
    }

    if (view === "weekly") {
      const startDate = startOfWeek(selectedDate, { locale: ptBR });
      const endDate = endOfWeek(selectedDate, { locale: ptBR });
      const days = eachDayOfInterval({ start: startDate, end: endDate });

      return (
        <div className="flex flex-col space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-end mb-4">
                <Button onClick={() => handleAddAppointment(selectedDate)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Consulta
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-2 overflow-y-auto">
                {days.map((day, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex flex-col border rounded cursor-pointer p-2 h-min-50 overflow-y-auto",
                      isToday(day) ? "bg-medical-light border-medical" : ""
                    )}
                    onClick={() => {
                      setSelectedDate(day);
                      handleAddAppointment(day);
                    }}
                  >
                    <div className="text-center mb-2">
                      <div className="text-xs text-gray-500">
                        {format(day, "EEEEEE", { locale: ptBR })}
                      </div>
                      <div
                        className={cn("text-sm font-medium", isToday(day) ? "text-medical" : "")}
                      >
                        {format(day, "dd")}
                      </div>
                    </div>

                    <div className="flex-1 space-y-1">
                      {getAppointmentsForDate(day).map((apt) => (
                        <div
                          key={apt.id}
                          className="bg-medical-light border-l-2 border-medical p-1 rounded text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAppointment(apt);
                          }}
                        >
                          {/* <div className="font-medium truncate">{apt.patientName}</div>
                          <div className="text-gray-500">{apt.startTime}</div> */}
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
    }

    // Monthly view
    return (
      <div className="flex flex-col space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
              </h3>
              <Button onClick={() => handleAddAppointment(selectedDate)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Consulta
              </Button>
            </div>

            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              locale={ptBR}
              className="rounded-md border pointer-events-auto"
              classNames={{
                day_today: "bg-medical-light text-medical-dark font-bold",
                day_selected: "bg-medical !text-white hover:bg-medical focus:bg-medical",
              }}
              components={{
                DayContent: (props) => {
                  const date = props.date;
                  const dayAppointments = getAppointmentsForDate(date);

                  return (
                    <div className="flex flex-col items-center w-full h-full">
                      <div
                        className={cn(
                          "flex items-center justify-center",
                          // @ts-ignore
                          props.selected ? "text-white" : ""
                        )}
                      >
                        {format(date, "d")}
                      </div>
                      {dayAppointments.length > 0 && (
                        <div className="w-full flex justify-center mt-1">
                          <div
                            className={cn(
                              "h-1 w-1 rounded-full",
                              //@ts-ignore
                              props.selected ? "bg-white" : "bg-medical"
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
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <CalendarNavigation selectedDate={selectedDate} onDateChange={setSelectedDate} />
        </div>
        <div className="md:col-span-1">
          <CalendarHeader
            currentDate={selectedDate}
            view={view}
            onViewChange={setView}
            onDateChange={setSelectedDate}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">{renderCalendarContent()}</div>

        <div className="md:col-span-1">
          <AppointmentList
            appointments={appointments}
            selectedDate={selectedDate}
            onEditAppointment={handleEditAppointment}
            view={view}
          />
        </div>
      </div>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAppointment(null);
        }}
        onSave={handleSaveAppointment}
        selectedDate={selectedDate}
        editingAppointment={editingAppointment}
      />
    </div>
  );
};

export default AppointmentCalendar;
