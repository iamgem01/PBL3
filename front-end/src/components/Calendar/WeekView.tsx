import { Calendar, Clock } from 'lucide-react';
import { useState } from 'react';

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

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (eventId: string) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
}

const getWeekDates = (date: Date): Date[] => {
  const day = date.getDay();
  const diff = date.getDate() - day;
  const weekDates: Date[] = [];
  
  for (let i = 0; i < 7; i++) {
    weekDates.push(new Date(date.getFullYear(), date.getMonth(), diff + i));
  }
  
  return weekDates;
};

const getEventsForDayAndHour = (
  date: Date,
  hour: number,
  events: CalendarEvent[]
): CalendarEvent[] => {
  return events.filter(event => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    
    const slotStart = new Date(date);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(date);
    slotEnd.setHours(hour, 59, 59, 999);
    
    return eventStart <= slotEnd && eventEnd >= slotStart;
  });
};

const formatTime = (hour: number): string => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00 ${period}`;
};

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const WeekView = ({ currentDate, events, onEventClick, onTimeSlotClick }: WeekViewProps) => {
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const weekDates = getWeekDates(currentDate);
  const today = new Date();

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Week Header */}
      <div className="grid grid-cols-8 border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="p-3 border-r border-slate-200">
          <Clock className="text-slate-400" size={16} />
        </div>
        {weekDates.map((date, index) => {
          const isTodayDate = isToday(date);
          return (
            <div
              key={index}
              className={`p-3 text-center border-r border-slate-200 transition-colors ${
                isTodayDate ? 'bg-blue-50' : ''
              }`}
            >
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                {WEEKDAYS[date.getDay()].slice(0, 3)}
              </div>
              <div
                className={`text-lg font-semibold transition-colors ${
                  isTodayDate
                    ? 'w-8 h-8 mx-auto rounded-full bg-blue-500 text-white flex items-center justify-center'
                    : 'text-slate-900'
                }`}
              >
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-8">
          {HOURS.map((hour) => (
            <div key={hour} className="contents">
              {/* Time Label */}
              <div className="sticky left-0 bg-white border-r border-b border-slate-200 p-2 text-xs font-medium text-slate-500 text-right z-5">
                {formatTime(hour)}
              </div>

              {/* Day Columns */}
              {weekDates.map((date, dayIndex) => {
                const slotKey = `${date.toISOString()}-${hour}`;
                const slotEvents = getEventsForDayAndHour(date, hour, events);
                const isHovered = hoveredSlot === slotKey;
                const isTodayDate = isToday(date);

                return (
                  <div
                    key={dayIndex}
                    className={`min-h-[60px] border-r border-b border-slate-200 p-1 cursor-pointer transition-colors relative group ${
                      isTodayDate ? 'bg-blue-50/30' : 'bg-white'
                    } ${isHovered ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                    onMouseEnter={() => setHoveredSlot(slotKey)}
                    onMouseLeave={() => setHoveredSlot(null)}
                    onClick={() => onTimeSlotClick?.(date, hour)}
                  >
                    {/* Events */}
                    <div className="space-y-0.5 relative z-10">
                      {slotEvents.map((event) => {
                        const eventColor = event.color || '#8b5cf6';
                        return (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(event.id);
                            }}
                            className="text-xs p-1.5 rounded truncate cursor-pointer transition-colors hover:shadow-sm"
                            style={{
                              background: `linear-gradient(135deg, ${eventColor}12, ${eventColor}20)`,
                              borderLeft: `2px solid ${eventColor}`,
                            }}
                            title={event.title}
                          >
                            <div className="font-semibold truncate text-slate-900">
                              {event.title}
                            </div>
                            {!event.allDay && (
                              <div className="text-slate-600 text-xs">
                                {new Date(event.startDate).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {events.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
              <Calendar size={32} className="text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              No events this week
            </h3>
            <p className="text-sm text-slate-500">
              Click on any time slot to create an event
            </p>
          </div>
        </div>
      )}
    </div>
  );
};