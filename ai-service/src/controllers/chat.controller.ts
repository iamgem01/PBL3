import { Request, Response, NextFunction } from 'express';
import { geminiService, UserPreferences } from '../services/gemini.service.js';
import multer from 'multer';

// --- CẤU HÌNH UPLOAD ---
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024, // Giới hạn 20MB mỗi file
    },
    fileFilter: (req, file, cb) => {
        // Chấp nhận: Ảnh, PDF, Text, Word, Excel
        const allowedMimes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf',
            'text/plain', 'text/markdown',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Định dạng file ${file.mimetype} không được hỗ trợ`));
        }
    }
});

// --- HELPER: Chuẩn hóa dữ liệu file ---
const processUploadedFiles = (files: Express.Multer.File[] | undefined) => {
    if (!files || files.length === 0) return undefined;
    return files.map(file => ({
        mimeType: file.mimetype,
        data: file.buffer,
        fileName: file.originalname
    }));
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
                action = 'chat' // Hỗ trợ fallback nếu frontend gửi action trong body
            } = req.body;

            const files = req.files as Express.Multer.File[];
            const fileData = processUploadedFiles(files);

            console.log(`📨 [Request] Action: ${action} | Msg Length: ${message?.length} | Files: ${files?.length || 0}`);

            let response: string;

            // Router mini để điều hướng nếu frontend dùng chung 1 endpoint
            // (Tốt nhất vẫn nên dùng các endpoint riêng biệt bên dưới)
            switch (action) {
                case 'summarize':
                    response = await geminiService.summarize(message, 300, preferences);
                    break;
                case 'note':
                    response = await geminiService.createNote(message, preferences);
                    break;
                case 'explain':
                    response = await geminiService.explain(message, preferences);
                    break;
                case 'improve':
                    const { style } = req.body;
                    response = await geminiService.improveWriting(message, style, preferences);
                    break;
                case 'translate':
                    const { targetLanguage } = req.body;
                    response = await geminiService.translate(message, targetLanguage, preferences);
                    break;
                case 'chat':
                default:
                    // Mặc định gọi hàm Chat (Fast Model)
                    response = await geminiService.chat(message, context, fileData, preferences);
                    break;
            }

            res.json({
                status: 'success',
                data: {
                    response,
                    action,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('❌ Error in sendMessage:', error);
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
            
            console.log(`📝 [Summarize] Length: ${text?.length} chars`);
            
            const summary = await geminiService.summarize(text, maxLength, preferences);

            res.json({
                status: 'success',
                data: { summary }
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
                status: 'success',
                data: { note }
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
                status: 'success',
                data: { explanation }
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
            
            console.log(`✍️ [Improve] Style: ${style} | Length: ${text?.length}`);
            
            const improved = await geminiService.improveWriting(text, style, preferences);

            res.json({
                status: 'success',
                data: { improved, style }
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
            
            console.log(`🌐 [Translate] Target: ${targetLanguage} | Length: ${text?.length}`);
            
            const translated = await geminiService.translate(text, targetLanguage, preferences);

            res.json({
                status: 'success',
                data: { translated, targetLanguage }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * 7. PREFERENCES CONFIG
     * Lấy cấu hình mặc định cho Frontend.
     * Route: GET /api/chat/preferences
     */
    async getDefaultPreferences(req: Request, res: Response, next: NextFunction) {
        res.json({
            status: 'success',
            data: {
                availableOptions: {
                    tone: ['formal', 'casual', 'friendly', 'professional', 'witty'],
                    responseLength: ['concise', 'detailed', 'comprehensive'],
                    expertise: ['beginner', 'intermediate', 'expert']
                },
                defaultPreferences: {
                    tone: 'professional',
                    responseLength: 'detailed',
                    expertise: 'intermediate'
                }
            }
        });
    }
}

export const chatController = new ChatController();
export { upload };