import { Calendar, Clock, MapPin, FileText, Sparkles, Zap } from 'lucide-react';

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

interface EventCardProps {
  event: CalendarEvent;
  onClick?: () => void;
  compact?: boolean;
}

const formatDate = (date: Date | string, format: 'short' | 'time' = 'short'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'short') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
};

const formatEventDuration = (event: CalendarEvent): string => {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  
  if (duration < 60) return `${duration}m`;
  if (duration < 1440) {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${Math.floor(duration / 1440)}d`;
};

const isEventNow = (event: CalendarEvent): boolean => {
  const now = new Date();
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  return now >= start && now <= end;
};

const isEventUpcoming = (event: CalendarEvent): boolean => {
  const now = new Date();
  const start = new Date(event.startDate);
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  return start > now && start <= oneHourLater;
};

export const EventCard = ({ event, onClick, compact = false }: EventCardProps) => {
  const isNow = isEventNow(event);
  const isUpcoming = isEventUpcoming(event);
  const eventColor = event.color || '#8b5cf6';
  
  if (compact) {
    return (
      <button
        onClick={onClick}
        className="group relative w-full text-left px-3 py-2 rounded-xl text-xs truncate font-medium overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
        style={{ 
          background: `linear-gradient(135deg, ${eventColor}15, ${eventColor}30)`,
          borderLeft: `4px solid ${eventColor}`
        }}
        type="button"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        <span className="relative z-10 text-slate-900 font-semibold">{event.title}</span>
      </button>
    );
  }

  return (
    <div
      onClick={onClick}
      className="group relative bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-7 hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden"
    >
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${eventColor}08, ${eventColor}15)`
        }}
      />
      
      {/* Decorative gradient border */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 group-hover:w-2"
        style={{ 
          background: `linear-gradient(180deg, ${eventColor}, ${eventColor}60)`,
        }}
      />
      
      {/* Premium Status Badge */}
      {(isNow || isUpcoming) && (
        <div className="absolute top-5 right-5 z-20">
          <div className="relative">
            <div className={`absolute inset-0 ${isNow ? 'bg-emerald-400' : 'bg-purple-400'} rounded-2xl blur-lg opacity-50 animate-pulse`}></div>
            <div className={`relative flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs shadow-xl backdrop-blur-sm ${
              isNow 
                ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-white' 
                : 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-white'
            }`}>
              {isNow ? <Zap size={14} className="animate-pulse" /> : <Sparkles size={14} />}
              {isNow ? 'Live Now' : 'Coming Soon'}
            </div>
          </div>
        </div>
      )}
      
      <div className="relative pl-5">
        {/* Premium Title with gradient on hover */}
        <h3 className="font-serif text-2xl font-bold text-slate-900 mb-5 pr-32 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-purple-600 group-hover:to-pink-600 transition-all duration-300">
          {event.title}
        </h3>
        
        {/* Premium Metadata Pills */}
        <div className="flex items-center gap-3 text-sm mb-4 flex-wrap">
          {/* Date */}
          <div className="group/pill relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover/pill:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 group-hover/pill:text-white transition-colors">
              <Calendar size={15} className="text-blue-500 group-hover/pill:text-white" />
              <span className="font-semibold">{formatDate(event.startDate, 'short')}</span>
            </div>
          </div>
          
          {/* Time */}
          {!event.allDay && (
            <>
              <div className="group/pill relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-600 opacity-0 group-hover/pill:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 group-hover/pill:text-white transition-colors">
                  <Clock size={15} className="text-purple-500 group-hover/pill:text-white" />
                  <span className="font-semibold">{formatDate(event.startDate, 'time')}</span>
                </div>
              </div>
              
              {/* Duration Badge */}
              <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-50 to-pink-100 font-bold text-xs text-pink-700 shadow-sm">
                {formatEventDuration(event)}
              </div>
            </>
          )}
        </div>
        
        {/* Location */}
        {event.location && (
          <div className="group/pill relative overflow-hidden mb-4 inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-pink-600 opacity-0 group-hover/pill:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-50 to-pink-100 group-hover/pill:text-white transition-colors">
              <MapPin size={15} className="text-pink-500 group-hover/pill:text-white" />
              <span className="font-semibold text-sm truncate max-w-xs">{event.location}</span>
            </div>
          </div>
        )}
        
        {/* Linked Note Badge */}
        {event.noteId && (
          <div className="mb-4 inline-block">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-purple-200/50">
              <FileText size={15} className="text-purple-500" />
              <span className="font-semibold text-sm text-purple-700">Linked to note</span>
            </div>
          </div>
        )}
        
        {/* Description */}
        {event.description && (
          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/50">
            <p className="text-sm text-slate-700 leading-relaxed line-clamp-3">
              {event.description}
            </p>
          </div>
        )}
      </div>

      {/* Premium shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden rounded-3xl">
        <div 
          className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)'
          }}
        />
      </div>
    </div>
  );
};