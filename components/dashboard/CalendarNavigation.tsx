import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarNavigationProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const CalendarNavigation: React.FC<CalendarNavigationProps> = ({ 
  selectedDate, 
  onDateChange 
}) => {
  const handlePreviousDay = () => {
    onDateChange(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    onDateChange(addDays(selectedDate, 1));
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="flex items-center justify-between mb-6 bg-white p-3 rounded-lg shadow-sm border">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePreviousDay}
        className="border-therapy-light text-therapy-tertiary hover:text-therapy-primary hover:bg-therapy-light/50"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleToday}
          className="text-sm hover:bg-therapy-light/50 hover:text-therapy-primary"
        >
          Hoje
        </Button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="pl-3 pr-2 flex items-center gap-1 hover:bg-therapy-light/50 hover:text-therapy-primary"
            >
              {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
              <CalendarDays className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && onDateChange(date)}
              initialFocus
              locale={ptBR}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <Button 
        variant="outline" 
        size="icon"
        onClick={handleNextDay}
        className="border-therapy-light text-therapy-tertiary hover:text-therapy-primary hover:bg-therapy-light/50"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CalendarNavigation;
