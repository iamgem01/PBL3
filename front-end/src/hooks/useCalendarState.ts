import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsInRange,
} from '@/services/calendarService';
import { getViewDateRange } from '@/utils/calendarUtils';
import type { CalendarEvent, CreateEventInput } from '@/types/calendar';

// Define proper view type
type ViewType = 'month' | 'week' | 'day' | 'agenda';

export const useCalendarState = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('month');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);

  // Fetch events based on current view
  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { start, end } = getViewDateRange(currentDate, viewType as 'month' | 'week' | 'day');
      const fetchedEvents = await getEventsInRange(start, end);
      
      setEvents(fetchedEvents);
    } catch (err: any) {
      console.error('Failed to fetch events:', err);
      setError(err.message || 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, viewType]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      switch (viewType) {
        case 'month':
          newDate.setMonth(prev.getMonth() - 1);
          break;
        case 'week':
          newDate.setDate(prev.getDate() - 7);
          break;
        case 'day':
          newDate.setDate(prev.getDate() - 1);
          break;
        case 'agenda':
          newDate.setMonth(prev.getMonth() - 1);
          break;
      }
      return newDate;
    });
  }, [viewType]);

  const handleNext = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      switch (viewType) {
        case 'month':
          newDate.setMonth(prev.getMonth() + 1);
          break;
        case 'week':
          newDate.setDate(prev.getDate() + 7);
          break;
        case 'day':
          newDate.setDate(prev.getDate() + 1);
          break;
        case 'agenda':
          newDate.setMonth(prev.getMonth() + 1);
          break;
      }
      return newDate;
    });
  }, [viewType]);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Event handlers
  const handleCreateEvent = useCallback(() => {
    setSelectedEvent(null);
    setShowEventModal(true);
  }, []);

  const handleDayClick = useCallback((date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setShowEventModal(true);
  }, []);

  const handleEventClick = useCallback((eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
      setShowEventDetails(true);
    }
  }, [events]);

  const handleEditEvent = useCallback(() => {
    setShowEventDetails(false);
    setShowEventModal(true);
  }, []);

  const handleSaveEvent = useCallback(async (eventData: CreateEventInput) => {
    try {
      if (selectedEvent) {
        // Update existing event
        const updated = await updateEvent(selectedEvent.id, eventData);
        setEvents((prev) =>
          prev.map((e) => (e.id === updated.id ? updated : e))
        );
      } else {
        // Create new event
        const newEvent = await createEvent(eventData);
        setEvents((prev) => [...prev, newEvent]);
      }
      
      setShowEventModal(false);
      setSelectedEvent(null);
      setSelectedDate(undefined);
    } catch (error) {
      console.error('Failed to save event:', error);
      throw error;
    }
  }, [selectedEvent]);

  const handleDeleteEvent = useCallback(async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      setShowEventModal(false);
      setShowEventDetails(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to delete event:', error);
      throw error;
    }
  }, []);

  const handleViewChange = useCallback((view: ViewType) => {
    setViewType(view);
  }, []);

  // Memoized values
  const state = useMemo(
    () => ({
      events,
      currentDate,
      viewType,
      selectedDate,
      selectedEvent,
      isLoading,
      error,
      showEventModal,
      showEventDetails,
    }),
    [
      events,
      currentDate,
      viewType,
      selectedDate,
      selectedEvent,
      isLoading,
      error,
      showEventModal,
      showEventDetails,
    ]
  );

  const actions = useMemo(
    () => ({
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
      refreshEvents: fetchEvents,
    }),
    [
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
      fetchEvents,
    ]
  );

  return { ...state, ...actions };
};