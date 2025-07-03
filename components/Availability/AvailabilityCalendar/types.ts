export interface ICustomCalendarDay {
  date: Date;
  selectedDate: Date;
  getAvailabilityForDate: (date: Date) => { startTime: string; endTime: string }[];
  onClick: (date: Date) => void;
}