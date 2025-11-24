import { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import Sidebar from '@/components/layout/sidebar/sidebar';
import { CalendarHeader } from '@/components/Calendar/CalendarHeader';
import { CalendarView } from '@/components/Calendar/CalendarView';
import { WeekView } from '@/components/Calendar/WeekView';
import { DayView } from '@/components/Calendar/DayView';
import { AgendaView } from '@/components/Calendar/AgendaView';
import { EventModal } from '@/components/Calendar/EventModal';
import { EventCard } from '@/components/Calendar/EventCard';
import { useCalendarState } from '@/hooks/useCalendarState';

export default function CalendarPage() {
  const [collapsed, setCollapsed] = useState(false);
  
  const {
    events,
    currentDate,
    viewType,
    selectedDate,
    selectedEvent,
    isLoading,
    error,
    showEventModal,
    showEventDetails,
    handlePrevious,
    handleNext,
    handleToday,
    handleCreateEvent,
    handleDayClick,
    handleEventClick,
    handleEditEvent,
    handleSaveEvent,
    handleDeleteEvent,
    handleViewChange,
    setShowEventModal,
    setShowEventDetails,
  } = useCalendarState();

  // Memoized background để tránh re-render không cần thiết
  const backgroundElements = useMemo(() => (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 -z-10 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl"></div>
        <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-purple-200 rounded-full mix-blend-multiply filter blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-pink-200 rounded-full mix-blend-multiply filter blur-2xl"></div>
      </div>
    </div>
  ), []);

  // Premium Loading State
  if (isLoading && events.length === 0) {
    return (
      <div className="flex h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl"></div>
            <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-2xl"></div>
            <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-2xl"></div>
          </div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center w-full gap-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-20 absolute"></div>
            <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-xl flex items-center justify-center relative z-10 shadow-lg">
              <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-serif font-bold text-slate-800 mb-2">Loading Calendar</h3>
            <p className="text-slate-600 text-sm">Preparing your events...</p>
          </div>
        </div>
      </div>
    );
  }

  // Premium Error State
  if (error) {
    return (
      <div className="flex h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-pink-50 to-orange-50"></div>
        <div className="relative z-10 flex items-center justify-center w-full">
          <div className="text-center bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-red-100 max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">⚠</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-slate-900 mb-3">Connection Error</h3>
            <p className="text-slate-600 mb-6 leading-relaxed text-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-full hover:shadow-lg transition-all font-semibold transform hover:scale-105 active:scale-95 text-sm"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      {backgroundElements}
      
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
        collapsed ? 'ml-20' : 'ml-64'
      }`}>
        {/* PREMIUM HEADER - Fixed spacing */}
        <div className="flex-shrink-0 px-6 py-4 bg-white border-b border-slate-200/60 shadow-sm">
          <CalendarHeader
            currentDate={currentDate}
            viewType={viewType}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onToday={handleToday}
            onViewChange={handleViewChange}
            onCreateEvent={handleCreateEvent}
          />
        </div>

        {/* MAIN CONTENT - Fixed overflow and spacing */}
        <div className="flex-1 overflow-hidden bg-slate-50/50">
          {viewType === 'month' ? (
            <CalendarView
              currentDate={currentDate}
              events={events}
              selectedDate={selectedDate}
              onDayClick={handleDayClick}
              onEventClick={handleEventClick}
            />
          ) : viewType === 'week' ? (
            <WeekView
              currentDate={currentDate}
              events={events}
              onEventClick={handleEventClick}
              onTimeSlotClick={(date, hour) => {
                const newDate = new Date(date);
                newDate.setHours(hour, 0, 0, 0);
                handleDayClick(newDate);
              }}
            />
          ) : viewType === 'day' ? (
            <DayView
              currentDate={currentDate}
              events={events}
              onEventClick={handleEventClick}
              onTimeSlotClick={(date, hour) => {
                const newDate = new Date(date);
                newDate.setHours(hour, 0, 0, 0);
                handleDayClick(newDate);
              }}
            />
          ) : (
            <AgendaView
              events={events}
              onEventClick={handleEventClick}
            />
          )}
        </div>

        {/* PREMIUM MODALS */}
        {showEventModal && (
          <EventModal
            isOpen={showEventModal}
            onClose={() => { 
              setShowEventModal(false); 
              setShowEventDetails(false); 
            }}
            onSave={handleSaveEvent}
            onDelete={handleDeleteEvent}
            event={selectedEvent}
            selectedDate={selectedDate}
          />
        )}
        
        {showEventDetails && selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
              <EventCard event={selectedEvent} />
              <div className="p-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-200">
                <button 
                  onClick={handleEditEvent} 
                  className="px-5 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl transition-all shadow hover:shadow-md font-medium"
                >
                  Edit Event
                </button>
                <button 
                  onClick={() => setShowEventDetails(false)} 
                  className="px-5 py-2 text-sm bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl transition-all font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}