# AI Service - SmartNotes

Service tích hợp ChatGPT/OpenAI cho ứng dụng SmartNotes với các tính năng:
- 💬 Chat với AI
- 📝 Tóm tắt văn bản
- 📋 Tạo ghi chú có cấu trúc
- 🔍 Giải thích văn bản
- ✨ Cải thiện văn phong

## Cấu trúc dự án

```
ai-service/
├── back-end/          # Backend Node.js/Express với TypeScript
│   ├── src/
│   │   ├── controllers/   # Controllers xử lý request
│   │   ├── middleware/     # Validation và error handling
│   │   ├── routes/         # API routes
│   │   ├── services/       # OpenAI service
│   │   └── index.ts        # Entry point
│   └── package.json
└── front-end/         # Frontend React với TypeScript
    ├── src/
    │   ├── components/     # UI components
    │   ├── pages/          # Pages
    │   ├── services/       # API service
    │   └── ...
    └── package.json
```

## Cài đặt và chạy

### Backend

1. Di chuyển vào thư mục backend:
```bash
cd ai-service/back-end
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file `.env` (xem `ENV_SETUP.md` để biết chi tiết):
```env
PORT=3001
OPENAI_API_KEY=your_openai_api_key_here
CORS_ORIGIN=http://localhost:5173
```

4. Chạy backend:
```bash
# Development mode
npm run dev

# Production mode
npm run build && npm start
```

Backend sẽ chạy trên `http://localhost:3001`

### Frontend

1. Di chuyển vào thư mục frontend:
```bash
cd ai-service/front-end
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file `.env` (tùy chọn):
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

4. Chạy frontend:
```bash
npm run dev
```

Frontend sẽ chạy trên `http://localhost:5173` (hoặc port khác nếu 5173 đã được sử dụng)

## API Endpoints

### POST `/api/chat/message`
Gửi tin nhắn chat với AI

**Request:**
```json
{
  "message": "Xin chào",
  "action": "chat",
  "context": "optional context"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "response": "Xin chào! Tôi có thể giúp gì cho bạn?",
    "action": "chat"
  }
}
```

### POST `/api/chat/summarize`
Tóm tắt văn bản

**Request:**
```json
{
  "text": "Văn bản cần tóm tắt...",
  "maxLength": 200
}
```

### POST `/api/chat/note`
Tạo ghi chú từ văn bản

**Request:**
```json
{
  "text": "Nội dung cần tạo ghi chú..."
}
```

### POST `/api/chat/explain`
Giải thích văn bản

**Request:**
```json
{
  "text": "Nội dung cần giải thích..."
}
```

### POST `/api/chat/improve`
Cải thiện văn phong

**Request:**
```json
{
  "text": "Văn bản cần cải thiện...",
  "style": "professional"
}
```

## Validation

Tất cả các endpoint đều có validation đầu vào:
- ✅ Kiểm tra độ dài văn bản
- ✅ Kiểm tra định dạng dữ liệu
- ✅ Trả về lỗi chi tiết nếu không hợp lệ

## Lưu ý

- Cần có OpenAI API Key để sử dụng. Xem `back-end/ENV_SETUP.md` để biết cách lấy API key.
- Backend và Frontend cần chạy đồng thời.
- Đảm bảo CORS_ORIGIN trong backend khớp với URL frontend.

