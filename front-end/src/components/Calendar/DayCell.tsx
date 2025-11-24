import type { DayCellData } from '@/types/calendar';
import { EventCard } from './EventCard';

interface DayCellProps {
  data: DayCellData;
  onClick?: (date: Date) => void;
  onEventClick?: (eventId: string) => void;
}

export const DayCell = ({ data, onClick, onEventClick }: DayCellProps) => {
  const { date, events, isToday, isCurrentMonth, isSelected } = data;
  
  const handleClick = () => {
    onClick?.(date);
  };
  
  const handleEventClick = (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    onEventClick?.(eventId);
  };
  
  return (
    <div
      onClick={handleClick}
      className={`
        min-h-[120px] border border-border p-2 cursor-pointer transition-all
        ${isCurrentMonth ? 'bg-card' : 'bg-muted/30'}
        ${isToday ? 'ring-2 ring-blue-500 ring-inset' : ''}
        ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
        hover:bg-muted/50
      `}
    >
      {/* Date number */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`
            text-sm font-medium
            ${isToday 
              ? 'w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center' 
              : isCurrentMonth 
                ? 'text-foreground' 
                : 'text-muted-foreground'
            }
          `}
        >
          {date.getDate()}
        </span>
        
        {events.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {events.length}
          </span>
        )}
      </div>
      
      {/* Events */}
      <div className="space-y-1">
        {events.slice(0, 3).map((event) => (
          <div key={event.id} onClick={(e) => handleEventClick(e, event.id)}>
            <EventCard
              event={event}
              compact
            />
          </div>
        ))}
        
        {events.length > 3 && (
          <div className="text-xs text-muted-foreground pl-2">
            +{events.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
};