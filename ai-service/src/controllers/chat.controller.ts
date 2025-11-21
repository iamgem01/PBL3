import { Request, Response, NextFunction } from 'express';
import { geminiService } from '../services/gemini.service.js';
import multer from 'multer';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
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
            cb(new Error(`Loại file ${file.mimetype} không được hỗ trợ`));
        }
    }
});

interface UserPreferences {
    tone?: 'formal' | 'casual' | 'friendly' | 'professional';
    responseLength?: 'concise' | 'detailed' | 'comprehensive';
    language?: string;
    expertise?: 'beginner' | 'intermediate' | 'expert';
}

class ChatController {

    async sendMessage(req: Request, res: Response, next: NextFunction) {
        try {
            const { 
                message, 
                action = 'chat', 
                context,
                preferences 
            } = req.body;

            // Validate message
            if (!message || message.trim().length === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Tin nhắn không được để trống'
                });
            }

            // Process files
            const files = req.files as Express.Multer.File[];
            const fileData = files?.map(file => ({
                mimeType: file.mimetype,
                data: file.buffer,
                fileName: file.originalname
            }));

            // Log để debug
            console.log(`📝 Nhận yêu cầu: action=${action}, message length=${message.length}, files=${files?.length || 0}`);
            if (context) {
                console.log(`📚 Context length: ${context.length}`);
            }
            if (preferences) {
                console.log(`⚙️ User preferences:`, preferences);
            }

            let response: string;
            const userPreferences: UserPreferences | undefined = preferences ? {
                tone: preferences.tone,
                responseLength: preferences.responseLength,
                language: preferences.language,
                expertise: preferences.expertise
            } : undefined;

            switch (action) {
                case 'summarize':
                    const { maxLength = 200 } = req.body;
                    response = await geminiService.summarize(message, maxLength, userPreferences);
                    break;
                    
                case 'note':
                    response = await geminiService.createNote(message, userPreferences);
                    break;
                    
                case 'explain':
                    response = await geminiService.explain(message, userPreferences);
                    break;
                    
                case 'improve':
                    const { style = 'professional' } = req.body;
                    response = await geminiService.improveWriting(message, style, userPreferences);
                    break;
                    
                case 'translate':
                    const { targetLanguage = 'English' } = req.body;
                    response = await geminiService.translate(message, targetLanguage, userPreferences);
                    break;
                    
                case 'chat':
                default:
                    response = await geminiService.chat(message, context, fileData, userPreferences);
                    break;
            }

            console.log(`✅ Tạo phản hồi thành công: ${response.length} ký tự`);

            res.json({
                status: 'success',
                data: {
                    response,
                    action,
                    metadata: {
                        responseLength: response.length,
                        filesProcessed: files?.length || 0,
                        hasContext: !!context,
                        timestamp: new Date().toISOString()
                    }
                }
            });
        } catch (error: any) {
            console.error('❌ Lỗi trong sendMessage:', error);
            next(error);
        }
    }

    async summarize(req: Request, res: Response, next: NextFunction) {
        try {
            const { text, maxLength = 200, preferences } = req.body;

            if (!text || text.trim().length === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Văn bản không được để trống'
                });
            }

            console.log(`📝 Summarize request: text length=${text.length}, maxLength=${maxLength}`);

            const summary = await geminiService.summarize(text, maxLength, preferences);

            res.json({
                status: 'success',
                data: {
                    original: text,
                    summary,
                    maxLength,
                    metadata: {
                        originalLength: text.length,
                        summaryLength: summary.length,
                        compressionRatio: (summary.length / text.length * 100).toFixed(1) + '%'
                    }
                }
            });
        } catch (error: any) {
            console.error('❌ Lỗi trong summarize:', error);
            next(error);
        }
    }

    async createNote(req: Request, res: Response, next: NextFunction) {
        try {
            const { text, preferences } = req.body;

            if (!text || text.trim().length === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Văn bản không được để trống'
                });
            }

            console.log(`📝 Create note request: text length=${text.length}`);

            const note = await geminiService.createNote(text, preferences);

            res.json({
                status: 'success',
                data: {
                    original: text,
                    note,
                    metadata: {
                        originalLength: text.length,
                        noteLength: note.length
                    }
                }
            });
        } catch (error: any) {
            console.error('❌ Lỗi trong createNote:', error);
            next(error);
        }
    }

    async explain(req: Request, res: Response, next: NextFunction) {
        try {
            const { text, preferences } = req.body;

            if (!text || text.trim().length === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Văn bản không được để trống'
                });
            }

            console.log(`📝 Explain request: text length=${text.length}`);

            const explanation = await geminiService.explain(text, preferences);

            res.json({
                status: 'success',
                data: {
                    original: text,
                    explanation,
                    metadata: {
                        originalLength: text.length,
                        explanationLength: explanation.length
                    }
                }
            });
        } catch (error: any) {
            console.error('❌ Lỗi trong explain:', error);
            next(error);
        }
    }

    async improveWriting(req: Request, res: Response, next: NextFunction) {
        try {
            const { text, style = 'professional', preferences } = req.body;

            if (!text || text.trim().length === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Văn bản không được để trống'
                });
            }

            console.log(`📝 Improve writing request: text length=${text.length}, style=${style}`);

            const improved = await geminiService.improveWriting(text, style, preferences);

            res.json({
                status: 'success',
                data: {
                    original: text,
                    improved,
                    style,
                    metadata: {
                        originalLength: text.length,
                        improvedLength: improved.length
                    }
                }
            });
        } catch (error: any) {
            console.error('❌ Lỗi trong improveWriting:', error);
            next(error);
        }
    }

    async translate(req: Request, res: Response, next: NextFunction) {
        try {
            const { text, targetLanguage = 'tiếng Anh', preferences } = req.body;

            if (!text || text.trim().length === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Văn bản không được để trống'
                });
            }

            console.log(`📝 Translate request: text length=${text.length}, target=${targetLanguage}`);

            const translated = await geminiService.translate(text, targetLanguage, preferences);

            res.json({
                status: 'success',
                data: {
                    original: text,
                    translated,
                    targetLanguage,
                    metadata: {
                        originalLength: text.length,
                        translatedLength: translated.length
                    }
                }
            });
        } catch (error: any) {
            console.error('❌ Lỗi trong translate:', error);
            next(error);
        }
    }

    // API mới: Lấy preferences mặc định
    async getDefaultPreferences(req: Request, res: Response, next: NextFunction) {
        try {
            res.json({
                status: 'success',
                data: {
                    availableOptions: {
                        tone: ['formal', 'casual', 'friendly', 'professional'],
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
        } catch (error: any) {
            next(error);
        }
    }
}

export const chatController = new ChatController();
export { upload };