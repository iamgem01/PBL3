import type { CalendarEvent, DayCellData } from '@/types/calendar';

/**
 * Get the number of days in a month
 */
export const getDaysInMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

/**
 * Get the first day of the month (0 = Sunday, 6 = Saturday)
 */
export const getFirstDayOfMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

/**
 * Get all days to display in calendar (including previous/next month)
 */
export const getCalendarDays = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  const firstDay = getFirstDayOfMonth(date);
  const daysInMonth = getDaysInMonth(date);
  const daysInPrevMonth = getDaysInMonth(new Date(year, month - 1));
  
  const days: Date[] = [];
  
  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push(new Date(year, month - 1, daysInPrevMonth - i));
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }
  
  // Next month days (fill to 42 cells = 6 weeks)
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i));
  }
  
  return days;
};

/**
 * Check if two dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

/**
 * Check if a date is in the current month
 */
export const isCurrentMonth = (date: Date, currentDate: Date): boolean => {
  return (
    date.getFullYear() === currentDate.getFullYear() &&
    date.getMonth() === currentDate.getMonth()
  );
};

/**
 * Format date for display
 */
export const formatDate = (date: Date | string, format: 'short' | 'long' | 'time' = 'short'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'long':
      return d.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    case 'time':
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    default:
      return d.toLocaleDateString();
  }
};

/**
 * Get month name
 */
export const getMonthName = (date: Date, short: boolean = false): string => {
  return date.toLocaleDateString('en-US', { month: short ? 'short' : 'long' });
};

/**
 * Get events for a specific day
 */
export const getEventsForDay = (date: Date, events: CalendarEvent[]): CalendarEvent[] => {
  return events.filter(event => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    
    // Check if the date falls within the event's date range
    return date >= new Date(eventStart.toDateString()) && 
           date <= new Date(eventEnd.toDateString());
  });
};

/**
 * Sort events by start date
 */
export const sortEventsByDate = (events: CalendarEvent[]): CalendarEvent[] => {
  return [...events].sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
};

/**
 * Check if an event is happening now
 */
export const isEventNow = (event: CalendarEvent): boolean => {
  const now = new Date();
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  return now >= start && now <= end;
};

/**
 * Check if an event is upcoming (within next hour)
 */
export const isEventUpcoming = (event: CalendarEvent): boolean => {
  const now = new Date();
  const start = new Date(event.startDate);
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  return start > now && start <= oneHourLater;
};

/**
 * Get event duration in minutes
 */
export const getEventDuration = (event: CalendarEvent): number => {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
};

/**
 * Format event duration for display
 */
export const formatEventDuration = (event: CalendarEvent): string => {
  const duration = getEventDuration(event);
  
  if (duration < 60) {
    return `${duration}m`;
  } else if (duration < 1440) {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  } else {
    const days = Math.floor(duration / 1440);
    return `${days}d`;
  }
};

/**
 * Generate DayCellData for calendar grid
 */
export const generateDayCellData = (
  date: Date, 
  events: CalendarEvent[], 
  currentDate: Date,
  selectedDate?: Date
): DayCellData => {
  return {
    date,
    events: getEventsForDay(date, events),
    isToday: isToday(date),
    isCurrentMonth: isCurrentMonth(date, currentDate),
    isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
  };
};

/**
 * Get week dates for week view
 */
export const getWeekDates = (date: Date): Date[] => {
  const day = date.getDay();
  const diff = date.getDate() - day; // Get Sunday of current week
  
  const weekDates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    weekDates.push(new Date(date.getFullYear(), date.getMonth(), diff + i));
  }
  
  return weekDates;
};

/**
 * Get date range for current view
 */
export const getViewDateRange = (
  date: Date, 
  viewType: 'month' | 'week' | 'day'
): { start: Date; end: Date } => {
  switch (viewType) {
    case 'day':
      return {
        start: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59),
      };
    case 'week': {
      const weekDates = getWeekDates(date);
      return {
        start: weekDates[0],
        end: new Date(weekDates[6].getFullYear(), weekDates[6].getMonth(), weekDates[6].getDate(), 23, 59, 59),
      };
    }
    case 'month':
    default: {
      const calendarDays = getCalendarDays(date);
      return {
        start: calendarDays[0],
        end: new Date(
          calendarDays[calendarDays.length - 1].getFullYear(),
          calendarDays[calendarDays.length - 1].getMonth(),
          calendarDays[calendarDays.length - 1].getDate(),
          23, 59, 59
        ),
      };
    }
  }
};