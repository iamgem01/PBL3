import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { getMonthName } from '@/utils/calendarUtils';

type ViewType = 'month' | 'week' | 'day' | 'agenda';

interface CalendarHeaderProps {
  currentDate: Date;
  viewType: ViewType;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: ViewType) => void;
  onCreateEvent: () => void;
}

export const CalendarHeader = ({
  currentDate,
  viewType,
  onPrevious,
  onNext,
  onToday,
  onViewChange,
  onCreateEvent,
}: CalendarHeaderProps) => {
  const getTitle = () => {
    switch (viewType) {
      case 'month':
        return `${getMonthName(currentDate)} ${currentDate.getFullYear()}`;
      case 'week':
        return `Week of ${getMonthName(currentDate, true)} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
      case 'day':
        return currentDate.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      case 'agenda':
        return 'Agenda View';
      default:
        return '';
    }
  };

  const views: ViewType[] = ['month', 'week', 'day', 'agenda'];

  return (
    <div className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Left: Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToday}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium"
          >
            Today
          </button>
          
          <div className="flex items-center gap-1">
            <button
              onClick={onPrevious}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Previous"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={onNext}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Next"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          <h2 className="text-xl font-semibold text-foreground">
            {getTitle()}
          </h2>
        </div>

        {/* Right: View controls & Create button */}
        <div className="flex items-center gap-3">
          {/* View Type Selector */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            {views.map((view) => (
              <button
                key={view}
                onClick={() => onViewChange(view)}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-medium transition-all capitalize
                  ${viewType === view 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                {view}
              </button>
            ))}
          </div>

          {/* Create Event Button */}
          <button
            onClick={onCreateEvent}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus size={18} />
            <span className="font-medium">New Event</span>
          </button>
        </div>
      </div>
    </div>
  );
};