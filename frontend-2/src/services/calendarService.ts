import { handleResponse } from './utils';
import { getAuthHeaders } from '@/utils/authUtils';
import type { 
  CalendarEvent, 
  CreateEventInput, 
  UpdateEventInput,
  CalendarFilters 
} from '@/types/calendar';

const CALENDAR_SERVICE_URL = import.meta.env.VITE_CALENDAR_SERVICE_URL || 'http://localhost:8000';

/**
 * Get all events for the current user
 */
export const getAllEvents = async (filters?: CalendarFilters): Promise<CalendarEvent[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.noteId) queryParams.append('noteId', filters.noteId);

    const url = `${CALENDAR_SERVICE_URL}/api/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    console.log('📅 [Calendar] Fetching events from:', url);
    console.log('📅 [Calendar] Filters:', filters);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    console.log('📅 [Calendar] Response status:', response.status);
    
    const events = await handleResponse(response);
    console.log('✅ [Calendar] Fetched events:', events.length);
    console.log('📅 [Calendar] First 2 events:', events.slice(0, 2));
    
    return events;
  } catch (error) {
    console.error('❌ [Calendar] Error fetching events:', error);
    // Return empty array instead of throwing to prevent UI crash
    return [];
  }
};

/**
 * Get a single event by ID
 */
export const getEventById = async (id: string): Promise<CalendarEvent> => {
  try {
    console.log('📅 [Calendar] Fetching event:', id);
    
    const response = await fetch(`${CALENDAR_SERVICE_URL}/api/events/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('❌ [Calendar] Error fetching event:', error);
    throw error;
  }
};

/**
 * Create a new event
 */
export const createEvent = async (eventData: CreateEventInput): Promise<CalendarEvent> => {
  try {
    console.log('📅 [Calendar] Creating event:', eventData);
    
    const response = await fetch(`${CALENDAR_SERVICE_URL}/api/events`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(eventData),
    });

    const result = await handleResponse(response);
    console.log('✅ [Calendar] Event created successfully:', result.id);
    return result;
  } catch (error) {
    console.error('❌ [Calendar] Error creating event:', error);
    throw error;
  }
};

/**
 * Update an existing event
 */
export const updateEvent = async (id: string, eventData: Partial<UpdateEventInput>): Promise<CalendarEvent> => {
  try {
    console.log('📅 [Calendar] Updating event:', id, eventData);
    
    const response = await fetch(`${CALENDAR_SERVICE_URL}/api/events/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(eventData),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('❌ [Calendar] Error updating event:', error);
    throw error;
  }
};

/**
 * Delete an event
 */
export const deleteEvent = async (id: string): Promise<void> => {
  try {
    console.log('📅 [Calendar] Deleting event:', id);
    
    const response = await fetch(`${CALENDAR_SERVICE_URL}/api/events/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    await handleResponse(response);
    console.log('✅ [Calendar] Event deleted successfully');
  } catch (error) {
    console.error('❌ [Calendar] Error deleting event:', error);
    throw error;
  }
};

/**
 * Get events for a specific date range (useful for calendar views)
 */
export const getEventsInRange = async (startDate: Date, endDate: Date): Promise<CalendarEvent[]> => {
  console.log('📅 [Calendar] Getting events in range:', {
    start: startDate.toISOString(),
    end: endDate.toISOString()
  });
  
  return getAllEvents({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });
};

/**
 * Get upcoming events (next 7 days)
 */
export const getUpcomingEvents = async (days: number = 7): Promise<CalendarEvent[]> => {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  
  console.log('📅 [Calendar] Getting upcoming events for next', days, 'days');
  
  return getEventsInRange(startDate, endDate);
};

/**
 * Link an event to a note
 */
export const linkEventToNote = async (eventId: string, noteId: string): Promise<CalendarEvent> => {
  console.log('📅 [Calendar] Linking event to note:', { eventId, noteId });
  return updateEvent(eventId, { noteId });
};

// Google Calendar Integration (will be implemented later)
export const syncWithGoogleCalendar = async (): Promise<{ success: boolean; message: string }> => {
  console.warn('⚠️ [Calendar] Google Calendar sync not implemented yet');
  return { success: false, message: 'Not implemented' };
};

export const disconnectGoogleCalendar = async (): Promise<void> => {
  console.warn('⚠️ [Calendar] Google Calendar disconnect not implemented yet');
};