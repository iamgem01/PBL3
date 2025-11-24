import { Calendar, Clock, MapPin, FileText } from 'lucide-react';
import type { CalendarEvent } from '@/types/calendar';
import { formatDate, formatEventDuration, isEventNow, isEventUpcoming } from '@/utils/calendarUtils';

interface EventCardProps {
  event: CalendarEvent;
  onClick?: () => void;
  compact?: boolean;
}

export const EventCard = ({ event, onClick, compact = false }: EventCardProps) => {
  const isNow = isEventNow(event);
  const isUpcoming = isEventUpcoming(event);
  
  const eventColor = event.color || '#3B82F6';
  
  if (compact) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left px-2 py-1 rounded text-xs truncate hover:bg-muted transition-colors"
        style={{ 
          borderLeft: `3px solid ${eventColor}`,
          backgroundColor: `${eventColor}10` 
        }}
        title={event.title}
        type="button"
      >
        <span className="font-medium">{event.title}</span>
      </button>
    );
  }

  return (
    <div
      onClick={onClick}
      className="group bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
    >
      {/* Color accent */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: eventColor }}
      />
      
      {/* Status badge */}
      {(isNow || isUpcoming) && (
        <div className="absolute top-2 right-2">
          <span className={`text-xs px-2 py-1 rounded-full ${
            isNow 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
          }`}>
            {isNow ? 'Now' : 'Soon'}
          </span>
        </div>
      )}
      
      <div className="pl-3">
        {/* Title */}
        <h3 className="font-semibold text-foreground mb-2 pr-16">
          {event.title}
        </h3>
        
        {/* Date & Time */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Calendar size={14} />
          <span>{formatDate(event.startDate, 'short')}</span>
          {!event.allDay && (
            <>
              <Clock size={14} className="ml-2" />
              <span>{formatDate(event.startDate, 'time')}</span>
              <span className="text-xs">({formatEventDuration(event)})</span>
            </>
          )}
        </div>
        
        {/* Location */}
        {event.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <MapPin size={14} />
            <span className="truncate">{event.location}</span>
          </div>
        )}
        
        {/* Linked Note */}
        {event.noteId && (
          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
            <FileText size={14} />
            <span>Linked to note</span>
          </div>
        )}
        
        {/* Description preview */}
        {event.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {event.description}
          </p>
        )}
      </div>
    </div>
  );
};