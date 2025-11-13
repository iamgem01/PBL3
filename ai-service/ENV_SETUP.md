# Hướng dẫn cấu hình môi trường

## Tạo file .env

Tạo file `.env` trong thư mục `ai-service/back-end/` với nội dung sau:

```
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
CORS_ORIGIN=http://localhost:5173
```

## Lấy Google Gemini API Key

1. Truy cập https://aistudio.google.com/
2. Đăng nhập bằng tài khoản Google
3. Vào phần "Get API key": https://aistudio.google.com/app/apikey
4. Tạo API key mới hoặc sử dụng key hiện có
5. Copy và paste vào file `.env` thay cho `your_gemini_api_key_here`

## Cấu hình Model

- `GEMINI_MODEL` (tùy chọn): Mặc định là `gemini-1.5-flash`
- Các model khả dụng:
  - `gemini-1.5-flash` (mặc định, nhanh và hiệu quả)
  - `gemini-1.5-pro` (mạnh hơn, chậm hơn)
  - `gemini-pro` (phiên bản cũ)

## Cấu hình CORS

Nếu frontend chạy trên port khác, cập nhật `CORS_ORIGIN` trong file `.env` cho phù hợp.

Ví dụ:
- Frontend chạy trên port 3000: `CORS_ORIGIN=http://localhost:3000`
- Frontend chạy trên port 5173 (Vite mặc định): `CORS_ORIGIN=http://localhost:5173`

