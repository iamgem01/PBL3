import { Request, Response } from "express";
import Event from "../models/Event";

/**
 * 🔍 Helper: Check if new event overlaps with existing events
 * Returns conflicting events if any
 */
const checkEventOverlap = async (
  userId: string,
  startDate: Date,
  endDate: Date,
  excludeEventId?: string
): Promise<any[]> => {
  const query: any = {
    createdBy: userId,
    isDeleted: false,
    // Check for time overlap using standard interval overlap logic
    // Two intervals [A_start, A_end] and [B_start, B_end] overlap if:
    // A_start < B_end AND A_end > B_start
    $and: [{ startDate: { $lt: endDate } }, { endDate: { $gt: startDate } }],
  };

  // Exclude current event when updating
  if (excludeEventId) {
    query._id = { $ne: excludeEventId };
  }

  return await Event.find(query);
};

// Get all events for a user (with optional date filters)
export const getAllEvents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      res.status(401).json({ error: "User ID not provided" });
      return;
    }

    const { startDate, endDate, noteId } = req.query;

    // Build query
    const query: any = {
      createdBy: userId,
      isDeleted: false,
    };

    // Add date filters if provided
    if (startDate || endDate) {
      query.$or = [
        // Event starts within range
        {
          startDate: {
            ...(startDate && { $gte: new Date(startDate as string) }),
            ...(endDate && { $lte: new Date(endDate as string) }),
          },
        },
        // Event ends within range
        {
          endDate: {
            ...(startDate && { $gte: new Date(startDate as string) }),
            ...(endDate && { $lte: new Date(endDate as string) }),
          },
        },
        // Event spans across range
        {
          startDate: { $lte: new Date(startDate as string) },
          endDate: { $gte: new Date(endDate as string) },
        },
      ];
    }

    // Filter by noteId if provided
    if (noteId) {
      query.noteId = noteId;
    }

    const events = await Event.find(query).sort({ startDate: 1 });

    console.log(`✅ Fetched ${events.length} events for user ${userId}`);
    res.json(events);
  } catch (error) {
    console.error("❌ Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

// Get single event by ID
export const getEventById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      res.status(401).json({ error: "User ID not provided" });
      return;
    }

    const event = await Event.findOne({
      _id: id,
      createdBy: userId,
      isDeleted: false,
    });

    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    res.json(event);
  } catch (error) {
    console.error("❌ Error fetching event:", error);
    res.status(500).json({ error: "Failed to fetch event" });
  }
};

// Create new event
export const createEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      res.status(401).json({ error: "User ID not provided" });
      return;
    }

    const {
      title,
      description,
      startDate,
      endDate,
      allDay,
      color,
      location,
      noteId,
      reminders,
      recurrence,
      attendees,
    } = req.body;

    // Validate required fields
    if (!title || !startDate || !endDate) {
      res
        .status(400)
        .json({ error: "Title, startDate, and endDate are required" });
      return;
    }

    // Validate date range
    if (new Date(startDate) >= new Date(endDate)) {
      res.status(400).json({ error: "End date must be after start date" });
      return;
    }

    // 🔥 CRITICAL FIX: Check for overlapping events
    const overlappingEvents = await checkEventOverlap(
      userId,
      new Date(startDate),
      new Date(endDate)
    );

    if (overlappingEvents.length > 0) {
      console.warn(`⚠️ Event overlap detected for user ${userId}`);
      console.warn(`   Conflicting with ${overlappingEvents.length} event(s)`);

      res.status(409).json({
        error: "Time conflict detected",
        message: `You already have ${overlappingEvents.length} event(s) scheduled during this time`,
        conflictingEvents: overlappingEvents.map((e) => ({
          id: e._id,
          title: e.title,
          startDate: e.startDate,
          endDate: e.endDate,
        })),
      });
      return;
    }

    const event = new Event({
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      allDay: allDay || false,
      color: color || "#3B82F6",
      location,
      noteId,
      createdBy: userId,
      reminders,
      recurrence,
      attendees,
    });

    await event.save();

    console.log(`✅ Event created: ${event._id} by user ${userId}`);
    res.status(201).json(event);
  } catch (error) {
    console.error("❌ Error creating event:", error);
    res.status(500).json({ error: "Failed to create event" });
  }
};

// Update event
export const updateEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      res.status(401).json({ error: "User ID not provided" });
      return;
    }

    const event = await Event.findOne({
      _id: id,
      createdBy: userId,
      isDeleted: false,
    });

    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    const {
      title,
      description,
      startDate,
      endDate,
      allDay,
      color,
      location,
      noteId,
      reminders,
      recurrence,
      attendees,
    } = req.body;

    // Validate date range if both dates are provided
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      res.status(400).json({ error: "End date must be after start date" });
      return;
    }

    // 🔥 CRITICAL FIX: Check for overlapping events when dates are being updated
    if (startDate || endDate) {
      const finalStartDate = startDate ? new Date(startDate) : event.startDate;
      const finalEndDate = endDate ? new Date(endDate) : event.endDate;

      const overlappingEvents = await checkEventOverlap(
        userId,
        finalStartDate,
        finalEndDate,
        id // Exclude current event from overlap check
      );

      if (overlappingEvents.length > 0) {
        console.warn(
          `⚠️ Event overlap detected for user ${userId} while updating ${id}`
        );

        res.status(409).json({
          error: "Time conflict detected",
          message: `You already have ${overlappingEvents.length} event(s) scheduled during this time`,
          conflictingEvents: overlappingEvents.map((e) => ({
            id: e._id,
            title: e.title,
            startDate: e.startDate,
            endDate: e.endDate,
          })),
        });
        return;
      }
    }

    // Update fields
    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (startDate !== undefined) event.startDate = new Date(startDate);
    if (endDate !== undefined) event.endDate = new Date(endDate);
    if (allDay !== undefined) event.allDay = allDay;
    if (color !== undefined) event.color = color;
    if (location !== undefined) event.location = location;
    if (noteId !== undefined) event.noteId = noteId;
    if (reminders !== undefined) event.reminders = reminders;
    if (recurrence !== undefined) event.recurrence = recurrence;
    if (attendees !== undefined) event.attendees = attendees;

    await event.save();

    console.log(`✅ Event updated: ${event._id}`);
    res.json(event);
  } catch (error) {
    console.error("❌ Error updating event:", error);
    res.status(500).json({ error: "Failed to update event" });
  }
};

// Delete event (soft delete)
export const deleteEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      res.status(401).json({ error: "User ID not provided" });
      return;
    }

    const event = await Event.findOne({
      _id: id,
      createdBy: userId,
      isDeleted: false,
    });

    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    event.isDeleted = true;
    await event.save();

    console.log(`✅ Event deleted: ${event._id}`);
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting event:", error);
    res.status(500).json({ error: "Failed to delete event" });
  }
};

// Get upcoming events (next N days)
export const getUpcomingEvents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const days = parseInt(req.query.days as string) || 7;

    if (!userId) {
      res.status(401).json({ error: "User ID not provided" });
      return;
    }

    const now = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const events = await Event.find({
      createdBy: userId,
      isDeleted: false,
      startDate: { $gte: now, $lte: endDate },
    }).sort({ startDate: 1 });

    console.log(
      `✅ Fetched ${events.length} upcoming events for user ${userId}`
    );
    res.json(events);
  } catch (error) {
    console.error("❌ Error fetching upcoming events:", error);
    res.status(500).json({ error: "Failed to fetch upcoming events" });
  }
};
