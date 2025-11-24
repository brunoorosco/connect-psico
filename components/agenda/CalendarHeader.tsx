import React from 'react';
import { Button } from "@/components/ui/button";
import { CalendarViewType } from '@/types/appointment';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CalendarDays,
  CalendarIcon,
  Calendar as CalendarMonth,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

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
    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center my-2">
      {/* Navegação de datas */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
        <Button variant="outline" size="icon" onClick={handlePrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-base sm:text-xl font-semibold px-2 text-center min-w-[200px]">
          {formatTitle()}
        </h2>
        <Button variant="outline" size="icon" onClick={handleNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" className="ml-0 sm:ml-2" onClick={handleToday}>
          Hoje
        </Button>
      </div>

      {/* Mudança de visualização */}
      <div className="grid grid-cols-3 items-center justify-center sm:justify-end gap-2">
        <Button
          variant={view === 'daily' ? 'default' : 'outline'}
          onClick={() => onViewChange('daily')}
          className={`flex gap-1 items-center ${view === 'daily' ? 'text-gray-50' : 'text-black'}`}
        >
          <CalendarIcon className="h-4 w-4" />
          <span>Diário</span>
        </Button>
        <Button
          variant={view === 'weekly' ? 'default' : 'outline'}
          onClick={() => onViewChange('weekly')}
          className={`flex gap-1 items-center ${view === 'weekly' ? 'text-gray-50' : 'text-black'}`}
        >
          <CalendarDays className="h-4 w-4" />
          <span>Semanal</span>
        </Button>
        <Button
          variant={view === 'monthly' ? 'default' : 'outline'}
          onClick={() => onViewChange('monthly')}
          className={`flex gap-1 items-center ${view === 'monthly' ? 'text-gray-50' : 'text-black'}`}
        >
          <CalendarMonth className="h-4 w-4" />
          <span>Mensal</span>
        </Button>
      </div>
    </div>
  );
};

export default CalendarHeader;
