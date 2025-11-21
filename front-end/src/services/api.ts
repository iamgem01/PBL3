import type { Item } from "../types/Item";
import { recentlyVisited, upcomingEvents } from "./mockData";

// Giả lập gọi API backend
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
    }, 400); // mô phỏng network delay
  });
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// User Preferences Interface
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
}

export interface ChatMessageResponse {
  status: string;
  data: {
    response: string;
    action: string;
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

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
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
    throw new ApiError("Không thể kết nối đến server. Vui lòng thử lại sau.");
  }
}

export const apiService = {
  /**
   * Gửi tin nhắn chat
   */
  async sendMessage(request: ChatMessageRequest): Promise<ChatMessageResponse> {
    const formData = new FormData();
    
    // Validate message
    const messageText = request.message?.trim() || '';
    if (!messageText && (!request.files || request.files.length === 0)) {
      throw new ApiError('Message or files are required', 400);
    }
    
    formData.append('message', messageText);

    if (request.action) {
      formData.append('action', request.action);
    }

    if (request.context) {
      formData.append('context', request.context);
    }

    if (request.targetLanguage) {
      formData.append('targetLanguage', request.targetLanguage);
    }

    // Thêm preferences
    if (request.preferences) {
      formData.append('preferences', JSON.stringify(request.preferences));
    }

    // Thêm files nếu có
    if (request.files && request.files.length > 0) {
      request.files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const url = `${API_BASE_URL}/chat/message`;

    // Debug: Log what we're sending
    console.log('📤 Sending FormData:', {
      message: messageText.substring(0, 50) + (messageText.length > 50 ? '...' : ''),
      action: request.action,
      hasContext: !!request.context,
      hasPreferences: !!request.preferences,
      filesCount: request.files?.length || 0
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData, // Không set Content-Type, browser sẽ tự set với boundary
      });

      // Try to parse response
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

      return data;
    } catch (error) {
      console.error('❌ Request failed:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Không thể kết nối đến server. Vui lòng thử lại sau.");
    }
  },

  /**
   * Lấy default preferences
   * Returns fallback values if API endpoint doesn't exist
   */
  async getDefaultPreferences(): Promise<DefaultPreferencesResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/preferences`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // If endpoint doesn't exist (404), use fallback
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
      // Silently fallback to default if any error occurs
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

  /**
   * Tóm tắt văn bản
   */
  async summarize(request: SummarizeRequest): Promise<SummarizeResponse> {
    return fetchAPI<SummarizeResponse>("/chat/summarize", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * Tạo ghi chú
   */
  async createNote(request: NoteRequest): Promise<NoteResponse> {
    return fetchAPI<NoteResponse>("/chat/note", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * Giải thích văn bản
   */
  async explain(request: ExplainRequest): Promise<ExplainResponse> {
    return fetchAPI<ExplainResponse>("/chat/explain", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * Cải thiện văn phong
   */
  async improveWriting(request: ImproveRequest): Promise<ImproveResponse> {
    return fetchAPI<ImproveResponse>("/chat/improve", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * Dịch thuật văn bản
   */
  async translate(request: TranslateRequest): Promise<TranslateResponse> {
    return fetchAPI<TranslateResponse>("/chat/translate", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },
};

const USER_SERVICE_URL = import.meta.env.VITE_USER_SERVICE_URL || "http://localhost:5000";

export const userApi = {
  async login(email: string, password: string) {
    const response = await fetch(`${USER_SERVICE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    return response.json();
  },

  async register(userData: any) {
    const response = await fetch(`${USER_SERVICE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error('Registration failed');
    }
    
    return response.json();
  },

  async logout() {
    return fetch(`${USER_SERVICE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  },

  async getProfile() {
    const response = await fetch(`${USER_SERVICE_URL}/api/auth/profile`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to get profile');
    }
    
    return response.json();
  },
};

export { ApiError };