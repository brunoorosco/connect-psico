import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, isSameDay, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { WeeklySchedule, DayAvailability } from '@/presentation/pages/availability';
import DayScheduleModal from './DayScheduleModal';
import { Clock, Edit } from 'lucide-react';

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
  onDayAvailabilityUpdate
}) => {
  const [editingDate, setEditingDate] = useState<Date | null>(null);

  const getAvailabilityForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayAvailability = dayAvailabilities.find(d => d.date === dateStr);
    
    if (dayAvailability) {
      return dayAvailability.timeSlots;
    }

    // Se não há disponibilidade específica, usa a programação semanal
    const dayOfWeek = getDay(date);
    const weeklySchedule = weeklySchedules.find(w => w.dayOfWeek === dayOfWeek);
    return weeklySchedule?.timeSlots || [];
  };

  const handleDateClick = (date: Date) => {
    setEditingDate(date);
  };

  const handleCloseModal = () => {
    setEditingDate(null);
  };

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
              onSelect={(date) => date && onDateSelect(date)}
              locale={ptBR}
              className="rounded-md border w-full"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
                month: "space-y-4 flex-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex w-full",
                head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem] text-center",
                row: "flex w-full mt-2",
                cell: "relative h-16 w-full text-center text-sm p-1 focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
                day: "h-full w-full p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md",
                day_today: "bg-medical-light text-medical-dark font-bold",
                day_selected: "bg-medical !text-white hover:bg-medical focus:bg-medical",
              }}
              components={{
                DayContent: ({ date }) => {
                  const timeSlots = getAvailabilityForDate(date);
                  const hasAvailability = timeSlots.length > 0;
                  const isToday = isSameDay(date, new Date());
                  
                  return (
                    <div 
                      className="flex flex-col items-center justify-center h-full w-full cursor-pointer group"
                      onClick={() => handleDateClick(date)}
                    >
                      <div className={cn(
                        "text-sm font-medium mb-1",
                        isToday && "font-bold"
                      )}>
                        {format(date, 'd')}
                      </div>
                      
                      {hasAvailability && (
                        <div className="flex flex-col items-center space-y-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <div className="text-xs text-green-600 font-medium">
                            {timeSlots.length} slot{timeSlots.length > 1 ? 's' : ''}
                          </div>
                        </div>
                      )}
                      
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  );
                }
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
          date={editingDate}
          isOpen={!!editingDate}
          onClose={handleCloseModal}
          dayAvailabilities={dayAvailabilities}
          weeklySchedules={weeklySchedules}
          onDayAvailabilityUpdate={onDayAvailabilityUpdate}
        />
      )}
    </>
  );
};

export default AvailabilityCalendar;