import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

export class GeminiService {
    private model = genAI.getGenerativeModel({ model: MODEL_NAME });

   
    async chat(message: string, context?: string): Promise<string> {
        const systemInstruction = 'Bạn là một trợ lý AI thông minh và hữu ích. Bạn trả lời bằng tiếng Việt một cách tự nhiên và chuyên nghiệp. Khi được cung cấp context (thông tin từ các note), hãy sử dụng thông tin đó để trả lời câu hỏi một cách chính xác và chi tiết.';
        
        let prompt = message;
        if (context) {
            prompt = `Dưới đây là các thông tin context từ các note mà người dùng đã chọn:\n\n${context}\n\n---\n\nDựa trên context trên, hãy trả lời câu hỏi sau của người dùng:\n\n${message}`;
        }

        try {
            const result = await this.model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                systemInstruction: systemInstruction,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2000,
                },
            });

            const response = result.response;
            return response.text() || 'Xin lỗi, tôi không thể tạo phản hồi.';
        } catch (error: any) {
            console.error('Gemini API Error:', error);
            throw new Error(`Lỗi khi gọi Gemini API: ${error.message || 'Unknown error'}`);
        }
    }

    /**
     * Tóm tắt văn bản
     */
    async summarize(text: string, maxLength: number = 200): Promise<string> {
        const systemInstruction = 'Bạn là một chuyên gia tóm tắt văn bản. Hãy tóm tắt văn bản một cách ngắn gọn, súc tích và giữ lại những thông tin quan trọng nhất.';
        const prompt = `Hãy tóm tắt văn bản sau đây trong khoảng ${maxLength} từ:\n\n${text}`;

        try {
            const result = await this.model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                systemInstruction: systemInstruction,
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: Math.min(maxLength * 2, 1000),
                },
            });

            const response = result.response;
            return response.text() || 'Không thể tóm tắt văn bản.';
        } catch (error: any) {
            console.error('Gemini API Error:', error);
            throw new Error(`Lỗi khi tóm tắt: ${error.message || 'Unknown error'}`);
        }
    }

    /**
     * Tạo ghi chú từ văn bản
     */
    async createNote(text: string): Promise<string> {
        const systemInstruction = 'Bạn là một trợ lý tạo ghi chú chuyên nghiệp. Hãy tạo ghi chú có cấu trúc, dễ đọc và dễ hiểu từ văn bản được cung cấp. Sử dụng định dạng markdown với các tiêu đề, danh sách và điểm nhấn quan trọng.';
        const prompt = `Hãy tạo ghi chú từ văn bản sau:\n\n${text}`;

        try {
            const result = await this.model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                systemInstruction: systemInstruction,
                generationConfig: {
                    temperature: 0.5,
                    maxOutputTokens: 2000,
                },
            });

            const response = result.response;
            return response.text() || 'Không thể tạo ghi chú.';
        } catch (error: any) {
            console.error('Gemini API Error:', error);
            throw new Error(`Lỗi khi tạo ghi chú: ${error.message || 'Unknown error'}`);
        }
    }

    /**
     * Giải thích văn bản
     */
    async explain(text: string): Promise<string> {
        const systemInstruction = 'Bạn là một giáo viên tận tâm. Hãy giải thích văn bản một cách dễ hiểu, chi tiết và có ví dụ minh họa nếu cần.';
        const prompt = `Hãy giải thích chi tiết văn bản sau:\n\n${text}`;

        try {
            const result = await this.model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                systemInstruction: systemInstruction,
                generationConfig: {
                    temperature: 0.6,
                    maxOutputTokens: 2000,
                },
            });

            const response = result.response;
            return response.text() || 'Không thể giải thích văn bản.';
        } catch (error: any) {
            console.error('Gemini API Error:', error);
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

        const systemInstruction = `Bạn là một chuyên gia biên tập văn bản. Hãy cải thiện văn phong của văn bản theo phong cách ${styleDescriptions[style]}, giữ nguyên ý nghĩa nhưng làm cho văn bản trở nên hay hơn, rõ ràng hơn và chuyên nghiệp hơn.`;
        const prompt = `Hãy cải thiện văn phong của văn bản sau theo phong cách ${styleDescriptions[style]}:\n\n${text}`;

        try {
            const result = await this.model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                systemInstruction: systemInstruction,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2000,
                },
            });

            const response = result.response;
            return response.text() || 'Không thể cải thiện văn bản.';
        } catch (error: any) {
            console.error('Gemini API Error:', error);
            throw new Error(`Lỗi khi cải thiện văn bản: ${error.message || 'Unknown error'}`);
        }
    }

    /**
     * Dịch thuật văn bản
     */
    async translate(text: string, targetLanguage: string = 'tiếng Anh'): Promise<string> {
        const systemInstruction = 'Bạn là một chuyên gia dịch thuật chuyên nghiệp. Hãy dịch văn bản một cách chính xác, tự nhiên và giữ nguyên ý nghĩa.';
        const prompt = `Hãy dịch văn bản sau sang ${targetLanguage}:\n\n${text}`;

        try {
            const result = await this.model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                systemInstruction: systemInstruction,
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 2000,
                },
            });

            const response = result.response;
            return response.text() || 'Không thể dịch văn bản.';
        } catch (error: any) {
            console.error('Gemini API Error:', error);
            throw new Error(`Lỗi khi dịch văn bản: ${error.message || 'Unknown error'}`);
        }
    }
}

export const geminiService = new GeminiService();

