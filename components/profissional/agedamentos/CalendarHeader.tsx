import React from 'react';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  CalendarDays, 
  CalendarIcon, 
  Calendar as CalendarMonth,
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { CalendarViewType } from '@/domain/model/appointment';
import CalendarNavigation from '@/components/dashboard/CalendarNavigation';

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  onDateChange: (date: Date) => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  view,
  onViewChange,
  onDateChange
}) => {
  const formatTitle = () => {
    if (view === 'daily') {
      return format(currentDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } else if (view === 'weekly') {
      return `Semana de ${format(currentDate, "dd 'de' MMMM", { locale: ptBR })}`;
    } else {
      return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
    }
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'daily') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (view === 'weekly') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'daily') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (view === 'weekly') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
      {/* <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handlePrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold px-2 min-w-[200px] text-center">
          {formatTitle()}
        </h2>
        <Button variant="outline" size="icon" onClick={handleNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" className="ml-2" onClick={handleToday}>
          Hoje
        </Button>
      </div>
      <CalendarNavigation selectedDate={selectedDate} onDateChange={setSelectedDate} /> */}
      
      <div className="flex items-center gap-2">
        <Button 
          variant={view === 'daily' ? 'default' : 'outline'}
          onClick={() => onViewChange('daily')}
          className="flex gap-1 items-center"
        >
          <CalendarIcon className="h-4 w-4" />
          <span>Diário</span>
        </Button>
        <Button 
          variant={view === 'weekly' ? 'default' : 'outline'}
          onClick={() => onViewChange('weekly')}
          className="flex gap-1 items-center"
        >
          <CalendarDays className="h-4 w-4" />
          <span>Semanal</span>
        </Button>
        <Button 
          variant={view === 'monthly' ? 'default' : 'outline'}
          onClick={() => onViewChange('monthly')}
          className="flex gap-1 items-center"
        >
          <CalendarMonth className="h-4 w-4" />
          <span>Mensal</span>
        </Button>
      </div>
    </div>
  );
};

export default CalendarHeader;