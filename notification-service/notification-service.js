import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cron from "node-cron";
import Notification from "./models/Notification.js";

dotenv.config();

const app = express();
const PORT = process.env.NOTIFICATION_PORT || 5004;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Middleware
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://mongodb:27017/smartnote")
  .then(() => console.log("✅ Notification Service: MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Simple auth middleware (get userId from header)
const getUserId = (req, res, next) => {
  const userId = req.headers["X-User-Id"];
  if (!userId) {
    return res.status(401).json({ error: "User ID required" });
  }
  req.userId = userId;
  next();
};

// ==================== NOTIFICATION ROUTES ====================

// Get all notifications for user
app.get("/api/notifications", getUserId, async (req, res) => {
  try {
    const { type, priority, isRead, limit = 50, skip = 0 } = req.query;

    const filter = {
      userId: req.userId,
      isArchived: false,
    };

    if (type) filter.type = { $in: type.split(",") };
    if (priority) filter.priority = { $in: priority.split(",") };
    if (isRead !== undefined) filter.isRead = isRead === "true";

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    console.log(
      `📬 [Notification] Retrieved ${notifications.length} notifications for user ${req.userId}`
    );

    // Transform _id to id for frontend compatibility
    const transformedNotifications = notifications.map((n) => ({
      ...n.toObject(),
      id: n._id.toString(),
    }));

    res.json({ notifications: transformedNotifications });
  } catch (error) {
    console.error("❌ Get notifications error:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Get unread count
app.get("/api/notifications/unread-count", getUserId, async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.userId);
    res.json({ count });
  } catch (error) {
    console.error("❌ Get unread count error:", error);
    res.status(500).json({ error: "Failed to get unread count" });
  }
});

// Get notification stats
app.get("/api/notifications/stats", getUserId, async (req, res) => {
  try {
    const stats = await Notification.getStats(req.userId);
    res.json(stats);
  } catch (error) {
    console.error("❌ Get stats error:", error);
    res.status(500).json({ error: "Failed to get stats" });
  }
});

// Get single notification
app.get("/api/notifications/:id", getUserId, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    // Transform _id to id for frontend compatibility
    const transformedNotification = {
      ...notification.toObject(),
      id: notification._id.toString(),
    };

    res.json({ notification: transformedNotification });
  } catch (error) {
    console.error("❌ Get notification error:", error);
    res.status(500).json({ error: "Failed to fetch notification" });
  }
});

// Create notification (internal use or from other services)
app.post("/api/notifications", async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();

    console.log(
      `✅ [Notification] Created: ${notification.type} for user ${notification.userId}`
    );

    // TODO: Send real-time update via WebSocket
    // TODO: Send email if enabled

    // Transform _id to id for frontend compatibility
    const transformedNotification = {
      ...notification.toObject(),
      id: notification._id.toString(),
    };

    res.status(201).json({ notification: transformedNotification });
  } catch (error) {
    console.error("❌ Create notification error:", error);
    res.status(500).json({ error: "Failed to create notification" });
  }
});

// Mark as read
app.patch("/api/notifications/:id/read", getUserId, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    console.log(`✅ [Notification] Marked as read: ${req.params.id}`);

    // Transform _id to id for frontend compatibility
    const transformedNotification = {
      ...notification.toObject(),
      id: notification._id.toString(),
    };

    res.json({ notification: transformedNotification });
  } catch (error) {
    console.error("❌ Mark as read error:", error);
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

// Mark all as read
app.post("/api/notifications/mark-all-read", getUserId, async (req, res) => {
  try {
    await Notification.markAllAsRead(req.userId);
    console.log(`✅ [Notification] Marked all as read for user ${req.userId}`);
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("❌ Mark all as read error:", error);
    res.status(500).json({ error: "Failed to mark all as read" });
  }
});

// Archive notification
app.delete("/api/notifications/:id", getUserId, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isArchived: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    console.log(`✅ [Notification] Archived: ${req.params.id}`);
    res.json({ message: "Notification archived" });
  } catch (error) {
    console.error("❌ Archive notification error:", error);
    res.status(500).json({ error: "Failed to archive notification" });
  }
});

// ==================== CALENDAR REMINDER SCHEDULER ====================

// Check for upcoming events every minute and create reminders
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const in15Minutes = new Date(now.getTime() + 15 * 60 * 1000);

    // Find events that need reminders (this would need integration with calendar service)
    // For now, this is a placeholder

    console.log("⏰ [Notification] Checking for upcoming events...");
  } catch (error) {
    console.error("❌ Reminder scheduler error:", error);
  }
});

// Clean up old archived notifications daily at 2 AM
cron.schedule("0 2 * * *", async () => {
  try {
    await Notification.cleanupOld();
  } catch (error) {
    console.error("❌ Cleanup error:", error);
  }
});

// ==================== HELPER FUNCTIONS ====================

// Create calendar reminder notification
export async function createCalendarReminder(
  userId,
  eventId,
  eventTitle,
  eventTime
) {
  try {
    const notification = new Notification({
      userId,
      type: "CALENDAR_REMINDER",
      title: "🔔 Upcoming Event",
      message: `"${eventTitle}" starts in 15 minutes`,
      priority: "high",
      relatedId: eventId,
      relatedType: "event",
      actions: [
        {
          label: "View Event",
          url: `/calendar?event=${eventId}`,
          primary: true,
        },
        { label: "Dismiss", action: "dismiss" },
      ],
      scheduledFor: new Date(eventTime.getTime() - 15 * 60 * 1000),
    });

    await notification.save();
    console.log(
      `✅ [Notification] Calendar reminder created for event ${eventId}`
    );
    return notification;
  } catch (error) {
    console.error("❌ Create calendar reminder error:", error);
    throw error;
  }
}

// Create event update notification
export async function createEventUpdateNotification(
  userId,
  eventId,
  eventTitle,
  changeType
) {
  try {
    const messages = {
      created: `New event "${eventTitle}" has been created`,
      updated: `Event "${eventTitle}" has been updated`,
      cancelled: `Event "${eventTitle}" has been cancelled`,
    };

    const notification = new Notification({
      userId,
      type: `CALENDAR_EVENT_${changeType.toUpperCase()}`,
      title: "📅 Calendar Update",
      message: messages[changeType],
      priority: changeType === "cancelled" ? "high" : "medium",
      relatedId: eventId,
      relatedType: "event",
      actions: [{ label: "View Calendar", url: "/calendar", primary: true }],
    });

    await notification.save();
    console.log(`✅ [Notification] Event ${changeType} notification created`);
    return notification;
  } catch (error) {
    console.error("❌ Create event notification error:", error);
    throw error;
  }
}

// Create workspace invite notification
export async function createWorkspaceInviteNotification(
  userId,
  workspaceName,
  inviterName
) {
  try {
    const notification = new Notification({
      userId,
      type: "WORKSPACE_INVITE",
      title: "👥 Workspace Invitation",
      message: `${inviterName} invited you to join "${workspaceName}"`,
      priority: "high",
      actions: [
        { label: "Accept", action: "accept_invite", primary: true },
        { label: "Decline", action: "decline_invite" },
      ],
    });

    await notification.save();
    console.log(`✅ [Notification] Workspace invite notification created`);
    return notification;
  } catch (error) {
    console.error("❌ Create workspace invite notification error:", error);
    throw error;
  }
}

// ==================== HEALTH CHECK ====================

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "notification-service",
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log("=================================");
  console.log(`✅ Notification Service running on http://localhost:${PORT}`);
  console.log("=================================");
});
