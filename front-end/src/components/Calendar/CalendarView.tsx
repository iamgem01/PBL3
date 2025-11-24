import { DayCell } from './DayCell';
import { getCalendarDays, generateDayCellData } from '@/utils/calendarUtils';
import type { CalendarEvent } from '@/types/calendar';

interface CalendarViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedDate?: Date;
  onDayClick: (date: Date) => void;
  onEventClick: (eventId: string) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarView = ({
  currentDate,
  events,
  selectedDate,
  onDayClick,
  onEventClick,
}: CalendarViewProps) => {
  const calendarDays = getCalendarDays(currentDate);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/30">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-semibold text-muted-foreground uppercase tracking-wide"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr">
        {calendarDays.map((date, index) => {
          const cellData = generateDayCellData(
            date,
            events,
            currentDate,
            selectedDate
          );
          
          return (
            <DayCell
              key={index}
              data={cellData}
              onClick={onDayClick}
              onEventClick={onEventClick}
            />
          );
        })}
      </div>
    </div>
  );
};