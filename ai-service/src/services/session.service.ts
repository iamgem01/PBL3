// src/services/session.service.ts
import { Session, IFileData } from '../models/session.model.js';
import { v4 as uuidv4 } from 'uuid';

export class SessionService {
  /**
   * Tạo session mới với userId bắt buộc
   */
  static async createSession(userId: string, action?: string): Promise<string> {
    if (!userId || userId.trim() === '') {
      throw new Error('UserId là bắt buộc để tạo session');
    }

    const sessionId = uuidv4();
    const session = new Session({
      sessionId,
      files: [],
      metadata: {
        userId: userId.trim(),
        action,
        createdAt: new Date()
      }
    });
    
    await session.save();
    console.log(`✅ Created new session for user ${userId}: ${sessionId}`);
    return sessionId;
  }

  /**
   * Cập nhật context cho session với user validation
   */
  static async updateContext(sessionId: string, context: string, userId: string) {
    if (!sessionId || !userId) {
      throw new Error('SessionId và UserId là bắt buộc');
    }

    const result = await Session.findOneAndUpdate(
      { 
        sessionId, 
        'metadata.userId': userId
      },
      { 
        $set: { 
          context: context.trim(),
          lastAccessed: new Date()
        } 
      },
      { new: true, runValidators: true }
    );
    
    if (result) {
      console.log(`✅ Updated context for session: ${sessionId} (${context.length} chars)`);
    } else {
      console.warn(`⚠️ Cannot update context - session not found or access denied: ${sessionId}`);
      throw new Error('Session không tồn tại hoặc không có quyền truy cập');
    }
    
    return result;
  }

  /**
   * Thêm file vào session với user validation
   */
  static async addFiles(sessionId: string, files: Array<Express.Multer.File>, userId?: string) {
    if (!sessionId || !files || files.length === 0) {
      throw new Error('SessionId và files là bắt buộc');
    }

    const fileData = files.map(file => ({
      fileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      content: file.buffer
    }));

    const query: any = { sessionId };
    if (userId) {
      query['metadata.userId'] = userId;
    }

    const result = await Session.findOneAndUpdate(
      query,
      { 
        $push: { files: { $each: fileData } },
        $set: { lastAccessed: new Date() }
      },
      { new: true, runValidators: true }
    );

    if (result) {
      console.log(`✅ Added ${files.length} files to session: ${sessionId}`);
    } else {
      console.warn(`⚠️ Cannot add files - session not found or access denied: ${sessionId}`);
      throw new Error('Session không tồn tại hoặc không có quyền truy cập');
    }

    return result;
  }

  /**
   * Lấy dữ liệu session và update lastAccessed
   */
  static async getSession(sessionId: string, userId?: string) {
    if (!sessionId) {
      throw new Error('SessionId là bắt buộc');
    }

    const query: any = { sessionId };
    if (userId) {
      query['metadata.userId'] = userId;
    }

    const session = await Session.findOneAndUpdate(
      query,
      { $set: { lastAccessed: new Date() } },
      { new: true }
    );

    if (session) {
      console.log(`✅ Retrieved session: ${sessionId} for user: ${userId || 'anonymous'}`);
      console.log(`📊 Session details - Files: ${session.files.length}, Context: ${session.context ? 'Yes' : 'No'}`);
    } else if (userId) {
      console.warn(`⚠️ Session ${sessionId} not found or access denied for user: ${userId}`);
    } else {
      console.warn(`⚠️ Session ${sessionId} not found`);
    }

    return session;
  }

  /**
   * 🔥 Cập nhật lastAccessed time
   */
  static async updateLastAccessed(sessionId: string, userId?: string) {
    if (!sessionId) {
      throw new Error('SessionId là bắt buộc');
    }

    const query: any = { sessionId };
    if (userId) {
      query['metadata.userId'] = userId;
    }

    const result = await Session.findOneAndUpdate(
      query,
      { $set: { lastAccessed: new Date() } },
      { new: true }
    );

    if (result) {
      console.log(`✅ Updated lastAccessed for session: ${sessionId}`);
    } else {
      console.warn(`⚠️ Cannot update lastAccessed - session not found: ${sessionId}`);
    }

    return result;
  }

  /**
   * Lấy context từ session
   */
  static async getContext(sessionId: string, userId?: string): Promise<string | null> {
    const session = await this.getSession(sessionId, userId);
    return session?.context || null;
  }

  /**
   * Lấy files từ session
   */
  static async getFiles(sessionId: string, userId?: string): Promise<IFileData[]> {
    const session = await this.getSession(sessionId, userId);
    return session?.files || [];
  }

  /**
   * 🔥 MERGE CONTEXT: Kết hợp context mới với context hiện có
   */
  static async mergeContext(sessionId: string, newContext: string, userId: string): Promise<string> {
    if (!sessionId || !userId || !newContext) {
      throw new Error('SessionId, UserId và Context là bắt buộc');
    }

    const session = await this.getSession(sessionId, userId);
    if (!session) {
      throw new Error('Session không tồn tại');
    }

    const existingContext = session.context || '';
    let mergedContext = '';

    if (existingContext.includes(newContext)) {
      // Context mới đã tồn tại -> giữ nguyên
      mergedContext = existingContext;
      console.log(`📖 Context already exists in session, keeping existing context`);
    } else if (existingContext) {
      // Kết hợp context cũ và mới
      mergedContext = `${existingContext}\n\n---\n\n${newContext}`;
      console.log(`🔄 Merged new context with existing context`);
    } else {
      // Context mới hoàn toàn
      mergedContext = newContext;
      console.log(`📝 Added new context to session`);
    }

    // Cập nhật context đã merge
    await this.updateContext(sessionId, mergedContext, userId);
    return mergedContext;
  }

  /**
   * 🔥 SMART ADD FILES: Thêm files mới, tránh duplicate
   */
  static async smartAddFiles(sessionId: string, newFiles: Array<Express.Multer.File>, userId: string) {
    if (!sessionId || !userId || !newFiles || newFiles.length === 0) {
      throw new Error('SessionId, UserId và Files là bắt buộc');
    }

    const session = await this.getSession(sessionId, userId);
    if (!session) {
      throw new Error('Session không tồn tại');
    }

    const existingFiles = session.files || [];
    const filesToAdd = newFiles.filter(newFile => 
      !existingFiles.some(existingFile => 
        existingFile.fileName === newFile.originalname && 
        existingFile.size === newFile.size
      )
    );

    if (filesToAdd.length > 0) {
      await this.addFiles(sessionId, filesToAdd, userId);
      console.log(`📎 Added ${filesToAdd.length} new files (filtered ${newFiles.length - filesToAdd.length} duplicates)`);
    } else {
      console.log(`📎 All ${newFiles.length} files already exist in session`);
    }

    // Trả về tất cả files (bao gồm cả cũ và mới)
    const updatedSession = await this.getSession(sessionId, userId);
    return updatedSession?.files || [];
  }

  /**
   * Xóa session (optional - for cleanup)
   */
  static async deleteSession(sessionId: string, userId?: string) {
    const query: any = { sessionId };
    if (userId) {
      query['metadata.userId'] = userId;
    }

    const result = await Session.findOneAndDelete(query);
    
    if (result) {
      console.log(`🗑️ Deleted session: ${sessionId}`);
    } else {
      console.warn(`⚠️ Cannot delete session - not found: ${sessionId}`);
    }

    return result;
  }

  /**
   * Lấy tất cả sessions của user
   */
  static async getUserSessions(userId: string) {
    if (!userId) {
      throw new Error('UserId là bắt buộc');
    }

    const sessions = await Session.find({ 'metadata.userId': userId })
      .sort({ lastAccessed: -1 })
      .limit(50)
      .select('sessionId context files lastAccessed metadata.action');

    console.log(`📋 Found ${sessions.length} sessions for user: ${userId}`);
    return sessions;
  }

  /**
   * Clear old sessions (cleanup job)
   */
  static async cleanupOldSessions(olderThanHours: number = 24) {
    const cutoffDate = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    
    const result = await Session.deleteMany({
      lastAccessed: { $lt: cutoffDate }
    });

    console.log(`🧹 Cleaned up ${result.deletedCount} old sessions (older than ${olderThanHours}h)`);
    return result;
  }

  /**
   * 🔥 GET SESSION SUMMARY: Lấy thông tin tóm tắt session
   */
  static async getSessionSummary(sessionId: string, userId?: string) {
    const session = await this.getSession(sessionId, userId);
    if (!session) {
      return null;
    }

    return {
      sessionId: session.sessionId,
      hasContext: !!session.context,
      contextLength: session.context?.length || 0,
      filesCount: session.files.length,
      totalFilesSize: session.files.reduce((sum, file) => sum + file.size, 0),
      lastAccessed: session.lastAccessed,
      metadata: session.metadata
    };
  }
}