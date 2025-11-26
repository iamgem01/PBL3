import mongoose, { Schema, Document } from 'mongoose';

export interface IEventReminder {
  type: 'notification' | 'email';
  minutesBefore: number;
}

export interface IEventRecurrence {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date;
  count?: number;
}

export interface IEventAttendee {
  email: string;
  name?: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface IEvent extends Document {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  color?: string;
  location?: string;
  noteId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  reminders?: IEventReminder[];
  recurrence?: IEventRecurrence;
  attendees?: IEventAttendee[];
}

const EventReminderSchema = new Schema<IEventReminder>({
  type: {
    type: String,
    enum: ['notification', 'email'],
    required: true,
  },
  minutesBefore: {
    type: Number,
    required: true,
  },
});

const EventRecurrenceSchema = new Schema<IEventRecurrence>({
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true,
  },
  interval: {
    type: Number,
    required: true,
    default: 1,
  },
  endDate: {
    type: Date,
  },
  count: {
    type: Number,
  },
});

const EventAttendeeSchema = new Schema<IEventAttendee>({
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
  },
});

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    allDay: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: '#3B82F6',
    },
    location: {
      type: String,
      trim: true,
    },
    noteId: {
      type: String,
    },
    createdBy: {
      type: String,
      required: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    reminders: [EventReminderSchema],
    recurrence: EventRecurrenceSchema,
    attendees: [EventAttendeeSchema],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
EventSchema.index({ createdBy: 1, startDate: 1 });
EventSchema.index({ createdBy: 1, endDate: 1 });
EventSchema.index({ startDate: 1, endDate: 1 });
EventSchema.index({ isDeleted: 1 });

// Virtual for checking if event is currently happening
EventSchema.virtual('isNow').get(function () {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
});

// Virtual for checking if event is upcoming
EventSchema.virtual('isUpcoming').get(function () {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  return this.startDate > now && this.startDate <= oneHourLater;
});

// Method to check if user owns this event
EventSchema.methods.isOwnedBy = function (userId: string): boolean {
  return this.createdBy === userId;
};

export default mongoose.model<IEvent>('Event', EventSchema);