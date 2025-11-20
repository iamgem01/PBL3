import type { Item } from "../types/Item";
import { recentlyVisited, upcomingEvents } from "./mockData";

// --- CẤU HÌNH API GATEWAY ---
// Mọi request đều phải đi qua Kong (Port 8000)
const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || "http://localhost:8000";

// --- CÁC INTERFACE GIỮ NGUYÊN ---
export interface ChatMessageRequest {
  message: string;
  action?: "chat" | "summarize" | "note" | "explain" | "improve" | "translate";
  context?: string;
  targetLanguage?: string;
}
// ... (Giữ nguyên các interface Chat/Note/Summarize khác của bạn) ...
export interface ChatMessageResponse {
  status: string;
  data: { response: string; action: string; };
}
export interface SummarizeRequest { text: string; maxLength?: number; }
export interface SummarizeResponse { status: string; data: { original: string; summary: string; maxLength: number; }; }
export interface NoteRequest { text: string; }
export interface NoteResponse { status: string; data: { original: string; note: string; }; }
export interface ExplainRequest { text: string; }
export interface ExplainResponse { status: string; data: { original: string; explanation: string; }; }
export interface ImproveRequest { text: string; style?: "formal" | "casual" | "academic" | "professional"; }
export interface ImproveResponse { status: string; data: { original: string; improved: string; style: string; }; }
export interface TranslateRequest { text: string; targetLanguage?: string; }
export interface TranslateResponse { status: string; data: { original: string; translated: string; targetLanguage: string; }; }

// Class xử lý lỗi
class ApiError extends Error {
  statusCode?: number;
  errors?: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    statusCode?: number,
    errors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

// Hàm fetch chung (đã cấu hình credentials để gửi Cookie)
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Endpoint backend AI/Chat cũng đi qua Gateway
  const url = `${API_GATEWAY_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    credentials: "include", // QUAN TRỌNG: Luôn gửi cookie SESSION_TOKEN
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // Xử lý trường hợp 401 (Unauthorized) chung cho toàn app
    if (response.status === 401) {
        throw new ApiError("Unauthorized", 401);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || "Có lỗi xảy ra",
        response.status,
        data.errors
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
  }
}

// --- API SERVICE CHO CHAT/AI ---
export const apiService = {
  async sendMessage(request: ChatMessageRequest): Promise<ChatMessageResponse> {
    return fetchAPI<ChatMessageResponse>("/api/ai/message", { // Giả định route AI
      method: "POST",
      body: JSON.stringify(request),
    });
  },
  // ... (Các hàm summarize, createNote giữ nguyên logic nhưng dùng fetchAPI đã sửa)
  async summarize(request: SummarizeRequest): Promise<SummarizeResponse> {
    return fetchAPI<SummarizeResponse>("/api/ai/summarize", { method: "POST", body: JSON.stringify(request) });
  },
  async createNote(request: NoteRequest): Promise<NoteResponse> {
    return fetchAPI<NoteResponse>("/api/ai/note", { method: "POST", body: JSON.stringify(request) });
  },
  async explain(request: ExplainRequest): Promise<ExplainResponse> {
    return fetchAPI<ExplainResponse>("/api/ai/explain", { method: "POST", body: JSON.stringify(request) });
  },
  async improveWriting(request: ImproveRequest): Promise<ImproveResponse> {
    return fetchAPI<ImproveResponse>("/api/ai/improve", { method: "POST", body: JSON.stringify(request) });
  },
  async translate(request: TranslateRequest): Promise<TranslateResponse> {
    return fetchAPI<TranslateResponse>("/api/ai/translate", { method: "POST", body: JSON.stringify(request) });
  },
};

// --- USER API (ĐÃ SỬA CHO USER-SERVICE) ---
export const userApi = {
  // User Service hiện tại KHÔNG hỗ trợ đăng nhập password, chỉ hỗ trợ OAuth2
  // Hàm này có thể bỏ hoặc giữ để placeholder
  async login(email: string, password: string) {
    throw new Error("Vui lòng sử dụng đăng nhập bằng Google");
  },

  async register(userData: any) {
    throw new Error("Vui lòng sử dụng đăng ký bằng Google");
  },

  // Đăng xuất: Gọi API logout của User Service
  async logout() {
    // Endpoint logout của User Service qua Gateway
    return fetch(`${API_GATEWAY_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Gửi cookie để server xóa session
    });
  },

  // Lấy thông tin user hiện tại
  async getProfile() {
    // Endpoint lấy profile của User Service qua Gateway
    const response = await fetch(`${API_GATEWAY_URL}/api/users/me`, {
      method: 'GET',
      credentials: 'include', // BẮT BUỘC: Gửi cookie SESSION_TOKEN
    });
    
    if (!response.ok) {
      throw new Error('Failed to get profile');
    }
    
    return response.json(); // Trả về UserProfileDto
  },
  
  // Helper để lấy URL bắt đầu OAuth2
  getGoogleLoginUrl() {
    return `${API_GATEWAY_URL}/oauth2/authorization/google`;
  }
};

export { ApiError };

// Mock data fetcher (Giữ nguyên)
export async function fetchItemsByCategory(category: string): Promise<Item[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      switch (category) {
        case "recent": resolve(recentlyVisited); break;
        case "event": resolve(upcomingEvents); break;
        default: resolve([]);
      }
    }, 400);
  });
}