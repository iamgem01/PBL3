import { Calendar as CalendarIcon } from 'lucide-react';
import { EventCard } from './EventCard';
import { sortEventsByDate, formatDate } from '@/utils/calendarUtils';
import type { CalendarEvent } from '@/types/calendar';

interface AgendaViewProps {
  events: CalendarEvent[];
  onEventClick: (eventId: string) => void;
}

export const AgendaView = ({ events, onEventClick }: AgendaViewProps) => {
  const sortedEvents = sortEventsByDate(events);
  
  // Group events by date
  const eventsByDate = sortedEvents.reduce((acc, event) => {
    const dateKey = new Date(event.startDate).toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  if (sortedEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <CalendarIcon size={32} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No events scheduled
        </h3>
        <p className="text-sm text-muted-foreground">
          Create your first event to get started
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {Object.entries(eventsByDate).map(([dateKey, dateEvents]) => {
          const date = new Date(dateKey);
          
          return (
            <div key={dateKey} className="space-y-4">
              {/* Date Header */}
              <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-2 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">
                  {formatDate(date, 'long')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {dateEvents.length} {dateEvents.length === 1 ? 'event' : 'events'}
                </p>
              </div>

              {/* Events List */}
              <div className="space-y-3">
                {dateEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => onEventClick(event.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};