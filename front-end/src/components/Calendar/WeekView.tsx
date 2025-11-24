import { Calendar, Clock } from 'lucide-react';
import { useState } from 'react';

// Types
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

// Utils
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
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50/30 via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Week Header */}
      <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-20 shadow-sm">
        <div className="p-4 border-r border-gray-200 dark:border-gray-700">
          <Clock className="text-gray-400" size={20} />
        </div>
        {weekDates.map((date, index) => {
          const isTodayDate = isToday(date);
          return (
            <div
              key={index}
              className={`p-4 text-center border-r border-gray-200 dark:border-gray-700 transition-all ${
                isTodayDate ? 'bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10' : ''
              }`}
            >
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                {WEEKDAYS[date.getDay()].slice(0, 3)}
              </div>
              <div
                className={`text-2xl font-bold transition-all ${
                  isTodayDate
                    ? 'w-10 h-10 mx-auto rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white flex items-center justify-center shadow-lg animate-pulse'
                    : 'text-gray-900 dark:text-gray-100'
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
              <div className="sticky left-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-r border-b border-gray-200 dark:border-gray-700 p-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-right z-10">
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
                    className={`min-h-[60px] border-r border-b border-gray-200 dark:border-gray-700 p-1 cursor-pointer transition-all relative group ${
                      isTodayDate ? 'bg-gradient-to-br from-blue-50/20 via-purple-50/20 to-pink-50/20' : 'bg-white/50 dark:bg-gray-900/50'
                    } ${isHovered ? 'bg-gradient-to-br from-blue-100/40 via-purple-100/40 to-pink-100/40 shadow-inner' : 'hover:bg-gray-50/80 dark:hover:bg-gray-800/80'}`}
                    onMouseEnter={() => setHoveredSlot(slotKey)}
                    onMouseLeave={() => setHoveredSlot(null)}
                    onClick={() => onTimeSlotClick?.(date, hour)}
                  >
                    {/* Hover Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
                    
                    {/* Events */}
                    <div className="space-y-0.5 relative z-10">
                      {slotEvents.map((event) => {
                        const eventColor = event.color || '#3B82F6';
                        return (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(event.id);
                            }}
                            className="text-xs p-1.5 rounded truncate cursor-pointer transition-all transform hover:scale-105 hover:shadow-lg hover:z-20 animate-fadeIn"
                            style={{
                              background: `linear-gradient(135deg, ${eventColor}15, ${eventColor}25)`,
                              borderLeft: `3px solid ${eventColor}`,
                            }}
                            title={event.title}
                          >
                            <div className="font-semibold truncate text-gray-900 dark:text-white">
                              {event.title}
                            </div>
                            {!event.allDay && (
                              <div className="text-gray-600 dark:text-gray-400 text-xs">
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
          <div className="text-center animate-fadeIn">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <Calendar size={40} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No events this week
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Click on any time slot to create an event
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};