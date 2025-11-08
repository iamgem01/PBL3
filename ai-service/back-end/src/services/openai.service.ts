import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export class OpenAIService {
    /**
     * Chat thông thường với AI
     */
    async chat(message: string, context?: string): Promise<string> {
        const messages: ChatMessage[] = [
            {
                role: 'system',
                content: 'Bạn là một trợ lý AI thông minh và hữu ích. Bạn trả lời bằng tiếng Việt một cách tự nhiên và chuyên nghiệp.'
            }
        ];

        if (context) {
            messages.push({
                role: 'user',
                content: `Context: ${context}\n\nCâu hỏi: ${message}`
            });
        } else {
            messages.push({
                role: 'user',
                content: message
            });
        }

        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: messages as any,
                temperature: 0.7,
                max_tokens: 2000,
            });

            return completion.choices[0]?.message?.content || 'Xin lỗi, tôi không thể tạo phản hồi.';
        } catch (error: any) {
            console.error('OpenAI API Error:', error);
            throw new Error(`Lỗi khi gọi OpenAI API: ${error.message || 'Unknown error'}`);
        }
    }

    /**
     * Tóm tắt văn bản
     */
    async summarize(text: string, maxLength: number = 200): Promise<string> {
        const messages: ChatMessage[] = [
            {
                role: 'system',
                content: 'Bạn là một chuyên gia tóm tắt văn bản. Hãy tóm tắt văn bản một cách ngắn gọn, súc tích và giữ lại những thông tin quan trọng nhất.'
            },
            {
                role: 'user',
                content: `Hãy tóm tắt văn bản sau đây trong khoảng ${maxLength} từ:\n\n${text}`
            }
        ];

        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: messages as any,
                temperature: 0.3,
                max_tokens: Math.min(maxLength * 2, 1000),
            });

            return completion.choices[0]?.message?.content || 'Không thể tóm tắt văn bản.';
        } catch (error: any) {
            console.error('OpenAI API Error:', error);
            throw new Error(`Lỗi khi tóm tắt: ${error.message || 'Unknown error'}`);
        }
    }

    /**
     * Tạo ghi chú từ văn bản
     */
    async createNote(text: string): Promise<string> {
        const messages: ChatMessage[] = [
            {
                role: 'system',
                content: 'Bạn là một trợ lý tạo ghi chú chuyên nghiệp. Hãy tạo ghi chú có cấu trúc, dễ đọc và dễ hiểu từ văn bản được cung cấp. Sử dụng định dạng markdown với các tiêu đề, danh sách và điểm nhấn quan trọng.'
            },
            {
                role: 'user',
                content: `Hãy tạo ghi chú từ văn bản sau:\n\n${text}`
            }
        ];

        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: messages as any,
                temperature: 0.5,
                max_tokens: 2000,
            });

            return completion.choices[0]?.message?.content || 'Không thể tạo ghi chú.';
        } catch (error: any) {
            console.error('OpenAI API Error:', error);
            throw new Error(`Lỗi khi tạo ghi chú: ${error.message || 'Unknown error'}`);
        }
    }

    /**
     * Giải thích văn bản
     */
    async explain(text: string): Promise<string> {
        const messages: ChatMessage[] = [
            {
                role: 'system',
                content: 'Bạn là một giáo viên tận tâm. Hãy giải thích văn bản một cách dễ hiểu, chi tiết và có ví dụ minh họa nếu cần.'
            },
            {
                role: 'user',
                content: `Hãy giải thích chi tiết văn bản sau:\n\n${text}`
            }
        ];

        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: messages as any,
                temperature: 0.6,
                max_tokens: 2000,
            });

            return completion.choices[0]?.message?.content || 'Không thể giải thích văn bản.';
        } catch (error: any) {
            console.error('OpenAI API Error:', error);
            throw new Error(`Lỗi khi giải thích: ${error.message || 'Unknown error'}`);
        }
    }

    /**
     * Cải thiện văn phong
     */
    async improveWriting(text: string, style: 'formal' | 'casual' | 'academic' | 'professional' = 'professional'): Promise<string> {
        const styleDescriptions = {
            formal: 'trang trọng, lịch sự',
            casual: 'thân thiện, tự nhiên',
            academic: 'học thuật, chuyên sâu',
            professional: 'chuyên nghiệp, rõ ràng'
        };

        const messages: ChatMessage[] = [
            {
                role: 'system',
                content: `Bạn là một chuyên gia biên tập văn bản. Hãy cải thiện văn phong của văn bản theo phong cách ${styleDescriptions[style]}, giữ nguyên ý nghĩa nhưng làm cho văn bản trở nên hay hơn, rõ ràng hơn và chuyên nghiệp hơn.`
            },
            {
                role: 'user',
                content: `Hãy cải thiện văn phong của văn bản sau theo phong cách ${styleDescriptions[style]}:\n\n${text}`
            }
        ];

        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: messages as any,
                temperature: 0.7,
                max_tokens: 2000,
            });

            return completion.choices[0]?.message?.content || 'Không thể cải thiện văn bản.';
        } catch (error: any) {
            console.error('OpenAI API Error:', error);
            throw new Error(`Lỗi khi cải thiện văn bản: ${error.message || 'Unknown error'}`);
        }
    }
}

export const openAIService = new OpenAIService();

