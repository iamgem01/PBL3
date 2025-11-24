import { Calendar, Clock, MapPin, Plus } from 'lucide-react';
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

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (eventId: string) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
}

// Utils
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
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50/30 via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Day Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-6 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {currentDate.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
            {isToday && (
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-sm font-semibold shadow-lg animate-pulse">
                Today
              </div>
            )}
          </div>

          {/* All-Day Events */}
          {allDayEvents.length > 0 && (
            <div className="space-y-2 animate-fadeIn">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Calendar size={14} />
                All-Day Events
              </div>
              <div className="grid gap-2">
                {allDayEvents.map((event) => {
                  const eventColor = event.color || '#3B82F6';
                  return (
                    <div
                      key={event.id}
                      onClick={() => onEventClick(event.id)}
                      className="p-3 rounded-lg cursor-pointer transition-all transform hover:scale-[1.02] hover:shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${eventColor}15, ${eventColor}25)`,
                        borderLeft: `4px solid ${eventColor}`,
                      }}
                    >
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {event.title}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mt-1">
                          <MapPin size={12} />
                          {event.location}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Time Slots */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          <div className="space-y-0">
            {HOURS.map((hour) => {
              const hourEvents = getEventsForHour(currentDate, hour, events).filter(
                (e) => !e.allDay
              );
              const isCurrentHour = isToday && hour === currentHour;
              const isHovered = hoveredHour === hour;

              return (
                <div
                  key={hour}
                  className={`grid grid-cols-[100px_1fr] border-b border-gray-200 dark:border-gray-700 min-h-[80px] group transition-all ${
                    isCurrentHour ? 'bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5' : ''
                  }`}
                  onMouseEnter={() => setHoveredHour(hour)}
                  onMouseLeave={() => setHoveredHour(null)}
                >
                  {/* Time Label */}
                  <div className={`py-2 pr-4 text-right ${isCurrentHour ? 'font-bold' : ''}`}>
                    <span
                      className={`text-sm transition-all ${
                        isCurrentHour
                          ? 'text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text font-bold'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {formatTime(hour)}
                    </span>
                  </div>

                  {/* Events Column */}
                  <div
                    className={`py-2 px-4 cursor-pointer transition-all relative ${
                      isHovered ? 'bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-gray-800/50 dark:via-gray-800/50 dark:to-gray-800/50' : ''
                    }`}
                    onClick={() => onTimeSlotClick?.(currentDate, hour)}
                  >
                    {/* Current Time Indicator */}
                    {isCurrentHour && (
                      <div className="absolute left-0 top-2 w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-ping" />
                    )}

                    {/* Hover Add Button */}
                    {isHovered && hourEvents.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-sm font-medium shadow-lg transform hover:scale-105 transition-all flex items-center gap-2">
                          <Plus size={16} />
                          Add Event
                        </button>
                      </div>
                    )}

                    {/* Events */}
                    <div className="space-y-2">
                      {hourEvents.map((event) => {
                        const eventColor = event.color || '#3B82F6';
                        const eventStart = new Date(event.startDate);
                        const eventEnd = new Date(event.endDate);
                        const duration = Math.round(
                          (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60)
                        );

                        return (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(event.id);
                            }}
                            className="p-4 rounded-lg cursor-pointer transition-all transform hover:scale-[1.02] hover:shadow-xl hover:z-10 animate-fadeIn"
                            style={{
                              background: `linear-gradient(135deg, ${eventColor}15, ${eventColor}25)`,
                              borderLeft: `4px solid ${eventColor}`,
                            }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 dark:text-white mb-1">
                                  {event.title}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                  <div className="flex items-center gap-1">
                                    <Clock size={12} />
                                    {eventStart.toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}{' '}
                                    - {eventEnd.toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </div>
                                  <span className="text-gray-400">•</span>
                                  <span>{duration}m</span>
                                </div>
                                {event.location && (
                                  <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    <MapPin size={12} />
                                    {event.location}
                                  </div>
                                )}
                              </div>
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: eventColor }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
              No events today
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