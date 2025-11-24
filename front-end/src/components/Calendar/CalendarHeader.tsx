import { ChevronLeft, ChevronRight, Plus, Sparkles } from 'lucide-react';

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
    const month = currentDate.toLocaleDateString('en-US', { month: 'long' });
    const year = currentDate.getFullYear();
    return { month, year };
  };

  const { month, year } = getTitle();
  const views: ViewType[] = ['month', 'week', 'day', 'agenda'];
  
  const today = new Date();
  const isCurrentMonth = currentDate.getMonth() === today.getMonth() && 
                         currentDate.getFullYear() === today.getFullYear();

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
      {/* Left: Premium Title & Navigation */}
      <div className="flex items-center gap-6">
        {/* Elegant Month/Year Display */}
        <div className="flex items-baseline gap-3">
          <h1 className="text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-purple-600 to-slate-900 tracking-tight leading-none">
            {month}
          </h1>
          <span className="text-3xl font-sans font-light text-slate-400 tracking-wide">{year}</span>
        </div>

        {/* Premium Navigation Controls */}
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xl rounded-2xl p-1.5 shadow-md border border-slate-200/50">
          <button 
            onClick={onPrevious} 
            className="group p-2.5 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 rounded-xl text-slate-500 hover:text-slate-900 transition-all hover:scale-110 active:scale-95"
            aria-label="Previous"
          >
            <ChevronLeft size={20} className="group-hover:animate-pulse" />
          </button>
          
          <button 
            onClick={onToday} 
            className={`group relative px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all overflow-hidden ${
              isCurrentMonth 
                ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50'
            }`}
          >
            <span className="relative z-10 flex items-center gap-1.5">
              {isCurrentMonth && <Sparkles size={12} className="animate-pulse" />}
              Today
            </span>
            {!isCurrentMonth && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            )}
          </button>
          
          <button 
            onClick={onNext} 
            className="group p-2.5 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 rounded-xl text-slate-500 hover:text-slate-900 transition-all hover:scale-110 active:scale-95"
            aria-label="Next"
          >
            <ChevronRight size={20} className="group-hover:animate-pulse" />
          </button>
        </div>
      </div>

      {/* Right: Premium View Controls & CTA */}
      <div className="flex items-center gap-4">
        {/* Elegant View Selector */}
        <div className="hidden md:flex bg-white/80 backdrop-blur-xl p-1.5 rounded-2xl shadow-md border border-slate-200/50 relative overflow-hidden">
          {/* Gradient Indicator Background */}
          <div 
            className="absolute h-[calc(100%-12px)] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl transition-all duration-300 ease-out shadow-lg"
            style={{
              width: `${100 / views.length}%`,
              left: `${(views.indexOf(viewType) * (100 / views.length)) + 1.5}%`,
              top: '6px',
            }}
          />
          
          {views.map((view) => (
            <button
              key={view}
              onClick={() => onViewChange(view)}
              className={`
                relative z-10 px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 capitalize
                ${viewType === view 
                  ? 'text-white scale-105' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/50'
                }
              `}
            >
              {view}
            </button>
          ))}
        </div>

        {/* Premium New Event Button */}
        <button
          onClick={onCreateEvent}
          className="group relative flex items-center gap-2.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-7 py-3 rounded-2xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 overflow-hidden"
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          
          <div className="relative z-10 flex items-center gap-2.5">
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" /> 
            <span>New Event</span>
          </div>
        </button>
      </div>
    </div>
  );
};