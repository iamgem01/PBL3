import { Calendar, Sparkles } from 'lucide-react';
import { EventCard } from './EventCard';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  color?: string;
  location?: string;
  noteId?: string;
}

interface AgendaViewProps {
  events: CalendarEvent[];
  onEventClick: (eventId: string) => void;
}

const sortEventsByDate = (events: CalendarEvent[]): CalendarEvent[] => {
  return [...events].sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

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
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
            <Calendar size={48} className="text-slate-400" />
          </div>
        </div>
        <h3 className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-purple-700 to-slate-800 mb-2">
          No events scheduled
        </h3>
        <p className="text-slate-600 max-w-md font-medium">
          Create your first event to get started organizing your schedule
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30 relative custom-scrollbar">
      <div className="relative z-10 max-w-4xl mx-auto p-6 space-y-8">
        {Object.entries(eventsByDate).map(([dateKey, dateEvents], groupIndex) => {
          const date = new Date(dateKey);
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <div 
              key={dateKey} 
              className="space-y-4"
            >
              {/* Date Header */}
              <div className={`sticky top-0 z-20 pb-3 border-b transition-all rounded-xl p-4 shadow-md backdrop-blur-xl ${
                isToday 
                  ? 'bg-gradient-to-r from-blue-100/80 via-purple-100/70 to-pink-100/80 border-purple-300' 
                  : 'bg-white/80 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-xl font-serif font-bold ${
                      isToday 
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600' 
                        : 'text-slate-900'
                    }`}>
                      {formatDate(date)}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1 font-medium">
                      {dateEvents.length} {dateEvents.length === 1 ? 'event' : 'events'}
                    </p>
                  </div>
                  {isToday && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-sm font-semibold shadow-lg">
                      <Sparkles size={14} />
                      Today
                    </div>
                  )}
                </div>
              </div>

              {/* Events List */}
              <div className="space-y-4">
                {dateEvents.map((event) => (
                  <div key={event.id}>
                    <EventCard
                      event={event}
                      onClick={() => onEventClick(event.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};