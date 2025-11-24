// src/pages/CalendarPage/CalendarPage.tsx

import { useState } from 'react';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import Sidebar from '@/components/layout/sidebar/sidebar';
import { CalendarHeader } from '@/components/Calendar/CalendarHeader';
import { CalendarView } from '@/components/Calendar/CalendarView';
import { AgendaView } from '@/components/Calendar/AgendaView';
import { EventModal } from '@/components/Calendar/EventModal';
import { EventCard } from '@/components/Calendar/EventCard';
import { useCalendarState } from '@/hooks/useCalendarState';

type ViewType = 'month' | 'week' | 'day' | 'agenda';

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

  // Loading state
  if (isLoading && events.length === 0) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className={`transition-all duration-300 flex-1 flex items-center justify-center ${collapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin h-12 w-12 text-primary" />
            <span className="text-muted-foreground">Loading calendar...</span>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className={`transition-all duration-300 flex-1 flex items-center justify-center ${collapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarIcon size={32} className="text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load calendar</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <main className={`transition-all duration-300 flex-1 flex flex-col overflow-hidden ${collapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Calendar Header */}
        <CalendarHeader
          currentDate={currentDate}
          viewType={viewType}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onToday={handleToday}
          onViewChange={handleViewChange}
          onCreateEvent={handleCreateEvent}
        />

        {/* Calendar Content */}
        <div className="flex-1 overflow-hidden">
          {viewType === 'agenda' ? (
            <AgendaView
              events={events}
              onEventClick={handleEventClick}
            />
          ) : viewType === 'month' ? (
            <CalendarView
              currentDate={currentDate}
              events={events}
              selectedDate={selectedDate}
              onDayClick={handleDayClick}
              onEventClick={handleEventClick}
            />
          ) : (
            // Week and Day views - Coming soon
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <CalendarIcon size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {viewType.charAt(0).toUpperCase() + viewType.slice(1)} View
                </h3>
                <p className="text-sm text-muted-foreground">Coming soon!</p>
              </div>
            </div>
          )}
        </div>

        {/* Event Modal (Create/Edit) */}
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

        {/* Event Details Modal */}
        {showEventDetails && selectedEvent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-semibold">Event Details</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleEditEvent}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setShowEventDetails(false)}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="p-6">
                <EventCard event={selectedEvent} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}