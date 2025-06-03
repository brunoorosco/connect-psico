'use client'
import React, { useEffect, useState } from 'react';
import { CalendarViewType } from '@/types/appointment';
import AppointmentList from './AppointmentList';
import CalendarHeader from './CalendarHeader';
import AppointmentModal from './AppointmentModal';
import DailyView from './DailyView';
import WeeklyView from './WeeklyView';
import MonthlyView from './MonthlyView';
import { useToast } from '@/components/ui/use-toast';
import { AppointmentModel } from '@/domain/model/appointment';

type Props = {
  appointments: AppointmentModel[]
};

const AppointmentCalendar = ({appointments}: Props)=> {
  // const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarViewType>('daily');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<AppointmentModel | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch appointments from the server
    // setAppointments(fetchedAppointments);
  }, []);

  const handleSaveAppointment = (appointment: AppointmentModel) => {
    if (editingAppointment) {
      // Update existing appointment
      // setAppointments(appointments.map(apt => 
      //   apt.id === appointment.id ? appointment : apt
      // ));
      
      toast({
        title: "Consulta atualizada",
        description: `A consulta de ${appointment.patient.name} foi atualizada com sucesso.`
      });
    } else {
      // Add new appointment
      // setAppointments([...appointments, appointment]);
      
      toast({
        title: "Consulta agendada",
        description: `Nova consulta para ${appointment.patient.name} agendada com sucesso.`
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

  const handleEditAppointment = (appointment: AppointmentModel) => {
    setEditingAppointment(appointment);
    setSelectedDate(appointment.appointmentDate)
    setIsModalOpen(true);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const renderCalendarContent = () => {
    if (view === 'daily') {
      return (
        <DailyView
          selectedDate={selectedDate}
          appointments={appointments}
          onAddAppointment={handleAddAppointment}
          onEditAppointment={handleEditAppointment}
        />
      );
    }
    
    if (view === 'weekly') {
      return (
        <WeeklyView
          selectedDate={selectedDate}
          appointments={appointments}
          onAddAppointment={handleAddAppointment}
          onEditAppointment={handleEditAppointment}
          onDateSelect={setSelectedDate}
        />
      );
    }
    
    // Monthly view
    return (
      <MonthlyView
        selectedDate={selectedDate}
        appointments={appointments}
        onAddAppointment={handleAddAppointment}
        onDateSelect={handleDateSelect}
      />
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <CalendarHeader 
        currentDate={selectedDate}
        view={view}
        onViewChange={setView}
        onDateChange={setSelectedDate}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {renderCalendarContent()}
        </div>
        
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
