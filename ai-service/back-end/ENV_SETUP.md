# Hướng dẫn cấu hình môi trường

## Tạo file .env

Tạo file `.env` trong thư mục `ai-service/back-end/` với nội dung sau:

```
PORT=3001
OPENAI_API_KEY=your_openai_api_key_here
CORS_ORIGIN=http://localhost:5173
```

## Lấy OpenAI API Key

1. Truy cập https://platform.openai.com/
2. Đăng nhập hoặc tạo tài khoản
3. Vào phần API Keys: https://platform.openai.com/api-keys
4. Tạo API key mới
5. Copy và paste vào file `.env` thay cho `your_openai_api_key_here`

## Cấu hình CORS

Nếu frontend chạy trên port khác, cập nhật `CORS_ORIGIN` trong file `.env` cho phù hợp.

Ví dụ:
- Frontend chạy trên port 3000: `CORS_ORIGIN=http://localhost:3000`
- Frontend chạy trên port 5173 (Vite mặc định): `CORS_ORIGIN=http://localhost:5173`

