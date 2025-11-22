// src/services/session.service.ts
import { Session, IFileData } from '../models/session.model.js';
import { v4 as uuidv4 } from 'uuid';

export class SessionService {
  /**
   * Tạo session mới
   */
  static async createSession(userId?: string, action?: string) {
    const sessionId = uuidv4();
    const session = new Session({
      sessionId,
      files: [],
      metadata: {
        userId,
        action
      }
    });
    await session.save();
    console.log(`✅ Created new session: ${sessionId}`);
    return sessionId;
  }

  /**
   * Cập nhật context cho session
   */
  static async updateContext(sessionId: string, context: string) {
    const result = await Session.findOneAndUpdate(
      { sessionId },
      { 
        $set: { 
          context,
          lastAccessed: new Date()
        } 
      },
      { new: true }
    );
    
    if (result) {
      console.log(`✅ Updated context for session: ${sessionId}`);
    }
    
    return result;
  }

  /**
   * Thêm file vào session
   */
  static async addFiles(sessionId: string, files: Array<Express.Multer.File>) {
    const fileData = files.map(file => ({
      fileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      content: file.buffer
    }));

    const result = await Session.findOneAndUpdate(
      { sessionId },
      { 
        $push: { files: { $each: fileData } },
        $set: { lastAccessed: new Date() }
      },
      { new: true }
    );

    if (result) {
      console.log(`✅ Added ${files.length} files to session: ${sessionId}`);
    }

    return result;
  }

  /**
   * Lấy dữ liệu session và update lastAccessed
   */
  static async getSession(sessionId: string) {
    const session = await Session.findOneAndUpdate(
      { sessionId },
      { $set: { lastAccessed: new Date() } },
      { new: true }
    );

    if (session) {
      console.log(`✅ Retrieved session: ${sessionId} (Files: ${session.files.length}, Has Context: ${!!session.context})`);
    }

    return session;
  }

  /**
   * 🔥 NEW: Cập nhật lastAccessed time
   */
  static async updateLastAccessed(sessionId: string) {
    const result = await Session.findOneAndUpdate(
      { sessionId },
      { $set: { lastAccessed: new Date() } },
      { new: true }
    );

    if (result) {
      console.log(`✅ Updated lastAccessed for session: ${sessionId}`);
    }

    return result;
  }

  /**
   * Lấy context từ session
   */
  static async getContext(sessionId: string): Promise<string | null> {
    const session = await this.getSession(sessionId);
    return session?.context || null;
  }

  /**
   * Lấy files từ session
   */
  static async getFiles(sessionId: string): Promise<IFileData[]> {
    const session = await this.getSession(sessionId);
    return session?.files || [];
  }

  /**
   * 🔥 NEW: Xóa session (optional - for cleanup)
   */
  static async deleteSession(sessionId: string) {
    const result = await Session.findOneAndDelete({ sessionId });
    
    if (result) {
      console.log(`🗑️ Deleted session: ${sessionId}`);
    }

    return result;
  }

  /**
   * 🔥 NEW: Lấy tất cả sessions của user
   */
  static async getUserSessions(userId: string) {
    const sessions = await Session.find({ 'metadata.userId': userId })
      .sort({ lastAccessed: -1 })
      .limit(50);

    console.log(`📋 Found ${sessions.length} sessions for user: ${userId}`);
    return sessions;
  }

  /**
   * 🔥 NEW: Clear old sessions (cleanup job)
   */
  static async cleanupOldSessions(olderThanHours: number = 24) {
    const cutoffDate = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    
    const result = await Session.deleteMany({
      lastAccessed: { $lt: cutoffDate }
    });

    console.log(`🧹 Cleaned up ${result.deletedCount} old sessions`);
    return result;
  }
}