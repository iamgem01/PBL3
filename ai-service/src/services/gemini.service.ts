import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();


interface ModelConfig {
    apiKey: string;
    modelName: string;
}


function getApiKeys(): string[] {
    const keys: string[] = [];
    let index = 1;

    if (process.env.GEMINI_API_KEY) {
        keys.push(process.env.GEMINI_API_KEY);
    }

    while (process.env[`GEMINI_API_KEY_${index}`]) {
        keys.push(process.env[`GEMINI_API_KEY_${index}`]!);
        index++;
    }

    if (keys.length === 0) {
        throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    return keys;
}

function getModels(): string[] {
    const models: string[] = [];

    const defaultModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';
    models.push(defaultModel);

    let index = 1;
    while (process.env[`GEMINI_MODEL_${index}`]) {
        models.push(process.env[`GEMINI_MODEL_${index}`]!);
        index++;
    }

    return models;
}

function createModelConfigs(): ModelConfig[] {
    const apiKeys = getApiKeys();
    const models = getModels();
    const configs: ModelConfig[] = [];

    for (const apiKey of apiKeys) {
        for (const model of models) {
            configs.push({ apiKey, modelName: model });
        }
    }

    return configs;
}

function isQuotaOrRateLimitError(error: any): boolean {
    const errorMessage = error?.message?.toLowerCase() || '';
    const statusCode = error?.status || error?.code;

    return (
        errorMessage.includes('quota') ||
        errorMessage.includes('rate limit') ||
        errorMessage.includes('429') ||
        errorMessage.includes('resource exhausted') ||
        statusCode === 429 ||
        statusCode === 403 ||
        errorMessage.includes('permission denied')
    );
}

export class GeminiService {
    private modelConfigs: ModelConfig[];
    private currentConfigIndex: number = 0;
    private failedConfigs: Set<number> = new Set(); // Track failed configs
    private lastResetTime: number = Date.now();
    private readonly RESET_INTERVAL = 5 * 60 * 1000; // Reset sau 5 phút

    constructor() {
        this.modelConfigs = createModelConfigs();
        if (this.modelConfigs.length === 0) {
            throw new Error('No Gemini API keys or models configured');
        }
        console.log(`Initialized with ${this.modelConfigs.length} model configurations`);
    }

    private getCurrentModel() {
        const config = this.modelConfigs[this.currentConfigIndex];
        const genAI = new GoogleGenerativeAI(config.apiKey);
        return genAI.getGenerativeModel({ model: config.modelName });
    }

    // Reset failed configs sau một khoảng thời gian
    private resetFailedConfigsIfNeeded() {
        const now = Date.now();
        if (now - this.lastResetTime > this.RESET_INTERVAL) {
            this.failedConfigs.clear();
            this.lastResetTime = now;
            console.log('🔄 Resetting failed configs - retrying all keys');
        }
    }

    // Tìm config tiếp theo chưa bị failed
    private getNextAvailableConfigIndex(): number | null {
        this.resetFailedConfigsIfNeeded();

        const startIndex = this.currentConfigIndex;
        let attempts = 0;

        do {
            this.currentConfigIndex = (this.currentConfigIndex + 1) % this.modelConfigs.length;
            attempts++;

            // Nếu đã thử hết tất cả configs
            if (attempts >= this.modelConfigs.length) {
                // Nếu tất cả đều failed, reset và thử lại từ đầu
                if (this.failedConfigs.size === this.modelConfigs.length) {
                    this.failedConfigs.clear();
                    this.currentConfigIndex = 0;
                    return 0;
                }
                // Nếu còn config chưa failed, tiếp tục tìm
                if (attempts >= this.modelConfigs.length * 2) {
                    return null; // Không tìm thấy config nào
                }
            }
        } while (this.failedConfigs.has(this.currentConfigIndex) && attempts < this.modelConfigs.length * 2);

        return this.currentConfigIndex;
    }

    private async tryWithFallback<T>(
        operation: (model: any) => Promise<T>,
        operationName: string
    ): Promise<T> {
        const maxAttempts = this.modelConfigs.length * 2; // Cho phép thử nhiều hơn một lần
        let lastError: any;
        let consecutiveFailures = 0;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                const model = this.getCurrentModel();
                const result = await operation(model);

                const config = this.modelConfigs[this.currentConfigIndex];
                console.log(`✓ ${operationName} succeeded with model: ${config.modelName} (API key ${this.currentConfigIndex + 1})`);

                // Reset failed status nếu thành công
                this.failedConfigs.delete(this.currentConfigIndex);

                return result;
            } catch (error: any) {
                lastError = error;
                const config = this.modelConfigs[this.currentConfigIndex];

                if (isQuotaOrRateLimitError(error)) {
                    console.warn(`⚠ ${operationName} failed with model ${config.modelName} (API key ${this.currentConfigIndex + 1}): ${error.message}`);

                    // Đánh dấu config này đã failed
                    this.failedConfigs.add(this.currentConfigIndex);
                    consecutiveFailures++;

                    // Nếu tất cả configs đều failed, đợi lâu hơn
                    if (this.failedConfigs.size === this.modelConfigs.length) {
                        const waitTime = Math.min(5000 + (consecutiveFailures * 1000), 30000); // Tối đa 30 giây
                        console.log(`⏳ All configs exhausted. Waiting ${waitTime/1000}s before retry...`);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                        this.failedConfigs.clear(); // Reset để thử lại
                        this.currentConfigIndex = 0;
                        continue;
                    }

                    // Tìm config tiếp theo chưa failed
                    const nextIndex = this.getNextAvailableConfigIndex();
                    if (nextIndex === null) {
                        throw new Error('Không tìm thấy config nào khả dụng');
                    }

                    // Delay ngắn trước khi thử config tiếp theo
                    await new Promise(resolve => setTimeout(resolve, 500));
                } else {
                    // Nếu không phải lỗi quota, throw ngay
                    throw error;
                }
            }
        }

        // Nếu đã thử hết tất cả
        throw new Error(
            `Tất cả các model đã hết quota hoặc gặp lỗi. Vui lòng thử lại sau vài phút. Lỗi cuối cùng: ${lastError?.message || 'Unknown error'}`
        );
    }

    async chat(message: string, context?: string, files?: Array<{ mimeType: string; data: Buffer | Uint8Array; fileName?: string }>): Promise<string> {
        const systemInstruction = 'Bạn là một trợ lý AI thông minh và hữu ích. Bạn trả lời bằng tiếng Việt một cách tự nhiên và chuyên nghiệp. Khi được cung cấp context (thông tin từ các note), hãy sử dụng thông tin đó để trả lời câu hỏi một cách chính xác và chi tiết. Trả lời câu hỏi của người dùng một cách tự nhiên và chuyên nghiệp.';

        let prompt = message;
        if (context) {
            prompt = `Dưới đây là các thông tin context từ các note mà người dùng đã chọn:\n\n${context}\n\n---\n\nDựa trên context trên, hãy trả lời câu hỏi sau của người dùng:\n\n${message}`;
        }

        return this.tryWithFallback(async (model) => {
            // Chuẩn bị parts cho request
            const parts: any[] = [{ text: prompt }];

            // Thêm file nếu có
            if (files && files.length > 0) {
                for (const file of files) {
                    parts.push({
                        inlineData: {
                            data: Buffer.from(file.data).toString('base64'),
                            mimeType: file.mimeType
                        }
                    });
                }
            }

            const result = await model.generateContent({
                contents: [{ role: 'user', parts }],
                systemInstruction: systemInstruction,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2000,
                },
            });

            const response = result.response;
            return response.text() || 'Xin lỗi, tôi không thể tạo phản hồi.';
        }, 'chat');
    }

    async summarize(text: string, maxLength: number = 200): Promise<string> {
        const systemInstruction = 'Bạn là một chuyên gia tóm tắt văn bản. Hãy tóm tắt văn bản một cách ngắn gọn, súc tích và giữ lại những thông tin quan trọng nhất.';
        const prompt = `Hãy tóm tắt văn bản sau đây trong khoảng ${maxLength} từ:\n\n${text}`;

        return this.tryWithFallback(async (model) => {
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                systemInstruction: systemInstruction,
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: Math.min(maxLength * 2, 1000),
                },
            });

            const response = result.response;
            return response.text() || 'Không thể tóm tắt văn bản.';
        }, 'summarize');
    }

    async createNote(text: string): Promise<string> {
        const systemInstruction = 'Bạn là một trợ lý tạo ghi chú chuyên nghiệp. Hãy tạo ghi chú có cấu trúc, dễ đọc và dễ hiểu từ văn bản được cung cấp. Sử dụng định dạng markdown với các tiêu đề, danh sách và điểm nhấn quan trọng.';
        const prompt = `Hãy tạo ghi chú từ văn bản sau:\n\n${text}`;

        return this.tryWithFallback(async (model) => {
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                systemInstruction: systemInstruction,
                generationConfig: {
                    temperature: 0.5,
                    maxOutputTokens: 2000,
                },
            });

            const response = result.response;
            return response.text() || 'Không thể tạo ghi chú.';
        }, 'createNote');
    }

    async explain(text: string): Promise<string> {
        const systemInstruction = 'Bạn là một giáo viên tận tâm. Hãy giải thích văn bản một cách dễ hiểu, chi tiết và có ví dụ minh họa nếu cần.';
        const prompt = `Hãy giải thích chi tiết văn bản sau:\n\n${text}`;

        return this.tryWithFallback(async (model) => {
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                systemInstruction: systemInstruction,
                generationConfig: {
                    temperature: 0.6,
                    maxOutputTokens: 2000,
                },
            });

            const response = result.response;
            return response.text() || 'Không thể giải thích văn bản.';
        }, 'explain');
    }

    async improveWriting(text: string, style: 'formal' | 'casual' | 'academic' | 'professional' = 'professional'): Promise<string> {
        const styleDescriptions = {
            formal: 'trang trọng, lịch sự',
            casual: 'thân thiện, tự nhiên',
            academic: 'học thuật, chuyên sâu',
            professional: 'chuyên nghiệp, rõ ràng'
        };

        const systemInstruction = `Bạn là một chuyên gia biên tập văn bản. Hãy cải thiện văn phong của văn bản theo phong cách ${styleDescriptions[style]}, giữ nguyên ý nghĩa nhưng làm cho văn bản trở nên hay hơn, rõ ràng hơn và chuyên nghiệp hơn.`;
        const prompt = `Hãy cải thiện văn phong của văn bản sau theo phong cách ${styleDescriptions[style]}:\n\n${text}`;

        return this.tryWithFallback(async (model) => {
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                systemInstruction: systemInstruction,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2000,
                },
            });

            const response = result.response;
            return response.text() || 'Không thể cải thiện văn bản.';
        }, 'improveWriting');
    }

    async translate(text: string, targetLanguage: string = 'tiếng Anh'): Promise<string> {
        const systemInstruction = 'Bạn là một chuyên gia dịch thuật chuyên nghiệp. Hãy dịch văn bản một cách chính xác, tự nhiên và giữ nguyên ý nghĩa.';
        const prompt = `Hãy dịch văn bản sau sang ${targetLanguage}:\n\n${text}`;

        return this.tryWithFallback(async (model) => {
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                systemInstruction: systemInstruction,
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 2000,
                },
            });

            const response = result.response;
            return response.text() || 'Không thể dịch văn bản.';
        }, 'translate');
    }
}

export const geminiService = new GeminiService();

