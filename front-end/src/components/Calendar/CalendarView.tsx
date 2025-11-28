import { DayCell } from "./DayCell";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  color?: string;
  location?: string;
}

interface CalendarViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedDate?: Date;
  onDayClick: (date: Date) => void;
  onEventClick: (eventId: string) => void;
}

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Utils
const getDaysInMonth = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
const getFirstDayOfMonth = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth(), 1).getDay();

const getCalendarDays = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = getFirstDayOfMonth(date);
  const daysInMonth = getDaysInMonth(date);
  const daysInPrevMonth = getDaysInMonth(new Date(year, month - 1));

  const days: Date[] = [];
  for (let i = firstDay - 1; i >= 0; i--)
    days.push(new Date(year, month - 1, daysInPrevMonth - i));
  for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++)
    days.push(new Date(year, month + 1, i));
  return days;
};

const isSameDay = (d1: Date, d2: Date) =>
  d1.toDateString() === d2.toDateString();
const isCurrentMonth = (date: Date, currentDate: Date) =>
  date.getMonth() === currentDate.getMonth() &&
  date.getFullYear() === currentDate.getFullYear();

const getEventsForDay = (date: Date, events: CalendarEvent[]) => {
  const checkDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  return events.filter((event) => {
    const start = new Date(new Date(event.startDate).setHours(0, 0, 0, 0));
    const end = new Date(new Date(event.endDate).setHours(0, 0, 0, 0));
    return checkDate >= start && checkDate <= end;
  });
};

const generateDayCellData = (
  date: Date,
  events: CalendarEvent[],
  currentDate: Date,
  selectedDate?: Date
) => ({
  date,
  events: getEventsForDay(date, events),
  isToday: isSameDay(date, new Date()),
  isCurrentMonth: isCurrentMonth(date, currentDate),
  isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
});

export const CalendarView = ({
  currentDate,
  events,
  selectedDate,
  onDayClick,
  onEventClick,
}: CalendarViewProps) => {
  const calendarDays = getCalendarDays(currentDate);

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-white">
      <div className="relative z-10 h-full flex flex-col">
        {/* Premium Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-white">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="py-3 text-center border-r border-slate-100 last:border-r-0"
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  {day.slice(0, 3)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Premium Calendar Grid */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-auto">
          {calendarDays.map((date) => {
            const cellData = generateDayCellData(
              date,
              events,
              currentDate,
              selectedDate
            );
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            return (
              <div
                key={date.toISOString()}
                className={`
                  border-b border-r border-slate-100 min-h-[120px] relative
                  transition-colors duration-150
                  ${isWeekend ? "bg-slate-50" : "bg-white"}
                  last:border-r-0
                  hover:bg-slate-50
                `}
              >
                <DayCell
                  data={cellData}
                  onClick={onDayClick}
                  onEventClick={onEventClick}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
