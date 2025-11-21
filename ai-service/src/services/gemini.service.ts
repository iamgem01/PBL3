import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// --- INTERFACES ---
interface ModelConfig {
    apiKey: string;
    modelName: string;
}

export interface UserPreferences {
    tone?: 'formal' | 'casual' | 'friendly' | 'professional' | 'witty';
    responseLength?: 'concise' | 'detailed' | 'comprehensive';
    language?: string;
    expertise?: 'beginner' | 'intermediate' | 'expert';
}

export interface FileData {
    mimeType: string;
    data: Buffer | Uint8Array;
    fileName?: string;
}

// --- HELPER FUNCTIONS ---
function getApiKeys(): string[] {
    const keys: string[] = [];
    if (process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY);
    
    let index = 1;
    while (process.env[`GEMINI_API_KEY_${index}`]) {
        keys.push(process.env[`GEMINI_API_KEY_${index}`]!);
        index++;
    }

    if (keys.length === 0) throw new Error('❌ CRITICAL: Không tìm thấy GEMINI_API_KEY trong .env');
    return keys;
}

function createModelConfigs(defaultModel: string): ModelConfig[] {
    const apiKeys = getApiKeys();
    return apiKeys.map(apiKey => ({ apiKey, modelName: defaultModel }));
}

function isQuotaError(error: any): boolean {
    const msg = error?.message?.toLowerCase() || '';
    const status = error?.status || error?.code;
    return msg.includes('quota') || msg.includes('429') || status === 429 || msg.includes('resource exhausted');
}

// --- MAIN SERVICE CLASS ---
export class GeminiService {
    private modelConfigs: ModelConfig[];
    private currentConfigIndex: number = 0;
    private failedConfigs: Set<number> = new Set();
    private lastResetTime: number = Date.now();
    
    // Chiến lược Model (Dual-Core)
    private readonly fastModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    private readonly smartModel = process.env.GEMINI_MODEL_SMART || 'gemini-1.5-pro';

    constructor() {
        // Khởi tạo config ban đầu
        this.modelConfigs = createModelConfigs(this.fastModel);
        console.log(`✨ Gemini Service Ultimate Ready | Keys: ${this.modelConfigs.length}`);
        console.log(`🚀 Fast Core: ${this.fastModel} | 🧠 Smart Core: ${this.smartModel}`);
    }

    // --- 1. INTELLIGENT LOAD BALANCING SYSTEM ---

    private getCurrentModel(targetModelName: string) {
        const config = this.modelConfigs[this.currentConfigIndex];
        const genAI = new GoogleGenerativeAI(config.apiKey);
        
        return genAI.getGenerativeModel({ 
            model: targetModelName,
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            ],
            generationConfig: {
                // Cấu hình sinh lời thoại tự nhiên hơn
                temperature: targetModelName.includes('flash') ? 0.7 : 0.4, // Flash sáng tạo hơn, Pro chính xác hơn
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 8192, // Tăng token để trả lời dài
            }
        });
    }

    private async tryWithFallback<T>(
        operation: (model: any) => Promise<T>,
        operationName: string,
        targetModel: string
    ): Promise<T> {
        const maxAttempts = this.modelConfigs.length * 2;
        
        // Reset danh sách lỗi mỗi 5 phút
        if (Date.now() - this.lastResetTime > 5 * 60 * 1000) {
            this.failedConfigs.clear();
            this.lastResetTime = Date.now();
        }

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                // Bỏ qua các key đã fail
                while (this.failedConfigs.has(this.currentConfigIndex) && this.failedConfigs.size < this.modelConfigs.length) {
                    this.currentConfigIndex = (this.currentConfigIndex + 1) % this.modelConfigs.length;
                }

                const model = this.getCurrentModel(targetModel);
                return await operation(model);

            } catch (error: any) {
                if (isQuotaError(error)) {
                    console.warn(`⚠ Quota Exceeded [${operationName}] Key #${this.currentConfigIndex}. Switching...`);
                    this.failedConfigs.add(this.currentConfigIndex);
                    this.currentConfigIndex = (this.currentConfigIndex + 1) % this.modelConfigs.length;
                    
                    if (this.failedConfigs.size >= this.modelConfigs.length) {
                        console.log('⏳ All keys exhausted. Waiting 3s...');
                        await new Promise(r => setTimeout(r, 3000));
                        this.failedConfigs.clear(); 
                    }
                } else {
                    console.error(`❌ Fatal Error in [${operationName}]:`, error);
                    throw error;
                }
            }
        }
        throw new Error(`Service Unavailable: Hệ thống đang quá tải, vui lòng thử lại sau.`);
    }

    // --- 2. PROMPT ENGINEERING SYSTEM (THE CORE MAGIC) ---

    private buildSystemInstruction(role: string, coreTask: string, pref?: UserPreferences): string {
        // 1. Thiết lập Persona (Nhập vai)
        let instruction = `${role}\n\n`;
        instruction += `NHIỆM VỤ CỐT LÕI: ${coreTask}\n\n`;

        // 2. Quy tắc trình bày (Structured Output) - Ép AI format đẹp
        instruction += `QUY TẮC TRÌNH BÀY (BẮT BUỘC):\n`;
        instruction += `- Trả về HTML thuần túy, KHÔNG có code block () hoặc markdown markers.\n`;
        instruction += `- Tiêu đề chính dùng <h3>, tiêu đề phụ <h4>.\n`;
        instruction += `- Các phần tử sát nhau, KHÔNG xuống dòng thừa giữa các phần.\n`;
        instruction += `- Response ngắn gọn, súc tích, tránh dài dòng.\n`;
        instruction += `- In đậm dùng <strong>text</strong>.\n`;
        instruction += `- Danh sách dùng <ul><li>item</li></ul> sát nhau.\n`;
        instruction += `- Văn bản liên tục dùng <p>, không <br> thừa.\n`;
        instruction += `- KHÔNG dùng <h1>, <h2>, <code>, <pre>.\n\n`;
        // 3. Rào chắn chống bịa đặt (Anti-Hallucination)
        instruction += `NGUYÊN TẮC TRUNG THỰC:\n`;
        instruction += `- Chỉ trả lời dựa trên dữ kiện có thật hoặc context được cung cấp.\n`;
        instruction += `- Nếu không biết hoặc thông tin không đủ, hãy nói "Tôi chưa có đủ thông tin về vấn đề này", đừng cố bịa ra câu trả lời.\n\n`;
        instruction += `- Nếu không biết hoặc thông tin không đủ, hãy nói "Tôi chưa có đủ thông tin về vấn đề này", đừng cố bịa ra câu trả lời.\n\n`;
        instruction += `ĐỘ DÀI RESPONSE:\n`;
        instruction += `- Giữ response ngắn gọn, tránh dài dòng.\n`;
        instruction += `- Tóm tắt súc tích, đi thẳng vào vấn đề.\n\n`;
        // 4. Dynamic Tuning (Tùy chỉnh theo user)
        if (pref) {
            instruction += `CẤU HÌNH PHẢN HỒI THEO YÊU CẦU USER:\n`;
            if (pref.tone) {
                const tones = {
                    formal: 'Trang trọng, lịch sự, dùng kính ngữ.',
                    casual: 'Thân thiện, gần gũi, tự nhiên như bạn bè.',
                    friendly: 'Thân thiện, ấm áp, dễ gần, tạo cảm giác thoải mái.',
                    professional: 'Chuyên nghiệp, súc tích, đi thẳng vào vấn đề.',
                    witty: 'Hài hước, thông minh, dí dỏm.'
                };
                instruction += `- Tone giọng: ${tones[pref.tone] || pref.tone}.\n`;
            }
            if (pref.responseLength) instruction += `- Độ dài phản hồi: ${pref.responseLength}.\n`;
            if (pref.expertise) instruction += `- Trình độ người đọc mục tiêu: ${pref.expertise}.\n`;
            if (pref.language) instruction += `- Ngôn ngữ trả lời: ${pref.language} (Ưu tiên Tiếng Việt nếu không chỉ định).\n`;
        } else {
            instruction += `- Ngôn ngữ trả lời: Tiếng Việt.\n`;
        }

        return instruction;
    }

    // --- 3. ADVANCED API METHODS ---

    // ➤ CHAT: Tốc độ cao (Fast Model)
    async chat(message: string, context?: string, files?: FileData[], pref?: UserPreferences): Promise<string> {
        const role = `Bạn là một Trợ lý AI Thông minh, Tận tâm và Hiệu quả.`;
        const task = `Hỗ trợ người dùng giải quyết vấn đề, trả lời câu hỏi hoặc phân tích dữ liệu đầu vào.`;
        const instruction = this.buildSystemInstruction(role, task, pref);

        // Context Injection Technique
        let prompt = `YÊU CẦU CỦA TÔI:\n"${message}"\n\n`;
        
        if (context) {
            prompt = `THÔNG TIN BỐI CẢNH (CONTEXT - ƯU TIÊN SỬ DỤNG):\n"""\n${context}\n"""\n\n` + prompt;
        }
        
        if (files && files.length > 0) {
            const fileNames = files.map(f => f.fileName).join(', ');
            prompt = `(Tôi có gửi kèm ${files.length} file: ${fileNames}. Hãy phân tích kỹ nội dung của chúng)\n\n` + prompt;
        }

        return this.tryWithFallback(async (model) => {
            const parts: any[] = [{ text: prompt }];
            
            // Xử lý Multimodal (Ảnh/PDF)
            if (files) {
                files.forEach(file => {
                    parts.push({
                        inlineData: {
                            data: Buffer.from(file.data).toString('base64'),
                            mimeType: file.mimeType
                        }
                    });
                });
            }

            const result = await model.generateContent({
                contents: [{ role: 'user', parts }],
                systemInstruction: instruction,
            });
            return result.response.text();
        }, 'chat', this.fastModel);
    }

    // ➤ SUMMARIZE: Phân tích sâu (Smart Model)
    async summarize(text: string, maxLength: number = 300, pref?: UserPreferences): Promise<string> {
        const role = `Bạn là Chuyên gia Phân tích Dữ liệu và Tổng hợp Thông tin cấp cao.`;
        const task = `Đọc hiểu sâu văn bản, lọc bỏ nhiễu và trích xuất những thông tin giá trị nhất.`;
        const instruction = this.buildSystemInstruction(role, task, pref);

        // Chain of Density Prompt
        const prompt = `
        HÃY TÓM TẮT VĂN BẢN SAU ĐÂY.
        Giới hạn độ dài: Khoảng ${maxLength} từ.
        
        VĂN BẢN GỐC:
        """
        ${text}
        """
        
        YÊU CẦU ĐẦU RA (Bắt buộc định dạng Markdown):
        1. **Tổng quan (Executive Summary)**: Tóm tắt nội dung cốt lõi trong 1 đoạn văn ngắn.
        2. **Điểm nhấn quan trọng (Key Takeaways)**:
           - 📌 [Điểm 1]
           - 📌 [Điểm 2]
           - 📌 [Điểm 3]
        3. **Số liệu/Dữ kiện nổi bật** (nếu có): Liệt kê các con số, ngày tháng, tên riêng quan trọng.
        4. **Kết luận/Ý nghĩa**: Thông điệp chính của văn bản là gì?
        `;

        return this.tryWithFallback(async (model) => {
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                systemInstruction: instruction,
            });
            return result.response.text();
        }, 'summarize', this.smartModel);
    }

    // ➤ CREATE NOTE: Cấu trúc hóa tư duy (Smart Model)
    async createNote(text: string, pref?: UserPreferences): Promise<string> {
        const role = `Bạn là Thư ký Chuyên nghiệp và Chuyên gia Quản lý Tri thức (Knowledge Manager).`;
        const task = `Biến đổi văn bản thô thành hệ thống ghi chú thông minh (Smart Note) có cấu trúc phân cấp, dễ nhớ và dễ tra cứu.`;
        const instruction = this.buildSystemInstruction(role, task, pref);

        const prompt = `
        CHUYỂN ĐỔI VĂN BẢN SAU THÀNH GHI CHÚ (SMART NOTE).
        
        VĂN BẢN NGUỒN:
        """
        ${text}
        """
        
        MẪU ĐỊNH DẠNG GHI CHÚ MONG MUỐN:
        # 📑 [Tiêu đề ghi chú thật thu hút]
        
        ## 🎯 Mục tiêu / Ý chính
        (Tóm tắt mục đích của tài liệu này trong 1 câu)

        ## 📝 Nội dung chi tiết
        ### 1. [Luận điểm chính 1]
        - Chi tiết A...
        - Chi tiết B...
        - *Lưu ý*: ...
        
        ### 2. [Luận điểm chính 2]
        - ...

        ## 💡 Insight & Bài học
        (Những điểm sáng tạo hoặc bài học rút ra)

        ## ✅ Hành động tiếp theo (Action Items)
        - [ ] Việc cần làm 1
        - [ ] Việc cần làm 2
        `;

        return this.tryWithFallback(async (model) => {
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                systemInstruction: instruction,
            });
            return result.response.text();
        }, 'createNote', this.smartModel);
    }

    // ➤ EXPLAIN: Sư phạm & Đơn giản hóa (Smart Model)
    async explain(text: string, pref?: UserPreferences): Promise<string> {
        const role = `Bạn là một Giáo sư uyên bác với khả năng sư phạm tuyệt vời (như Richard Feynman).`;
        const task = `Giải thích các khái niệm phức tạp trở nên đơn giản, dễ hiểu, sử dụng phép ẩn dụ (analogy) thực tế.`;
        const instruction = this.buildSystemInstruction(role, task, pref);

        const prompt = `
        HÃY GIẢI THÍCH NỘI DUNG SAU:
        """
        ${text}
        """
        
        QUY TRÌNH GIẢI THÍCH:
        1. **Định nghĩa đơn giản (ELI5)**: Giải thích như thể đang nói với một người mới bắt đầu (tránh thuật ngữ chuyên ngành nếu không cần thiết).
        2. **Ví dụ minh họa (Analogy)**: "Hãy tưởng tượng nó giống như..." (Sử dụng so sánh thực tế để dễ hình dung).
        3. **Phân tích sâu ("Under the hood")**: Giải thích cơ chế hoạt động hoặc nguyên lý cốt lõi.
        4. **Tại sao nó quan trọng?**: Ứng dụng của nó trong thực tế là gì?
        `;

        return this.tryWithFallback(async (model) => {
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                systemInstruction: instruction,
            });
            return result.response.text();
        }, 'explain', this.smartModel);
    }

    // ➤ IMPROVE WRITING: Biên tập viên (Smart Model)
    async improveWriting(text: string, style: string = 'professional', pref?: UserPreferences): Promise<string> {
        const role = `Bạn là Tổng biên tập (Editor-in-Chief) của một tạp chí danh tiếng.`;
        const task = `Biên tập lại văn bản, nâng cấp từ vựng, cải thiện cấu trúc câu nhưng giữ nguyên ý nghĩa gốc.`;
        const instruction = this.buildSystemInstruction(role, task, pref);

        const prompt = `
        YÊU CẦU BIÊN TẬP:
        - Phong cách mục tiêu: **${style.toUpperCase()}**
        - Nhiệm vụ: Sửa lỗi ngữ pháp, thay thế từ ngữ nhàm chán bằng từ ngữ đắt giá, làm mượt câu văn (Flow).
        
        VĂN BẢN GỐC:
        """
        ${text}
        """
        
        OUTPUT:
        Chỉ cung cấp phiên bản đã viết lại hoàn chỉnh.
        `;

        return this.tryWithFallback(async (model) => {
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                systemInstruction: instruction,
            });
            return result.response.text();
        }, 'improveWriting', this.smartModel);
    }

    // ➤ TRANSLATE: Bản địa hóa (Fast Model)
    async translate(text: string, targetLang: string, pref?: UserPreferences): Promise<string> {
        const role = `Bạn là Dịch giả Cao cấp và Chuyên gia Bản địa hóa (Localization Expert).`;
        const task = `Dịch thuật chính xác, tự nhiên, chuyển tải đúng sắc thái văn hóa và ngữ cảnh. Không dịch từng từ (word-by-word).`;
        const instruction = this.buildSystemInstruction(role, task, pref);

        const prompt = `
        HÃY DỊCH VĂN BẢN SAU SANG NGÔN NGỮ: **${targetLang}**
        
        VĂN BẢN GỐC:
        """
        ${text}
        """
        
        YÊU CẦU:
        - Giữ nguyên các thuật ngữ chuyên ngành (nếu không có từ tương đương chuẩn).
        - Giữ nguyên định dạng (nếu có).
        - Văn phong tự nhiên như người bản xứ.
        `;

        return this.tryWithFallback(async (model) => {
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                systemInstruction: instruction,
            });
            return result.response.text();
        }, 'translate', this.fastModel);
    }
}

export const geminiService = new GeminiService();