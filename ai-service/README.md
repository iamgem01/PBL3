# AI Service Backend

Backend service tích hợp Google Gemini API cho ứng dụng SmartNotes.

## Tính năng

- 💬 Chat với AI
- 📝 Tóm tắt văn bản
- 📋 Tạo ghi chú có cấu trúc
- 🔍 Giải thích văn bản
- ✨ Cải thiện văn phong

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

3. Cấu hình `.env`:
```
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
CORS_ORIGIN=http://localhost:5173
```

## Chạy ứng dụng

### Development mode:
```bash
npm run dev
```

### Production mode:
```bash
npm run build
npm start
```

## API Endpoints

### POST `/api/chat/message`
Gửi tin nhắn chat với AI

**Request body:**
```json
{
  "message": "Xin chào",
  "action": "chat", // chat | summarize | note | explain | improve
  "context": "optional context"
}
```

### POST `/api/chat/summarize`
Tóm tắt văn bản

**Request body:**
```json
{
  "text": "Văn bản cần tóm tắt...",
  "maxLength": 200
}
```

### POST `/api/chat/note`
Tạo ghi chú từ văn bản

**Request body:**
```json
{
  "text": "Nội dung cần tạo ghi chú..."
}
```

### POST `/api/chat/explain`
Giải thích văn bản

**Request body:**
```json
{
  "text": "Nội dung cần giải thích..."
}
```

### POST `/api/chat/improve`
Cải thiện văn phong

**Request body:**
```json
{
  "text": "Văn bản cần cải thiện...",
  "style": "professional" // formal | casual | academic | professional
}
```

## Validation

Tất cả các endpoint đều có validation đầu vào:
- Kiểm tra độ dài văn bản
- Kiểm tra định dạng dữ liệu
- Trả về lỗi chi tiết nếu không hợp lệ

