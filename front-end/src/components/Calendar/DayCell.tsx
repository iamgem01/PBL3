import { Sparkles } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  color?: string;
  allDay: boolean;
  startDate: string;
}

interface DayCellData {
  date: Date;
  events: CalendarEvent[];
  isToday: boolean;
  isCurrentMonth: boolean;
  isSelected: boolean;
}

interface DayCellProps {
  data: DayCellData;
  onClick?: (date: Date) => void;
  onEventClick?: (eventId: string) => void;
}

export const DayCell = ({ data, onClick, onEventClick }: DayCellProps) => {
  const { date, events, isToday, isCurrentMonth, isSelected } = data;

  return (
    <div
      onClick={() => onClick?.(date)}
      className={`
        relative h-full p-2 cursor-pointer transition-all duration-150 flex flex-col
        ${!isCurrentMonth && "opacity-40"}
        ${isSelected ? "bg-blue-50 ring-1 ring-blue-300" : "hover:bg-slate-50"}
      `}
    >
      {/* Premium Date Display */}
      <div className="flex items-center justify-between mb-1 relative z-10">
        <div className="relative">
          {isToday ? (
            // TODAY: Premium gradient badge
            <div className="relative">
              <div className="relative flex items-center justify-center w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-lg font-semibold text-sm">
                <span>{date.getDate()}</span>
                <Sparkles size={8} className="absolute -top-0.5 -right-0.5" />
              </div>
            </div>
          ) : (
            // REGULAR: Clean number with hover effect
            <div
              className={`
                flex items-center justify-center w-7 h-7 rounded-lg font-medium text-sm transition-colors
                ${isCurrentMonth ? "text-slate-700" : "text-slate-300"}
                ${isSelected ? "text-blue-600 font-semibold" : ""}
              `}
            >
              {date.getDate()}
            </div>
          )}
        </div>

        {/* Event count badge */}
        {events.length > 0 && !isToday && (
          <div className="flex items-center justify-center w-5 h-5 bg-slate-600 text-white rounded-full text-xs font-medium">
            {events.length}
          </div>
        )}
      </div>

      {/* Premium Event List */}
      <div className="space-y-1 flex-1 overflow-hidden relative z-10">
        {events.slice(0, 3).map((event) => {
          const eventColor = event.color || "#8b5cf6";

          return (
            <div
              key={event.id}
              onClick={(e) => {
                e.stopPropagation();
                onEventClick?.(event.id);
              }}
              className="group/event relative w-full text-left px-2 py-1 rounded text-[11px] truncate font-medium transition-colors cursor-pointer hover:shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${eventColor}12, ${eventColor}20)`,
                borderLeft: `2px solid ${eventColor}`,
              }}
            >
              <span className="text-slate-900 font-semibold">
                {event.title}
              </span>
            </div>
          );
        })}

        {/* More events indicator */}
        {events.length > 3 && (
          <div className="text-[10px] text-slate-500 font-medium px-2 py-0.5 bg-slate-100 rounded inline-block">
            +{events.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
};
