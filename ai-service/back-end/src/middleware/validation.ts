import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

// Schema validation cho chat message
export const chatMessageSchema = z.object({
    message: z.string()
        .min(1, 'Tin nhắn không được để trống')
        .max(5000, 'Tin nhắn không được vượt quá 5000 ký tự'),
    action: z.enum(['chat', 'summarize', 'note', 'explain', 'improve'], {
        errorMap: () => ({ message: 'Action phải là: chat, summarize, note, explain, hoặc improve' })
    }).optional().default('chat'),
    context: z.string().max(10000, 'Context không được vượt quá 10000 ký tự').optional()
});

// Schema validation cho summarize, note, explain (dùng chung)
export const summarizeSchema = z.object({
    text: z.string()
        .min(10, 'Văn bản phải có ít nhất 10 ký tự')
        .max(50000, 'Văn bản không được vượt quá 50000 ký tự'),
    maxLength: z.number().int().min(50).max(2000).optional().default(200)
});

// Schema validation cho note và explain
export const textProcessingSchema = z.object({
    text: z.string()
        .min(10, 'Văn bản phải có ít nhất 10 ký tự')
        .max(50000, 'Văn bản không được vượt quá 50000 ký tự')
});

// Schema validation cho improve
export const improveSchema = z.object({
    text: z.string()
        .min(10, 'Văn bản cần cải thiện phải có ít nhất 10 ký tự')
        .max(10000, 'Văn bản không được vượt quá 10000 ký tự'),
    style: z.enum(['formal', 'casual', 'academic', 'professional']).optional().default('professional')
});

export const validate = (schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                return res.status(400).json({
                    status: 'error',
                    message: 'Dữ liệu đầu vào không hợp lệ',
                    errors
                });
            }
            next(error);
        }
    };
};

