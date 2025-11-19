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
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Loại file ${file.mimetype} không được hỗ trợ`));
        }
    }
});

class ChatController {

    async sendMessage(req: Request, res: Response, next: NextFunction) {
        try {
            const { message, action = 'chat', context } = req.body;


            const files = req.files as Express.Multer.File[];
            const fileData = files?.map(file => ({
                mimeType: file.mimetype,
                data: file.buffer,
                fileName: file.originalname
            }));

            let response: string;

            switch (action) {
                case 'summarize':
                    response = await geminiService.summarize(message);
                    break;
                case 'note':
                    response = await geminiService.createNote(message);
                    break;
                case 'explain':
                    response = await geminiService.explain(message);
                    break;
                case 'improve':
                    response = await geminiService.improveWriting(message);
                    break;
                case 'translate':
                    const { targetLanguage = 'English' } = req.body;
                    response = await geminiService.translate(message, targetLanguage);
                    break;
                case 'chat':
                default:
                    response = await geminiService.chat(message, context, fileData);
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


    async summarize(req: Request, res: Response, next: NextFunction) {
        try {
            const { text, maxLength = 200 } = req.body;

            const summary = await geminiService.summarize(text, maxLength);

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


    async createNote(req: Request, res: Response, next: NextFunction) {
        try {
            const { text } = req.body;

            const note = await geminiService.createNote(text);

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


    async explain(req: Request, res: Response, next: NextFunction) {
        try {
            const { text } = req.body;

            const explanation = await geminiService.explain(text);

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


    async improveWriting(req: Request, res: Response, next: NextFunction) {
        try {
            const { text, style = 'professional' } = req.body;

            const improved = await geminiService.improveWriting(text, style);

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


    async translate(req: Request, res: Response, next: NextFunction) {
        try {
            const { text, targetLanguage = 'tiếng Anh' } = req.body;

            const translated = await geminiService.translate(text, targetLanguage);

            res.json({
                status: 'success',
                data: {
                    original: text,
                    translated,
                    targetLanguage
                }
            });
        } catch (error: any) {
            next(error);
        }
    }
}

export const chatController = new ChatController();
export { upload };

