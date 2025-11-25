import { createNotification } from './notificationService';
import type { CalendarEvent } from '@/types/calendar';

/**
 * Create notification when event is created
 */
export async function notifyEventCreated(event: CalendarEvent, userId: string) {
  try {
    await createNotification({
      userId,
      type: 'CALENDAR_EVENT_CREATED',
      title: '📅 New Event Created',
      message: `"${event.title}" has been added to your calendar`,
      priority: 'medium',
      relatedId: event.id,
      relatedType: 'event',
      actions: [
        {
          label: 'View Event',
          url: `/calendar?event=${event.id}`,
          primary: true
        }
      ],
      metadata: {
        eventTitle: event.title,
        // FIX: Changed startTime -> startDate
        eventStart: event.startDate,
        // FIX: Changed endTime -> endDate
        eventEnd: event.endDate
      }
    });

    // Schedule reminder 15 minutes before event
    // FIX: Changed startTime -> startDate
    const eventStart = new Date(event.startDate);
    const reminderTime = new Date(eventStart.getTime() - 15 * 60 * 1000);
    
    // Only schedule if event is in the future
    if (reminderTime > new Date()) {
      await createNotification({
        userId,
        type: 'CALENDAR_REMINDER',
        title: '🔔 Upcoming Event',
        message: `"${event.title}" starts in 15 minutes`,
        priority: 'high',
        relatedId: event.id,
        relatedType: 'event',
        scheduledFor: reminderTime,
        actions: [
          {
            label: 'View Event',
            url: `/calendar?event=${event.id}`,
            primary: true
          },
          {
            label: 'Dismiss',
            action: 'dismiss'
          }
        ],
        metadata: {
          eventTitle: event.title,
          // FIX: Changed startTime -> startDate
          eventStart: event.startDate
        }
      });
    }

    console.log('✅ Event notifications created for:', event.title);
  } catch (error) {
    console.error('❌ Failed to create event notifications:', error);
  }
}

/**
 * Create notification when event is updated
 */
export async function notifyEventUpdated(event: CalendarEvent, userId: string, changes: string[]) {
  try {
    await createNotification({
      userId,
      type: 'CALENDAR_EVENT_UPDATED',
      title: '📝 Event Updated',
      message: `"${event.title}" has been modified: ${changes.join(', ')}`,
      priority: 'medium',
      relatedId: event.id,
      relatedType: 'event',
      actions: [
        {
          label: 'View Changes',
          url: `/calendar?event=${event.id}`,
          primary: true
        }
      ],
      metadata: {
        eventTitle: event.title,
        changes
      }
    });

    console.log('✅ Event update notification created');
  } catch (error) {
    console.error('❌ Failed to create event update notification:', error);
  }
}

/**
 * Create notification when event is cancelled
 */
export async function notifyEventCancelled(event: CalendarEvent, userId: string) {
  try {
    await createNotification({
      userId,
      type: 'CALENDAR_EVENT_CANCELLED',
      title: '🚫 Event Cancelled',
      message: `"${event.title}" has been cancelled`,
      priority: 'high',
      relatedId: event.id,
      relatedType: 'event',
      actions: [
        {
          label: 'View Calendar',
          url: '/calendar',
          primary: true
        }
      ],
      metadata: {
        eventTitle: event.title,
        // FIX: Changed startTime -> startDate
        originalStart: event.startDate
      }
    });

    console.log('✅ Event cancellation notification created');
  } catch (error) {
    console.error('❌ Failed to create cancellation notification:', error);
  }
}