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

// 🔥 IMPROVED: Helper function to process session data
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

  if (sessionId) {
    // 🔍 Kiểm tra session có tồn tại không
    const session = await SessionService.getSession(sessionId);
    
    if (session) {
      console.log(`✅ Found existing session: ${sessionId}`);
      
      // 🔥 Chỉ update context nếu có context mới
      if (context && context !== session.context) {
        await SessionService.updateContext(sessionId, context);
        console.log(`📝 Updated context for session: ${sessionId}`);
      } else {
        // Sử dụng context từ session cũ
        finalContext = session.context || context;
        console.log(`📖 Using existing context from session`);
      }

      // 🔥 Chỉ add files nếu có files mới
      if (files && files.length > 0) {
        await SessionService.addFiles(sessionId, files);
        console.log(`📎 Added ${files.length} new files to session`);
      } else {
        // 🔥 Sử dụng files từ session cũ
        const sessionFiles = await SessionService.getFiles(sessionId);
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
      }
      
      // Update lastAccessed
      await SessionService.updateLastAccessed(sessionId);
      
    } else {
      // Session ID không tồn tại -> Tạo mới
      console.log(`⚠️ Session ${sessionId} not found, creating new session`);
      finalSessionId = await SessionService.createSession(userId, action);
      
      if (context) {
        await SessionService.updateContext(finalSessionId, context);
      }
      if (files && files.length > 0) {
        await SessionService.addFiles(finalSessionId, files);
      }
    }
  } else {
    // 🆕 Không có sessionId -> Tạo session mới
    console.log(`🆕 Creating new session for user: ${userId}`);
    finalSessionId = await SessionService.createSession(userId, action);
    
    if (context) {
      await SessionService.updateContext(finalSessionId, context);
      console.log(`📝 Added context to new session`);
    }
    if (files && files.length > 0) {
      await SessionService.addFiles(finalSessionId, files);
      console.log(`📎 Added ${files.length} files to new session`);
    }
  }

  return {
    sessionId: finalSessionId,
    context: finalContext,
    files: finalFiles || [],
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

      // 🔥 Xử lý session - Chỉ gửi context/files nếu cần
      const {
        sessionId: finalSessionId,
        context: finalContext,
        files: finalFiles,
      } = await processSession(sessionId, context, files, userId, action);

      const fileData = processUploadedFiles(finalFiles);

      console.log(`🎯 [Processing] FinalSessionId: ${finalSessionId}`);
      console.log(`📚 [Processing] Using Context: ${!!finalContext} | Using Files: ${fileData?.length || 0}`);

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
          // 🔥 Sử dụng context và files từ session
          response = await geminiService.chat(
            message,
            finalContext,
            fileData,
            preferences
          );
          break;
      }

      console.log(`✅ [Response] Success | SessionId: ${finalSessionId} | ResponseLength: ${response.length}`);

      res.json({
        status: "success",
        data: {
          response,
          action,
          sessionId: finalSessionId, // 🔥 Trả về sessionId cho frontend
          timestamp: new Date().toISOString(),
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

      console.log(`📄 [Summarize] Length: ${text?.length} chars`);

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

      console.log(`✏️ [Improve] Style: ${style} | Length: ${text?.length}`);

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

      console.log(
        `🌍 [Translate] Target: ${targetLanguage} | Length: ${text?.length}`
      );

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
      if (!sessionId) {
        return res.status(400).json({
          status: "error",
          message: "Session ID is required",
        });
      }

      console.log(`🔍 [Get Session] SessionId: ${sessionId}`);

      const session = await SessionService.getSession(sessionId);
      if (!session) {
        return res.status(404).json({
          status: "error",
          message: "Session not found",
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
          })),
          lastAccessed: session.lastAccessed,
          metadata: session.metadata,
        },
      });
    } catch (error) {
      console.error("❌ Error getting session data:", error);
      next(error);
    }
  }

  /**
   * 8. PREFERENCES CONFIG
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