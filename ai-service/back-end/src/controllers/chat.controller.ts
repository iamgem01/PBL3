import { Request, Response, NextFunction } from 'express';
import { openAIService } from '../services/openai.service.js';

class ChatController {
    /**
     * Xử lý tin nhắn chat với các action khác nhau
     */
    async sendMessage(req: Request, res: Response, next: NextFunction) {
        try {
            const { message, action = 'chat', context } = req.body;

            let response: string;

            switch (action) {
                case 'summarize':
                    response = await openAIService.summarize(message);
                    break;
                case 'note':
                    response = await openAIService.createNote(message);
                    break;
                case 'explain':
                    response = await openAIService.explain(message);
                    break;
                case 'improve':
                    response = await openAIService.improveWriting(message);
                    break;
                case 'chat':
                default:
                    response = await openAIService.chat(message, context);
                    break;
            }

            res.json({
                status: 'success',
                data: {
                    response,
                    action
                }
            });
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * Tóm tắt văn bản
     */
    async summarize(req: Request, res: Response, next: NextFunction) {
        try {
            const { text, maxLength = 200 } = req.body;

            const summary = await openAIService.summarize(text, maxLength);

            res.json({
                status: 'success',
                data: {
                    original: text,
                    summary,
                    maxLength
                }
            });
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * Tạo ghi chú
     */
    async createNote(req: Request, res: Response, next: NextFunction) {
        try {
            const { text } = req.body;

            const note = await openAIService.createNote(text);

            res.json({
                status: 'success',
                data: {
                    original: text,
                    note
                }
            });
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * Giải thích văn bản
     */
    async explain(req: Request, res: Response, next: NextFunction) {
        try {
            const { text } = req.body;

            const explanation = await openAIService.explain(text);

            res.json({
                status: 'success',
                data: {
                    original: text,
                    explanation
                }
            });
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * Cải thiện văn phong
     */
    async improveWriting(req: Request, res: Response, next: NextFunction) {
        try {
            const { text, style = 'professional' } = req.body;

            const improved = await openAIService.improveWriting(text, style);

            res.json({
                status: 'success',
                data: {
                    original: text,
                    improved,
                    style
                }
            });
        } catch (error: any) {
            next(error);
        }
    }
}

export const chatController = new ChatController();

