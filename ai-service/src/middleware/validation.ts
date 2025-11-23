import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

// Schema cho user preferences
export const userPreferencesSchema = z.object({
    tone: z.enum(['formal', 'casual', 'friendly', 'professional']).optional(),
    responseLength: z.enum(['concise', 'detailed', 'comprehensive']).optional(),
    language: z.string().max(50).optional(),
    expertise: z.enum(['beginner', 'intermediate', 'expert']).optional()
}).optional();

// Schema validation cho chat message với preferences
export const chatMessageSchema = z.object({
    message: z.string()
        .min(1, 'Tin nhắn không được để trống')
        .max(10000, 'Tin nhắn không được vượt quá 10000 ký tự')
        .refine(val => val.trim().length > 0, 'Tin nhắn không được chỉ chứa khoảng trắng'),
    action: z.enum(['chat', 'summarize', 'note', 'explain', 'improve', 'translate'], {
        errorMap: () => ({ message: 'Action phải là: chat, summarize, note, explain, improve, hoặc translate' })
    }).optional().default('chat'),
    context: z.string().max(50000, 'Context không được vượt quá 50000 ký tự').optional(),
    targetLanguage: z.string().max(100, 'Ngôn ngữ đích không được vượt quá 100 ký tự').optional(),
    sessionId: z.string().uuid('Session ID không hợp lệ').optional(),  
    userId: z.string().min(1, 'User ID không được để trống').optional().default('anonymous'),
    preferences: userPreferencesSchema
});

// Schema validation cho summarize
export const summarizeSchema = z.object({
    text: z.string()
        .min(50, 'Văn bản phải có ít nhất 50 ký tự để tóm tắt có ý nghĩa')
        .max(100000, 'Văn bản không được vượt quá 100000 ký tự')
        .refine(val => val.trim().length >= 50, 'Văn bản không được chỉ chứa khoảng trắng'),
    maxLength: z.number()
        .int('Độ dài tối đa phải là số nguyên')
        .min(50, 'Độ dài tối thiểu là 50 từ')
        .max(2000, 'Độ dài tối đa là 2000 từ')
        .optional()
        .default(200),
    preferences: userPreferencesSchema
});

// Schema validation cho note và explain
export const textProcessingSchema = z.object({
    text: z.string()
        .min(10, 'Văn bản phải có ít nhất 10 ký tự')
        .max(100000, 'Văn bản không được vượt quá 100000 ký tự')
        .refine(val => val.trim().length >= 10, 'Văn bản không được chỉ chứa khoảng trắng'),
    preferences: userPreferencesSchema
});

// Schema validation cho improve
export const improveSchema = z.object({
    text: z.string()
        .min(10, 'Văn bản cần cải thiện phải có ít nhất 10 ký tự')
        .max(50000, 'Văn bản không được vượt quá 50000 ký tự')
        .refine(val => val.trim().length >= 10, 'Văn bản không được chỉ chứa khoảng trắng'),
    style: z.enum(['formal', 'casual', 'academic', 'professional'], {
        errorMap: () => ({ message: 'Style phải là: formal, casual, academic, hoặc professional' })
    }).optional().default('professional'),
    preferences: userPreferencesSchema
});

// Schema validation cho translate
export const translateSchema = z.object({
    text: z.string()
        .min(1, 'Văn bản cần dịch không được để trống')
        .max(100000, 'Văn bản không được vượt quá 100000 ký tự')
        .refine(val => val.trim().length > 0, 'Văn bản không được chỉ chứa khoảng trắng'),
    targetLanguage: z.string()
        .min(2, 'Ngôn ngữ đích phải có ít nhất 2 ký tự')
        .max(100, 'Ngôn ngữ đích không được vượt quá 100 ký tự')
        .optional()
        .default('tiếng Anh'),
    preferences: userPreferencesSchema
});

// 🔥 NEW: Schema cho session operations
export const sessionOperationSchema = z.object({
    userId: z.string().min(1, 'User ID là bắt buộc'),
    context: z.string().optional()
});

// Middleware validation với error handling chi tiết
export const validate = (schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // Parse và validate
            const validated = schema.parse(req.body);
            
            // Gán lại validated data vào req.body
            req.body = validated;
            
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code,
                    received: err.code === 'invalid_type' ? (err as any).received : undefined
                }));

                console.error('❌ Validation error:', errors);

                return res.status(400).json({
                    status: 'error',
                    message: 'Dữ liệu đầu vào không hợp lệ',
                    errors,
                    hint: 'Vui lòng kiểm tra lại dữ liệu gửi lên'
                });
            }
            next(error);
        }
    };
};

// Middleware kiểm tra file upload
export const validateFiles = (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as Express.Multer.File[];
    
    if (files && files.length > 0) {
        // Kiểm tra tổng kích thước files
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        const maxTotalSize = 50 * 1024 * 1024; // 50MB

        if (totalSize > maxTotalSize) {
            return res.status(400).json({
                status: 'error',
                message: 'Tổng kích thước files không được vượt quá 50MB',
                currentSize: `${(totalSize / 1024 / 1024).toFixed(2)}MB`,
                maxSize: '50MB'
            });
        }

        // Kiểm tra số lượng files
        if (files.length > 10) {
            return res.status(400).json({
                status: 'error',
                message: 'Không được upload quá 10 files cùng lúc',
                currentCount: files.length,
                maxCount: 10
            });
        }

        console.log(`📎 Uploaded ${files.length} file(s), total size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
    }

    next();
};

// 🔥 NEW: Middleware validate session parameters
export const validateSessionParams = (req: Request, res: Response, next: NextFunction) => {
    const { sessionId } = req.params;
    
    if (!sessionId) {
        return res.status(400).json({
            status: 'error',
            message: 'Session ID là bắt buộc'
        });
    }

    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionId)) {
        return res.status(400).json({
            status: 'error',
            message: 'Session ID không hợp lệ'
        });
    }

    next();
};