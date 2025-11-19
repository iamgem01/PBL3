import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

interface ModelConfig {
    apiKey: string;
    modelName: string;
}

interface UserPreferences {
    tone?: 'formal' | 'casual' | 'friendly' | 'professional';
    responseLength?: 'concise' | 'detailed' | 'comprehensive';
    language?: string;
    expertise?: 'beginner' | 'intermediate' | 'expert';
}

interface FileData {
    mimeType: string;
    data: Buffer | Uint8Array;
    fileName?: string;
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
    private failedConfigs: Set<number> = new Set();
    private lastResetTime: number = Date.now();
    private readonly RESET_INTERVAL = 5 * 60 * 1000;

    constructor() {
        this.modelConfigs = createModelConfigs();
        if (this.modelConfigs.length === 0) {
            throw new Error('No Gemini API keys or models configured');
        }
        console.log(`✅ Khởi tạo với ${this.modelConfigs.length} cấu hình model`);
    }

    private getCurrentModel() {
        const config = this.modelConfigs[this.currentConfigIndex];
        const genAI = new GoogleGenerativeAI(config.apiKey);
        return genAI.getGenerativeModel({ model: config.modelName });
    }

    private resetFailedConfigsIfNeeded() {
        const now = Date.now();
        if (now - this.lastResetTime > this.RESET_INTERVAL) {
            this.failedConfigs.clear();
            this.lastResetTime = now;
            console.log('🔄 Reset failed configs - thử lại tất cả keys');
        }
    }

    private getNextAvailableConfigIndex(): number | null {
        this.resetFailedConfigsIfNeeded();

        const startIndex = this.currentConfigIndex;
        let attempts = 0;

        do {
            this.currentConfigIndex = (this.currentConfigIndex + 1) % this.modelConfigs.length;
            attempts++;

            if (attempts >= this.modelConfigs.length) {
                if (this.failedConfigs.size === this.modelConfigs.length) {
                    this.failedConfigs.clear();
                    this.currentConfigIndex = 0;
                    return 0;
                }
                if (attempts >= this.modelConfigs.length * 2) {
                    return null;
                }
            }
        } while (this.failedConfigs.has(this.currentConfigIndex) && attempts < this.modelConfigs.length * 2);

        return this.currentConfigIndex;
    }

    private async tryWithFallback<T>(
        operation: (model: any) => Promise<T>,
        operationName: string
    ): Promise<T> {
        const maxAttempts = this.modelConfigs.length * 2;
        let lastError: any;
        let consecutiveFailures = 0;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                const model = this.getCurrentModel();
                const result = await operation(model);

                const config = this.modelConfigs[this.currentConfigIndex];
                console.log(`✓ ${operationName} thành công với model: ${config.modelName}`);

                this.failedConfigs.delete(this.currentConfigIndex);
                return result;
            } catch (error: any) {
                lastError = error;
                const config = this.modelConfigs[this.currentConfigIndex];

                if (isQuotaOrRateLimitError(error)) {
                    console.warn(`⚠ ${operationName} thất bại với ${config.modelName}: ${error.message}`);

                    this.failedConfigs.add(this.currentConfigIndex);
                    consecutiveFailures++;

                    if (this.failedConfigs.size === this.modelConfigs.length) {
                        const waitTime = Math.min(5000 + (consecutiveFailures * 1000), 30000);
                        console.log(`⏳ Tất cả configs hết quota. Đợi ${waitTime/1000}s...`);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                        this.failedConfigs.clear();
                        this.currentConfigIndex = 0;
                        continue;
                    }

                    const nextIndex = this.getNextAvailableConfigIndex();
                    if (nextIndex === null) {
                        throw new Error('Không tìm thấy config khả dụng');
                    }

                    await new Promise(resolve => setTimeout(resolve, 500));
                } else {
                    throw error;
                }
            }
        }

        throw new Error(
            `Tất cả model đã hết quota. Vui lòng thử lại sau. Lỗi: ${lastError?.message || 'Unknown error'}`
        );
    }

    private buildSystemInstruction(baseInstruction: string, preferences?: UserPreferences): string {
        let instruction = baseInstruction;

        if (preferences) {
            // Thêm tone preference
            if (preferences.tone) {
                const toneMap = {
                    formal: 'Sử dụng ngôn ngữ trang trọng, lịch sự và chuyên nghiệp.',
                    casual: 'Sử dụng ngôn ngữ thân thiện, thoải mái và gần gũi.',
                    friendly: 'Sử dụng ngôn ngữ thân thiện, nhiệt tình và hỗ trợ.',
                    professional: 'Sử dụng ngôn ngữ chuyên nghiệp, rõ ràng và súc tích.'
                };
                instruction += `\n${toneMap[preferences.tone]}`;
            }

            // Thêm response length preference
            if (preferences.responseLength) {
                const lengthMap = {
                    concise: 'Trả lời ngắn gọn, đi thẳng vào vấn đề chính.',
                    detailed: 'Trả lời chi tiết với giải thích rõ ràng.',
                    comprehensive: 'Trả lời toàn diện với ví dụ, giải thích sâu và các góc nhìn đa chiều.'
                };
                instruction += `\n${lengthMap[preferences.responseLength]}`;
            }

            // Thêm expertise level
            if (preferences.expertise) {
                const expertiseMap = {
                    beginner: 'Giải thích theo cách dễ hiểu cho người mới bắt đầu, tránh thuật ngữ phức tạp.',
                    intermediate: 'Sử dụng thuật ngữ phù hợp, giải thích khi cần thiết.',
                    expert: 'Sử dụng thuật ngữ chuyên môn, đi sâu vào chi tiết kỹ thuật.'
                };
                instruction += `\n${expertiseMap[preferences.expertise]}`;
            }
        }

        return instruction;
    }

    private async extractTextFromFiles(files: FileData[]): Promise<string> {
        let extractedText = '';
        
        for (const file of files) {
            if (file.mimeType.startsWith('text/')) {
                const text = Buffer.from(file.data).toString('utf-8');
                extractedText += `\n\n--- Nội dung từ ${file.fileName || 'file'} ---\n${text}`;
            } else if (file.mimeType === 'application/pdf') {
                extractedText += `\n\n--- File PDF: ${file.fileName || 'document.pdf'} ---\n[Nội dung sẽ được phân tích bởi AI]`;
            } else if (file.mimeType.startsWith('image/')) {
                extractedText += `\n\n--- Hình ảnh: ${file.fileName || 'image'} ---\n[Hình ảnh sẽ được phân tích bởi AI]`;
            }
        }
        
        return extractedText;
    }

    async chat(
        message: string, 
        context?: string, 
        files?: FileData[],
        preferences?: UserPreferences
    ): Promise<string> {
        const baseInstruction = `Bạn là một trợ lý AI thông minh, hiểu biết sâu rộng và hữu ích.

NHIỆM VỤ CHÍNH:
- Đọc và hiểu chính xác nội dung câu hỏi và tất cả tài liệu đính kèm
- Phân tích kỹ lưỡng context và files được cung cấp
- Trả lời chính xác, đúng trọng tâm và có căn cứ
- Trích dẫn thông tin từ nguồn khi cần thiết

NGUYÊN TẮC TRẢ LỜI:
1. ĐỌC KỸ: Đọc toàn bộ nội dung câu hỏi, context và files trước khi trả lời
2. CHÍNH XÁC: Chỉ đưa ra thông tin chính xác, có căn cứ từ dữ liệu được cung cấp
3. TRỌNG TÂM: Tập trung vào điểm chính của câu hỏi, không lan man
4. CHI TIẾT: Cung cấp đủ chi tiết để người dùng hiểu rõ, nhưng không dài dòng
5. CẤU TRÚC: Tổ chức câu trả lời rõ ràng, logic và dễ theo dõi
6. TRÍCH DẪN: Khi sử dụng thông tin từ context/files, hãy chỉ rõ nguồn

KHI LÀM VIỆC VỚI FILES:
- PDF: Đọc và phân tích toàn bộ nội dung
- Hình ảnh: Mô tả chi tiết những gì nhìn thấy
- Text files: Trích xuất thông tin quan trọng
- Luôn xác nhận đã đọc và hiểu nội dung file

KHI CÓ CONTEXT:
- Ưu tiên sử dụng thông tin từ context để trả lời
- So sánh và kết hợp thông tin từ nhiều nguồn nếu có
- Chỉ ra nếu thông tin trong context không đủ để trả lời

Trả lời bằng tiếng Việt một cách tự nhiên và chuyên nghiệp.`;

        const systemInstruction = this.buildSystemInstruction(baseInstruction, preferences);

        // Xây dựng prompt với context và file information
        let enhancedPrompt = '';

        // Thêm file content nếu có
        if (files && files.length > 0) {
            const fileInfo = await this.extractTextFromFiles(files);
            enhancedPrompt += `${fileInfo}\n\n---\n\n`;
        }

        // Thêm context nếu có
        if (context) {
            enhancedPrompt += `📚 THÔNG TIN CONTEXT TỪ GHI CHÚ:\n\n${context}\n\n---\n\n`;
        }

        // Thêm câu hỏi chính
        enhancedPrompt += `❓ CÂU HỎI CỦA NGƯỜI DÙNG:\n\n${message}\n\n`;

        // Thêm hướng dẫn phản hồi
        enhancedPrompt += `\n💡 YÊU CẦU:\n`;
        enhancedPrompt += `- Đọc kỹ và hiểu toàn bộ thông tin đã cung cấp ở trên\n`;
        enhancedPrompt += `- Trả lời chính xác, đúng trọng tâm dựa trên dữ liệu có sẵn\n`;
        enhancedPrompt += `- Nếu thông tin không đủ, hãy nói rõ phần nào còn thiếu\n`;
        if (context || (files && files.length > 0)) {
            enhancedPrompt += `- Trích dẫn cụ thể từ nguồn khi đưa ra thông tin quan trọng\n`;
        }

        return this.tryWithFallback(async (model) => {
            const parts: any[] = [{ text: enhancedPrompt }];

            // Thêm files dưới dạng inline data
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
                    maxOutputTokens: 4096,
                    topP: 0.95,
                    topK: 40,
                },
            });

            const response = result.response;
            const text = response.text();
            
            if (!text || text.trim().length === 0) {
                throw new Error('AI không tạo được phản hồi. Vui lòng thử lại.');
            }

            return text;
        }, 'chat');
    }

    async summarize(text: string, maxLength: number = 200, preferences?: UserPreferences): Promise<string> {
        const baseInstruction = `Bạn là chuyên gia tóm tắt văn bản với khả năng:

NHIỆM VỤ:
- Đọc và hiểu toàn bộ nội dung văn bản
- Xác định các ý chính và thông tin quan trọng nhất
- Tóm tắt ngắn gọn nhưng đầy đủ ý nghĩa

NGUYÊN TẮC:
1. Giữ lại tất cả thông tin quan trọng và ý chính
2. Loại bỏ chi tiết không cần thiết
3. Sử dụng ngôn ngữ súc tích, rõ ràng
4. Đảm bảo tóm tắt mạch lạc và dễ hiểu
5. Không thêm thông tin không có trong văn bản gốc`;

        const systemInstruction = this.buildSystemInstruction(baseInstruction, preferences);
        const prompt = `Hãy đọc kỹ và tóm tắt văn bản sau trong khoảng ${maxLength} từ. Tập trung vào các ý chính và thông tin quan trọng:\n\n${text}`;

        return this.tryWithFallback(async (model) => {
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                systemInstruction: systemInstruction,
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: Math.min(maxLength * 3, 2048),
                    topP: 0.9,
                },
            });

            const response = result.response;
            return response.text() || 'Không thể tóm tắt văn bản.';
        }, 'summarize');
    }

    async createNote(text: string, preferences?: UserPreferences): Promise<string> {
        const baseInstruction = `Bạn là chuyên gia tạo ghi chú chuyên nghiệp với khả năng:

NHIỆM VỤ:
- Đọc và phân tích toàn bộ nội dung
- Tổ chức thông tin theo cấu trúc logic
- Tạo ghi chú dễ đọc, dễ tìm kiếm và dễ sử dụng lại

CẤU TRÚC GHI CHÚ:
1. **Tiêu đề chính**: Nội dung tóm tắt
2. **Các điểm chính**: 
   - Ý 1: Chi tiết
   - Ý 2: Chi tiết
3. **Chi tiết quan trọng**: Thông tin cụ thể
4. **Kết luận/Hành động**: (nếu có)

YÊU CẦU:
- Sử dụng markdown để định dạng
- Làm nổi bật thông tin quan trọng
- Tổ chức theo thứ bậc rõ ràng
- Dễ scan và tìm kiếm`;

        const systemInstruction = this.buildSystemInstruction(baseInstruction, preferences);
        const prompt = `Hãy đọc kỹ và tạo ghi chú có cấu trúc từ văn bản sau:\n\n${text}`;

        return this.tryWithFallback(async (model) => {
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                systemInstruction: systemInstruction,
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 3072,
                    topP: 0.95,
                },
            });

            const response = result.response;
            return response.text() || 'Không thể tạo ghi chú.';
        }, 'createNote');
    }

    async explain(text: string, preferences?: UserPreferences): Promise<string> {
        const baseInstruction = `Bạn là giáo viên tận tâm với khả năng giải thích phức tạp thành đơn giản.

NHIỆM VỤ:
- Đọc và hiểu sâu nội dung cần giải thích
- Phân tích các khái niệm và mối quan hệ
- Giải thích theo cách dễ hiểu nhất

PHƯƠNG PHÁP GIẢI THÍCH:
1. **Tổng quan**: Giới thiệu nội dung chung
2. **Chi tiết**: Giải thích từng phần với ví dụ
3. **Kết nối**: Liên hệ với kiến thức đã biết
4. **Tóm tắt**: Kết luận và điểm mấu chốt

YÊU CẦU:
- Sử dụng ví dụ cụ thể và dễ hiểu
- Giải thích thuật ngữ khó
- Chia nhỏ nội dung phức tạp
- Đảm bảo logic và mạch lạc`;

        const systemInstruction = this.buildSystemInstruction(baseInstruction, preferences);
        const prompt = `Hãy đọc kỹ và giải thích chi tiết, dễ hiểu nội dung sau:\n\n${text}`;

        return this.tryWithFallback(async (model) => {
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                systemInstruction: systemInstruction,
                generationConfig: {
                    temperature: 0.6,
                    maxOutputTokens: 3072,
                    topP: 0.95,
                },
            });

            const response = result.response;
            return response.text() || 'Không thể giải thích văn bản.';
        }, 'explain');
    }

    async improveWriting(
        text: string, 
        style: 'formal' | 'casual' | 'academic' | 'professional' = 'professional',
        preferences?: UserPreferences
    ): Promise<string> {
        const styleDescriptions = {
            formal: 'trang trọng, lịch sự, phù hợp văn bản chính thức',
            casual: 'thân thiện, tự nhiên, gần gũi',
            academic: 'học thuật, nghiêm túc, có trích dẫn và lập luận chặt chẽ',
            professional: 'chuyên nghiệp, rõ ràng, súc tích và thuyết phục'
        };

        const baseInstruction = `Bạn là chuyên gia biên tập văn bản hàng đầu.

NHIỆM VỤ:
- Đọc và hiểu văn bản gốc
- Cải thiện văn phong theo phong cách ${styleDescriptions[style]}
- Giữ nguyên ý nghĩa và thông điệp chính

QUY TRÌNH CẢI THIỆN:
1. **Cấu trúc**: Tổ chức lại nếu cần
2. **Ngôn từ**: Chọn từ chính xác, phù hợp phong cách
3. **Ngữ pháp**: Sửa lỗi và cải thiện câu văn
4. **Mạch lạc**: Đảm bảo logic và liền mạch
5. **Tác động**: Tăng sức thuyết phục và rõ ràng

YÊU CẦU:
- Giữ nguyên ý nghĩa gốc 100%
- Cải thiện rõ rệt so với bản gốc
- Phù hợp với phong cách yêu cầu
- Tự nhiên và dễ đọc`;

        const systemInstruction = this.buildSystemInstruction(baseInstruction, preferences);
        const prompt = `Hãy cải thiện văn phong của văn bản sau theo phong cách ${styleDescriptions[style]}. Giữ nguyên ý nghĩa nhưng làm cho văn bản hay hơn, rõ ràng hơn:\n\n${text}`;

        return this.tryWithFallback(async (model) => {
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                systemInstruction: systemInstruction,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 3072,
                    topP: 0.95,
                },
            });

            const response = result.response;
            return response.text() || 'Không thể cải thiện văn bản.';
        }, 'improveWriting');
    }

    async translate(
        text: string, 
        targetLanguage: string = 'tiếng Anh',
        preferences?: UserPreferences
    ): Promise<string> {
        const baseInstruction = `Bạn là chuyên gia dịch thuật chuyên nghiệp với khả năng:

NHIỆM VỤ:
- Đọc và hiểu chính xác văn bản gốc
- Dịch sang ${targetLanguage} một cách tự nhiên
- Giữ nguyên tone và ý nghĩa

NGUYÊN TẮC DỊCH:
1. **Chính xác**: 100% ý nghĩa gốc
2. **Tự nhiên**: Phù hợp ngôn ngữ đích
3. **Văn hóa**: Điều chỉnh thành ngữ, tục ngữ nếu cần
4. **Tone**: Giữ nguyên giọng điệu và cảm xúc
5. **Thuật ngữ**: Sử dụng thuật ngữ chuyên ngành đúng

YÊU CẦU:
- Dịch toàn bộ, không bỏ sót
- Giữ định dạng nếu có
- Tự nhiên như người bản xứ
- Không thêm hoặc bớt thông tin`;

        const systemInstruction = this.buildSystemInstruction(baseInstruction, preferences);
        const prompt = `Hãy đọc kỹ và dịch chính xác văn bản sau sang ${targetLanguage}:\n\n${text}`;

        return this.tryWithFallback(async (model) => {
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                systemInstruction: systemInstruction,
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 3072,
                    topP: 0.9,
                },
            });

            const response = result.response;
            return response.text() || 'Không thể dịch văn bản.';
        }, 'translate');
    }
}

export const geminiService = new GeminiService();