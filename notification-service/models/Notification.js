import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
    ref: 'User'
  },
  type: {
    type: String,
    required: true,
    enum: [
      'CALENDAR_REMINDER',
      'CALENDAR_EVENT_CREATED',
      'CALENDAR_EVENT_UPDATED',
      'CALENDAR_EVENT_CANCELLED',
      'NOTE_SHARED',
      'NOTE_COMMENT',
      'NOTE_MENTION',
      'WORKSPACE_INVITE',
      'WORKSPACE_JOINED',
      'SYSTEM_UPDATE',
      'SYSTEM_MAINTENANCE',
      'TASK_ASSIGNED',
      'TASK_COMPLETED',
      'TASK_DUE_SOON'
    ],
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  
  // Related entity
  relatedId: {
    type: String,
    index: true
  },
  relatedType: {
    type: String,
    enum: ['event', 'note', 'workspace', 'task']
  },
  
  // Actions
  actions: [{
    label: String,
    url: String,
    action: String,
    primary: Boolean
  }],
  
  // Status
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  isArchived: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  readAt: {
    type: Date
  },
  scheduledFor: {
    type: Date
  },
  
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  icon: String,
  avatarUrl: String
}, {
  timestamps: true
});

// Compound indexes for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isArchived: 1, createdAt: -1 });
notificationSchema.index({ scheduledFor: 1 }, { sparse: true });

// Static methods
notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({ 
    userId, 
    isRead: false, 
    isArchived: false 
  });
};

notificationSchema.statics.markAllAsRead = async function(userId) {
  return this.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

notificationSchema.statics.getStats = async function(userId) {
  const [total, unread, byType] = await Promise.all([
    this.countDocuments({ userId, isArchived: false }),
    this.countDocuments({ userId, isRead: false, isArchived: false }),
    this.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId), isArchived: false } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ])
  ]);
  
  return {
    total,
    unread,
    byType: byType.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {})
  };
};

// Clean up old archived notifications (older than 30 days)
notificationSchema.statics.cleanupOld = async function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const result = await this.deleteMany({
    isArchived: true,
    createdAt: { $lt: thirtyDaysAgo }
  });
  
  console.log(`🧹 Cleaned up ${result.deletedCount} old notifications`);
  return result;
};

export default mongoose.model('Notification', notificationSchema);