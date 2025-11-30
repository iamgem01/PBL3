// src/types/calendar.ts

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string; // ISO 8601 format
  endDate: string;   // ISO 8601 format
  allDay: boolean;
  color?: string;
  location?: string;
  noteId?: string;    // Link to note if created from note
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  reminders?: EventReminder[];
  recurrence?: EventRecurrence;
  attendees?: EventAttendee[];
}

export interface EventReminder {
  id: string;
  eventId: string;
  type: 'notification' | 'email';
  minutesBefore: number; // 15, 30, 60, 1440 (1 day)
}

export interface EventRecurrence {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: string;
  count?: number; // Number of occurrences
}

export interface EventAttendee {
  email: string;
  name?: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface CalendarViewType {
  view: 'month' | 'week' | 'day' | 'agenda';
}

export interface CalendarFilters {
  startDate?: string;
  endDate?: string;
  noteId?: string;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay?: boolean;
  color?: string;
  location?: string;
  noteId?: string;
  reminders?: Omit<EventReminder, 'id' | 'eventId'>[];
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
  id: string;
}

// Google Calendar Integration Types
export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  attendees?: { email: string; responseStatus?: string }[];
  recurrence?: string[];
}

export interface GoogleCalendarSyncStatus {
  isConnected: boolean;
  lastSyncAt?: string;
  syncEnabled: boolean;
  calendarId?: string;
}

// UI State Types
export interface CalendarState {
  events: CalendarEvent[];
  selectedEvent: CalendarEvent | null;
  currentDate: Date;
  viewType: CalendarViewType['view'];
  isLoading: boolean;
  error: string | null;
  syncStatus: GoogleCalendarSyncStatus;
}

export interface DayCellData {
  date: Date;
  events: CalendarEvent[];
  isToday: boolean;
  isCurrentMonth: boolean;
  isSelected: boolean;
}