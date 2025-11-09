const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export interface ChatMessageRequest {
    message: string;
    action?: 'chat' | 'summarize' | 'note' | 'explain' | 'improve' | 'translate';
    context?: string;
    targetLanguage?: string;
}

export interface ChatMessageResponse {
    status: string;
    data: {
        response: string;
        action: string;
    };
}

export interface SummarizeRequest {
    text: string;
    maxLength?: number;
}

export interface SummarizeResponse {
    status: string;
    data: {
        original: string;
        summary: string;
        maxLength: number;
    };
}

export interface NoteRequest {
    text: string;
}

export interface NoteResponse {
    status: string;
    data: {
        original: string;
        note: string;
    };
}

export interface ExplainRequest {
    text: string;
}

export interface ExplainResponse {
    status: string;
    data: {
        original: string;
        explanation: string;
    };
}

export interface ImproveRequest {
    text: string;
    style?: 'formal' | 'casual' | 'academic' | 'professional';
}

export interface ImproveResponse {
    status: string;
    data: {
        original: string;
        improved: string;
        style: string;
    };
}

export interface TranslateRequest {
    text: string;
    targetLanguage?: string;
}

export interface TranslateResponse {
    status: string;
    data: {
        original: string;
        translated: string;
        targetLanguage: string;
    };
}

class ApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public errors?: Array<{ field: string; message: string }>
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

async function fetchAPI<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new ApiError(
                data.message || 'Có lỗi xảy ra',
                response.status,
                data.errors
            );
        }

        return data;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError('Không thể kết nối đến server. Vui lòng thử lại sau.');
    }
}

export const apiService = {
    /**
     * Gửi tin nhắn chat
     */
    async sendMessage(request: ChatMessageRequest): Promise<ChatMessageResponse> {
        return fetchAPI<ChatMessageResponse>('/chat/message', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    },

    /**
     * Tóm tắt văn bản
     */
    async summarize(request: SummarizeRequest): Promise<SummarizeResponse> {
        return fetchAPI<SummarizeResponse>('/chat/summarize', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    },

    /**
     * Tạo ghi chú
     */
    async createNote(request: NoteRequest): Promise<NoteResponse> {
        return fetchAPI<NoteResponse>('/chat/note', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    },

    /**
     * Giải thích văn bản
     */
    async explain(request: ExplainRequest): Promise<ExplainResponse> {
        return fetchAPI<ExplainResponse>('/chat/explain', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    },

    /**
     * Cải thiện văn phong
     */
    async improveWriting(request: ImproveRequest): Promise<ImproveResponse> {
        return fetchAPI<ImproveResponse>('/chat/improve', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    },

    /**
     * Dịch thuật văn bản
     */
    async translate(request: TranslateRequest): Promise<TranslateResponse> {
        return fetchAPI<TranslateResponse>('/chat/translate', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    },
};

export { ApiError };

