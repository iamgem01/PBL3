import { Request, Response, NextFunction } from "express";
import { geminiService, UserPreferences } from "../services/gemini.service.js";
import { SessionService } from "../services/session.service.js";
import multer from "multer";

// --- CẤU HÌNH UPLOAD ---
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // Giới hạn 20MB mỗi file
  },
  fileFilter: (req, file, cb) => {
    // Chấp nhận: Ảnh, PDF, Text, Word, Excel
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "text/plain",
      "text/markdown",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Định dạng file ${file.mimetype} không được hỗ trợ`));
    }
  },
});

// --- HELPER: Chuẩn hóa dữ liệu file ---
const processUploadedFiles = (files: Express.Multer.File[] | undefined) => {
  if (!files || files.length === 0) return undefined;
  return files.map((file) => ({
    mimeType: file.mimetype,
    data: file.buffer,
    fileName: file.originalname,
  }));
};

// 🔥 FIXED: Helper function to process session data - LOGIC MỚI HOÀN TOÀN
const processSession = async (
  sessionId: string | undefined,
  context: string | undefined,
  files: Express.Multer.File[] | undefined,
  userId: string = "anonymous",
  action: string = "chat"
) => {
  let finalSessionId = sessionId;
  let finalContext = context;
  let finalFiles = files;

  // 🔥 VALIDATION: Đảm bảo userId hợp lệ
  const validUserId = userId && userId !== "anonymous" ? userId : `anon-${Date.now()}`;

  if (sessionId) {
    try {
      // 🔍 Kiểm tra session có tồn tại không
      const session = await SessionService.getSession(sessionId, validUserId);
      
      if (session) {
        console.log(`✅ Found existing session: ${sessionId} for user: ${validUserId}`);
        
        // 🔥 QUAN TRỌNG: LUÔN ƯU TIÊN CONTEXT TỪ SESSION TRƯỚC
        if (session.context) {
          finalContext = session.context;
          console.log(`📖 Using existing context from session: ${finalContext.length} chars`);
        } 
        
        // 🔥 Nếu có context mới VÀ session chưa có context -> thêm mới
        else if (context && context.trim().length > 0) {
          await SessionService.updateContext(sessionId, context, validUserId);
          finalContext = context;
          console.log(`📝 Added new context to existing session: ${context.length} chars`);
        }

        // 🔥 QUAN TRỌNG: LUÔN ƯU TIÊN FILES TỪ SESSION TRƯỚC
        const sessionFiles = await SessionService.getFiles(sessionId, validUserId);
        if (sessionFiles.length > 0) {
          finalFiles = sessionFiles.map((file) => ({
            ...file,
            buffer: file.content,
            originalname: file.fileName,
            mimetype: file.mimeType,
            size: file.size,
            fieldname: "files",
          })) as unknown as Express.Multer.File[];
          console.log(`📚 Using ${finalFiles.length} existing files from session`);
        } 
        
        // 🔥 Nếu có files mới VÀ session chưa có files -> thêm mới
        else if (files && files.length > 0) {
          await SessionService.addFiles(sessionId, files, validUserId);
          finalFiles = files;
          console.log(`📎 Added ${files.length} new files to existing session`);
        }
        
        // Update lastAccessed
        await SessionService.updateLastAccessed(sessionId, validUserId);
        
      } else {
        // Session ID không tồn tại hoặc không thuộc về user -> Tạo mới
        console.log(`⚠️ Session ${sessionId} not found or access denied, creating new session for user: ${validUserId}`);
        finalSessionId = await SessionService.createSession(validUserId, action);
        
        if (context && context.trim().length > 0) {
          await SessionService.updateContext(finalSessionId, context, validUserId);
          finalContext = context;
        }
        if (files && files.length > 0) {
          await SessionService.addFiles(finalSessionId, files, validUserId);
          finalFiles = files;
        }
      }
    } catch (error) {
      console.error(`❌ Error processing session ${sessionId}:`, error);
      // Fallback: tạo session mới
      finalSessionId = await SessionService.createSession(validUserId, action);
      if (context) finalContext = context;
      if (files) finalFiles = files;
    }
  } else {
    // 🆕 Không có sessionId -> Tạo session mới
    console.log(`🆕 Creating new session for user: ${validUserId}`);
    finalSessionId = await SessionService.createSession(validUserId, action);
    
    if (context && context.trim().length > 0) {
      await SessionService.updateContext(finalSessionId, context, validUserId);
      finalContext = context;
      console.log(`📝 Added context to new session: ${context.length} chars`);
    }
    if (files && files.length > 0) {
      await SessionService.addFiles(finalSessionId, files, validUserId);
      finalFiles = files;
      console.log(`📎 Added ${files.length} files to new session`);
    }
  }

  return {
    sessionId: finalSessionId!,
    context: finalContext,
    files: finalFiles || [],
    userId: validUserId
  };
};

class ChatController {
  /**
   * 1. MAIN CHAT ENDPOINT
   * Xử lý hội thoại thông minh, hỗ trợ Context và File đính kèm.
   * Route: POST /api/chat/message
   */
  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        message,
        context,
        preferences,
        userId = "anonymous",
        action = "chat",
        sessionId,
      } = req.body;

      const files = req.files as Express.Multer.File[];

      console.log(`📨 [Request] SessionId: ${sessionId || 'NEW'} | Action: ${action} | User: ${userId}`);
      console.log(`📊 [Request] HasContext: ${!!context} | HasFiles: ${files?.length || 0}`);
      console.log(`💬 [Message] Length: ${message?.length || 0} chars`);

      // 🔥 Xử lý session - LUÔN sử dụng context/files từ session nếu có
      const {
        sessionId: finalSessionId,
        context: finalContext,
        files: finalFiles,
        userId: finalUserId
      } = await processSession(sessionId, context, files, userId, action);

      const fileData = processUploadedFiles(finalFiles);

      console.log(`🎯 [Processing] FinalSessionId: ${finalSessionId}`);
      console.log(`📚 [Processing] Using Context: ${!!finalContext} (${finalContext?.length || 0} chars) | Using Files: ${fileData?.length || 0}`);
      console.log(`👤 [User] Final UserId: ${finalUserId}`);

      let response: string;

      // Xử lý các action khác nhau
      switch (action) {
        case "summarize":
          response = await geminiService.summarize(message, 300, preferences);
          break;
        case "note":
          response = await geminiService.createNote(message, preferences);
          break;
        case "explain":
          response = await geminiService.explain(message, preferences);
          break;
        case "improve":
          const { style } = req.body;
          response = await geminiService.improveWriting(
            message,
            style,
            preferences
          );
          break;
        case "translate":
          const { targetLanguage } = req.body;
          response = await geminiService.translate(
            message,
            targetLanguage,
            preferences
          );
          break;
        case "chat":
        default:
          // 🔥 QUAN TRỌNG: LUÔN sử dụng context và files từ session
          response = await geminiService.chat(
            message,
            finalContext, // 🔥 Đây có thể là context từ session cũ
            fileData,     // 🔥 Đây có thể là files từ session cũ
            preferences
          );
          break;
      }

      console.log(`✅ [Response] Success | SessionId: ${finalSessionId} | ResponseLength: ${response.length}`);

      // 🔥 Lấy session summary để trả về metadata
      const sessionSummary = await SessionService.getSessionSummary(finalSessionId, finalUserId);

      res.json({
        status: "success",
        data: {
          response,
          action,
          sessionId: finalSessionId,
          timestamp: new Date().toISOString(),
          metadata: {
            hasContext: !!finalContext,
            contextLength: finalContext?.length || 0,
            hasFiles: !!fileData && fileData.length > 0,
            filesCount: fileData?.length || 0,
            userId: finalUserId,
            sessionSummary: sessionSummary
          }
        },
      });
    } catch (error) {
      console.error("❌ Error in sendMessage:", error);
      next(error);
    }
  }

  /**
   * 2. SUMMARIZE ENDPOINT
   * Tóm tắt văn bản chuyên sâu.
   * Route: POST /api/chat/summarize
   */
  async summarize(req: Request, res: Response, next: NextFunction) {
    try {
      const { text, maxLength, preferences } = req.body;

      console.log(`📄 [Summarize] Length: ${text?.length} chars | MaxLength: ${maxLength}`);

      const summary = await geminiService.summarize(
        text,
        maxLength,
        preferences
      );

      res.json({
        status: "success",
        data: { summary },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 3. CREATE NOTE ENDPOINT
   * Tạo ghi chú cấu trúc Markdown.
   * Route: POST /api/chat/note
   */
  async createNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { text, preferences } = req.body;

      console.log(`📝 [Create Note] Length: ${text?.length} chars`);

      const note = await geminiService.createNote(text, preferences);

      res.json({
        status: "success",
        data: { note },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 4. EXPLAIN ENDPOINT
   * Giải thích khái niệm.
   * Route: POST /api/chat/explain
   */
  async explain(req: Request, res: Response, next: NextFunction) {
    try {
      const { text, preferences } = req.body;

      console.log(`🎓 [Explain] Length: ${text?.length} chars`);

      const explanation = await geminiService.explain(text, preferences);

      res.json({
        status: "success",
        data: { explanation },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 5. IMPROVE WRITING ENDPOINT
   * Cải thiện văn phong.
   * Route: POST /api/chat/improve
   */
  async improveWriting(req: Request, res: Response, next: NextFunction) {
    try {
      const { text, style, preferences } = req.body;

      console.log(`✏️ [Improve] Style: ${style} | Length: ${text?.length} chars`);

      const improved = await geminiService.improveWriting(
        text,
        style,
        preferences
      );

      res.json({
        status: "success",
        data: { improved, style },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 6. TRANSLATE ENDPOINT
   * Dịch thuật.
   * Route: POST /api/chat/translate
   */
  async translate(req: Request, res: Response, next: NextFunction) {
    try {
      const { text, targetLanguage, preferences } = req.body;

      console.log(`🌍 [Translate] Target: ${targetLanguage} | Length: ${text?.length} chars`);

      const translated = await geminiService.translate(
        text,
        targetLanguage,
        preferences
      );

      res.json({
        status: "success",
        data: { translated, targetLanguage },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 7. GET SESSION DATA
   * Lấy dữ liệu session hiện tại.
   * Route: GET /api/chat/session/:sessionId
   */
  async getSessionData(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      const { userId } = req.query;

      if (!sessionId) {
        return res.status(400).json({
          status: "error",
          message: "Session ID is required",
        });
      }

      console.log(`🔍 [Get Session] SessionId: ${sessionId} | UserId: ${userId || 'not provided'}`);

      const session = await SessionService.getSession(sessionId, userId as string);
      if (!session) {
        return res.status(404).json({
          status: "error",
          message: "Session not found or access denied",
        });
      }

      res.json({
        status: "success",
        data: {
          sessionId: session.sessionId,
          context: session.context,
          files: session.files.map((f) => ({
            fileName: f.fileName,
            mimeType: f.mimeType,
            size: f.size,
            uploadedAt: session.createdAt
          })),
          lastAccessed: session.lastAccessed,
          metadata: session.metadata,
          summary: {
            hasContext: !!session.context,
            contextLength: session.context?.length || 0,
            filesCount: session.files.length,
            totalFilesSize: session.files.reduce((sum, file) => sum + file.size, 0)
          }
        },
      });
    } catch (error) {
      console.error("❌ Error getting session data:", error);
      next(error);
    }
  }

  /**
   * 8. UPDATE SESSION CONTEXT
   * Cập nhật context cho session.
   * Route: PUT /api/chat/session/:sessionId/context
   */
  async updateSessionContext(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      const { context, userId } = req.body;

      if (!sessionId || !context) {
        return res.status(400).json({
          status: "error",
          message: "Session ID and context are required",
        });
      }

      console.log(`📝 [Update Context] SessionId: ${sessionId} | ContextLength: ${context.length}`);

      const result = await SessionService.updateContext(sessionId, context, userId);

      if (!result) {
        return res.status(404).json({
          status: "error",
          message: "Session not found or access denied",
        });
      }

      res.json({
        status: "success",
        data: {
          sessionId: result.sessionId,
          context: result.context,
          updatedAt: result.updatedAt
        },
      });
    } catch (error) {
      console.error("❌ Error updating session context:", error);
      next(error);
    }
  }

  /**
   * 9. CLEAR SESSION CONTEXT
   * Xóa context của session.
   * Route: DELETE /api/chat/session/:sessionId/context
   */
  async clearSessionContext(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      const { userId } = req.body;

      if (!sessionId) {
        return res.status(400).json({
          status: "error",
          message: "Session ID is required",
        });
      }

      console.log(`🗑️ [Clear Context] SessionId: ${sessionId}`);

      const result = await SessionService.updateContext(sessionId, '', userId);

      if (!result) {
        return res.status(404).json({
          status: "error",
          message: "Session not found or access denied",
        });
      }

      res.json({
        status: "success",
        data: {
          sessionId: result.sessionId,
          message: "Context cleared successfully"
        },
      });
    } catch (error) {
      console.error("❌ Error clearing session context:", error);
      next(error);
    }
  }

  /**
   * 10. PREFERENCES CONFIG
   * Lấy cấu hình mặc định cho Frontend.
   * Route: GET /api/chat/preferences
   */
  async getDefaultPreferences(req: Request, res: Response, next: NextFunction) {
    res.json({
      status: "success",
      data: {
        availableOptions: {
          tone: ["formal", "casual", "friendly", "professional", "witty"],
          responseLength: ["concise", "detailed", "comprehensive"],
          expertise: ["beginner", "intermediate", "expert"],
        },
        defaultPreferences: {
          tone: "professional",
          responseLength: "detailed",
          expertise: "intermediate",
        },
      },
    });
  }
}

export const chatController = new ChatController();
export { upload };