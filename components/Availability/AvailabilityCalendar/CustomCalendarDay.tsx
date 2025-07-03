import { format, isSameDay } from "date-fns";
import { Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { ICustomCalendarDay } from "./types";

export function CustomCalendarDay({ date, selectedDate, getAvailabilityForDate, onClick }: ICustomCalendarDay) {
  const timeSlots = getAvailabilityForDate(date);
  const isToday = isSameDay(date, new Date());
  const hasAvailability = timeSlots.length > 0;

  return (
    <div
      className="flex flex-col items-center justify-center h-full w-full cursor-pointer group"
      onClick={() => onClick(date)}
    >
      <div className={cn("text-sm font-medium mb-1", isToday && "font-bold")}>
        {format(date, "d")}
      </div>

      {hasAvailability && (
        <div className="flex flex-col items-center space-y-1 text-[10px] text-green-700 font-medium">
          {timeSlots.slice(0, 2).map((slot, i) => (
            <div key={i} className="h-2">
              {slot.startTime} - {slot.endTime}
            </div>
          ))}
          {timeSlots.length > 2 && <div>+{timeSlots.length - 2} mais</div>}
        </div>
      )}

      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Edit className="h-3 w-3 text-gray-400" />
      </div>
    </div>
  );
}
