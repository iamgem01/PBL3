import type { Item } from "../types/Item";
import { recentlyVisited, upcomingEvents } from "./mockData";
import { getAuthHeaders } from '@/utils/authUtils';

export async function fetchItemsByCategory(category: string): Promise<Item[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      switch (category) {
        case "recent":
          resolve(recentlyVisited);
          break;
        case "learn":
          resolve([]);
          break;
        case "event":
          resolve(upcomingEvents);
          break;
        default:
          resolve([]);
      }
    }, 400);
  });
}

const API_BASE_URL =
  import.meta.env.VITE_API_GATEWAY_URL || "http://localhost:8000";

export interface UserPreferences {
  tone?: 'professional' | 'casual' | 'friendly' | 'technical';
  responseLength?: 'concise' | 'detailed' | 'comprehensive';
  expertise?: 'beginner' | 'intermediate' | 'expert';
}

export interface ChatMessageRequest {
  message: string;
  action?: "chat" | "summarize" | "note" | "explain" | "improve" | "translate";
  context?: string;
  targetLanguage?: string;
  files?: File[];
  preferences?: UserPreferences;
  sessionId?: string;
  userId?: string;
}

export interface ChatMessageResponse {
  status: string;
  data: {
    response: string;
    action: string;
    sessionId: string;
    timestamp: string;
    metadata?: any;
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
  style?: "formal" | "casual" | "academic" | "professional";
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

export interface DefaultPreferencesResponse {
  status: string;
  data: {
    defaultPreferences: UserPreferences;
  };
}

export interface SessionDataResponse {
  status: string;
  data: {
    sessionId: string;
    context?: string;
    files: Array<{
      fileName: string;
      mimeType: string;
      size: number;
    }>;
    lastAccessed: Date;
    metadata: {
      userId?: string;
      action?: string;
    };
  };
}

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

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = { 
    ...getAuthHeaders(),
    ...options.headers
  };

  if(!(options.body instanceof FormData)) {
    (headers as any)["Content-Type"] = "application/json";
  }

  const config: RequestInit = {
    ...options,
    credentials: "include", // QUAN TRỌNG: Luôn gửi cookie SESSION_TOKEN
    headers: headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (response.status === 401) {
        throw new ApiError("Unauthorized", 401);
    }

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
    throw new ApiError("Không thể kết nối đến server. Vui lòng thử lại sau.");
  }
}
// API SERVICE FOR CHAT AI 
export const apiService = {
  async sendMessage(request: ChatMessageRequest): Promise<ChatMessageResponse> {
    const formData = new FormData();
    
    const messageText = request.message?.trim() || '';
    if (!messageText && (!request.files || request.files.length === 0)) {
      throw new ApiError('Message or files are required', 400);
    }
    
    formData.append('message', messageText);

    if (request.action) {
      formData.append('action', request.action);
    }

    // 🔥 Gửi sessionId nếu có
    if (request.sessionId) {
      formData.append('sessionId', request.sessionId);
      console.log('📌 Using existing sessionId:', request.sessionId);
    }

    if (request.userId) {
      formData.append('userId', request.userId);
    }

    // 🔥 CHỈ gửi context nếu được chỉ định
    if (request.context) {
      formData.append('context', request.context);
      console.log('📝 Sending context (length):', request.context.length);
    }

    if (request.targetLanguage) {
      formData.append('targetLanguage', request.targetLanguage);
    }

    if (request.preferences) {
      formData.append('preferences', JSON.stringify(request.preferences));
    }

    // 🔥 CHỈ gửi files nếu có
    if (request.files && request.files.length > 0) {
      request.files.forEach((file) => {
        formData.append('files', file);
      });
      console.log('📎 Sending files:', request.files.length);
    }

    const url = `${API_BASE_URL}/api/chat/message`;

    console.log('📤 Sending FormData:', {
      message: messageText.substring(0, 50) + (messageText.length > 50 ? '...' : ''),
      action: request.action,
      hasContext: !!request.context,
      hasPreferences: !!request.preferences,
      hasSessionId: !!request.sessionId,
      filesCount: request.files?.length || 0
    });

    // Lấy headers xác thực nhưng PHẢI xóa Content-Type
    // để trình duyệt tự động set multipart/form-data kèm boundary
    const headers = { ...getAuthHeaders() } as Record<string, string>;
    if (headers['Content-Type']) {
      delete headers['Content-Type'];
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: headers,
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('❌ Failed to parse response:', parseError);
        throw new ApiError("Server trả về dữ liệu không hợp lệ", response.status);
      }

      if (!response.ok) {
        console.error('❌ Server error response:', data);
        throw new ApiError(
          data.message || "Có lỗi xảy ra",
          response.status,
          data.errors
        );
      }

      console.log('✅ Response received:', {
        status: data.status,
        sessionId: data.data.sessionId,
        responseLength: data.data.response?.length || 0
      });

      return data;
    } catch (error) {
      console.error('❌ Request failed:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Không thể kết nối đến server. Vui lòng thử lại sau.");
    }
  },

  async getSessionData(sessionId: string): Promise<SessionDataResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/session/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.message || "Không thể lấy thông tin session",
          response.status
        );
      }

      console.log('✅ Session data retrieved:', {
        sessionId: data.data.sessionId,
        hasContext: !!data.data.context,
        filesCount: data.data.files?.length || 0
      });

      return data;
    } catch (error) {
      console.error('❌ Failed to get session data:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Không thể lấy thông tin session");
    }
  },

  async getDefaultPreferences(): Promise<DefaultPreferencesResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/preferences`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (response.status === 404) {
        console.log('ℹ️ Preferences endpoint not available, using defaults');
        return {
          status: 'success',
          data: {
            defaultPreferences: {
              tone: 'professional',
              responseLength: 'detailed',
              expertise: 'intermediate'
            }
          }
        };
      }

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.message || "Có lỗi xảy ra",
          response.status
        );
      }

      return data;
    } catch (error) {
      console.log('ℹ️ Using default preferences due to error:', error instanceof ApiError ? error.message : 'Network error');
      return {
        status: 'success',
        data: {
          defaultPreferences: {
            tone: 'professional',
            responseLength: 'detailed',
            expertise: 'intermediate'
          }
        }
      };
    }
  },

  async summarize(request: SummarizeRequest): Promise<SummarizeResponse> {
    return fetchAPI<SummarizeResponse>("/api/chat/summarize", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  async createNote(request: NoteRequest): Promise<NoteResponse> {
    return fetchAPI<NoteResponse>("/api/chat/note", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  async explain(request: ExplainRequest): Promise<ExplainResponse> {
    return fetchAPI<ExplainResponse>("/api/chat/explain", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  async improveWriting(request: ImproveRequest): Promise<ImproveResponse> {
    return fetchAPI<ImproveResponse>("/api/chat/improve", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  async translate(request: TranslateRequest): Promise<TranslateResponse> {
    return fetchAPI<TranslateResponse>("/api/chat/translate", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },
};

const USER_SERVICE_URL = import.meta.env.VITE_API_GATEWAY_URL || "http://localhost:8000";

// export const userApi = {
//   async login(email: string, password: string) {
//     const response = await fetch(`${USER_SERVICE_URL}/api/auth/login`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       credentials: 'include',
//       body: JSON.stringify({ email, password }),
//     });
    
//     if (!response.ok) {
//       throw new Error('Login failed');
//     }
    
//     return response.json();
//   },

//   async register(userData: any) {
//     const response = await fetch(`${USER_SERVICE_URL}/api/auth/register`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       credentials: 'include',
//       body: JSON.stringify(userData),
//     });
    
//     if (!response.ok) {
//       throw new Error('Registration failed');
//     }
    
//     return response.json();
//   },

//   async logout() {
//     return fetch(`${USER_SERVICE_URL}/api/auth/logout`, {
//       method: 'POST',
//       credentials: 'include',
//     });
//   },

//   async getProfile() {
//     const response = await fetch(`${USER_SERVICE_URL}/api/auth/profile`, {
//       credentials: 'include',
//     });
    
//     if (!response.ok) {
//       throw new Error('Failed to get profile');
//     }
    
//     return response.json();
//   },
// };

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
    return fetch(`${USER_SERVICE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Gửi cookie để server xóa session
    });
  },

  // Lấy thông tin user hiện tại
  async getProfile() {
    // Endpoint lấy profile của User Service qua Gateway
    const response = await fetch(`${USER_SERVICE_URL}/api/users/me`, {
      method: 'GET',
      credentials: 'include', // BẮT BUỘC: Gửi cookie SESSION_TOKEN
      headers: { ...getAuthHeaders() },
    });
    
    if (!response.ok) {
      throw new Error('Failed to get profile');
    }
    
    return response.json(); // Trả về UserProfileDto
  },
  
  // Helper để lấy URL bắt đầu OAuth2
  getGoogleLoginUrl() {
    return `${USER_SERVICE_URL}/oauth2/authorization/google`;
  }
};

export { ApiError };
