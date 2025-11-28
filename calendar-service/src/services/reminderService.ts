import cron from "node-cron";
import axios from "axios";
import Event from "../models/Event";

const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || "http://localhost:5004";
const CHECK_INTERVAL = "* * * * *"; // Every minute

interface ReminderEvent {
  eventId: string;
  userId: string;
  title: string;
  startDate: Date;
  location?: string;
}

class ReminderService {
  private notifiedEvents: Set<string> = new Set();

  /**
   * Start the reminder scheduler
   */
  start() {
    console.log("🔔 Starting calendar reminder service...");

    // Check for upcoming events every minute
    cron.schedule(CHECK_INTERVAL, async () => {
      await this.checkUpcomingEvents();
    });

    // Clean up notified events daily at midnight
    cron.schedule("0 0 * * *", () => {
      this.notifiedEvents.clear();
      console.log("🧹 Cleared notified events cache");
    });

    console.log("✅ Reminder service started successfully");
  }

  /**
   * Check for events starting in 15 minutes
   */
  private async checkUpcomingEvents() {
    try {
      const now = new Date();
      const in15Minutes = new Date(now.getTime() + 15 * 60 * 1000);
      const in16Minutes = new Date(now.getTime() + 16 * 60 * 1000);

      // Find events starting between 15-16 minutes from now
      const upcomingEvents = await Event.find({
        isDeleted: false,
        startDate: {
          $gte: in15Minutes,
          $lt: in16Minutes,
        },
      }).lean();

      if (upcomingEvents.length > 0) {
        console.log(`🔔 Found ${upcomingEvents.length} upcoming events`);

        for (const event of upcomingEvents) {
          await this.sendReminder({
            eventId: event._id.toString(),
            userId: event.createdBy,
            title: event.title,
            startDate: event.startDate,
            location: event.location,
          });
        }
      }
    } catch (error) {
      console.error("❌ Error checking upcoming events:", error);
    }
  }

  /**
   * Send reminder notification
   */
  private async sendReminder(event: ReminderEvent) {
    // Check if already notified for this event
    const notificationKey = `${event.eventId}-${event.startDate.getTime()}`;

    if (this.notifiedEvents.has(notificationKey)) {
      return;
    }

    try {
      const startTimeStr = new Date(event.startDate).toLocaleTimeString(
        "vi-VN",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );

      const locationInfo = event.location ? ` tại ${event.location}` : "";

      // Create notification via notification-service
      await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications`, {
        userId: event.userId,
        type: "CALENDAR_REMINDER",
        title: "🔔 Sự kiện sắp diễn ra",
        message: `"${event.title}" sẽ bắt đầu lúc ${startTimeStr}${locationInfo}`,
        priority: "high",
        relatedId: event.eventId,
        relatedType: "event",
        metadata: {
          eventTitle: event.title,
          startDate: event.startDate,
          location: event.location,
          reminderType: "15min",
        },
        actions: [
          {
            label: "Xem chi tiết",
            url: `/calendar?event=${event.eventId}`,
            primary: true,
          },
          {
            label: "Đóng",
            action: "dismiss",
          },
        ],
      });

      // Mark as notified
      this.notifiedEvents.add(notificationKey);

      console.log(
        `✅ Sent reminder for event: ${event.title} (${event.eventId})`
      );
    } catch (error) {
      console.error(
        `❌ Failed to send reminder for event ${event.eventId}:`,
        error
      );
    }
  }

  /**
   * Manually trigger reminder for an event
   */
  async sendManualReminder(eventId: string, userId: string) {
    try {
      const event = await Event.findOne({
        _id: eventId,
        createdBy: userId,
        isDeleted: false,
      }).lean();

      if (!event) {
        throw new Error("Event not found");
      }

      await this.sendReminder({
        eventId: event._id.toString(),
        userId: event.createdBy,
        title: event.title,
        startDate: event.startDate,
        location: event.location,
      });

      return { success: true, message: "Reminder sent successfully" };
    } catch (error) {
      console.error("❌ Failed to send manual reminder:", error);
      throw error;
    }
  }
}

export default new ReminderService();
