import { Calendar, Clock, Plus } from 'lucide-react';
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

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (eventId: string) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
}

const getEventsForHour = (date: Date, hour: number, events: CalendarEvent[]): CalendarEvent[] => {
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

const getAllDayEvents = (date: Date, events: CalendarEvent[]): CalendarEvent[] => {
  return events.filter(event => {
    if (!event.allDay) return false;
    const eventStart = new Date(event.startDate);
    return eventStart.toDateString() === date.toDateString();
  });
};

const formatTime = (hour: number): string => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00 ${period}`;
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const DayView = ({ currentDate, events, onEventClick, onTimeSlotClick }: DayViewProps) => {
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);
  const today = new Date();
  const isToday = currentDate.toDateString() === today.toDateString();
  const currentHour = today.getHours();
  const allDayEvents = getAllDayEvents(currentDate, events);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Day Header */}
      <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
              </h2>
              <p className="text-slate-600 mt-1 text-sm">
                {currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            {isToday && (
              <div className="px-3 py-1 rounded-full bg-blue-500 text-white text-sm font-medium">
                Today
              </div>
            )}
          </div>
          {allDayEvents.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                <Calendar size={12} /> All-Day Events
              </div>
              <div className="grid gap-2">
                {allDayEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event.id)}
                    className="p-2 rounded-lg cursor-pointer bg-blue-50 border-l-3 border-blue-500 hover:shadow-sm transition-colors"
                  >
                    <div className="font-semibold text-slate-900 text-sm">{event.title}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Time Slots */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4">
          <div className="space-y-0">
            {HOURS.map((hour) => {
              const hourEvents = getEventsForHour(currentDate, hour, events).filter((e) => !e.allDay);
              const isCurrentHour = isToday && hour === currentHour;
              const isHovered = hoveredHour === hour;

              return (
                <div
                  key={hour}
                  className={`grid grid-cols-[80px_1fr] border-b border-slate-200 min-h-[70px] transition-colors ${
                    isCurrentHour ? 'bg-blue-50' : ''
                  }`}
                  onMouseEnter={() => setHoveredHour(hour)}
                  onMouseLeave={() => setHoveredHour(null)}
                >
                  <div className={`py-2 pr-3 text-right text-sm ${
                    isCurrentHour ? 'font-semibold text-blue-600' : 'text-slate-500'
                  }`}>
                    {formatTime(hour)}
                  </div>
                  <div
                    className={`py-2 px-3 cursor-pointer transition-colors relative ${
                      isHovered ? 'bg-slate-50' : ''
                    }`}
                    onClick={() => onTimeSlotClick?.(currentDate, hour)}
                  >
                    {isHovered && hourEvents.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="px-3 py-1.5 rounded bg-blue-500 text-white text-xs font-medium shadow flex items-center gap-1">
                          <Plus size={12} /> Add Event
                        </button>
                      </div>
                    )}
                    <div className="space-y-2">
                      {hourEvents.map((event) => (
                        <div
                          key={event.id}
                          onClick={(e) => { e.stopPropagation(); onEventClick(event.id); }}
                          className="p-3 rounded-lg cursor-pointer bg-blue-50 border-l-3 border-blue-500 hover:shadow-sm transition-colors"
                        >
                          <div className="font-semibold text-slate-900 text-sm">{event.title}</div>
                          <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                            <Clock size={10} />
                            {new Date(event.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};