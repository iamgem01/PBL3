# Aeternus — Ứng dụng ghi chú thông minh

**PBL 3** — Ứng dụng ghi chú tích hợp AI, hỗ trợ soạn thảo cộng tác thời gian thực, quản lý lịch/nhắc việc và trợ lý AI (Google Gemini). Dự án được xây dựng theo kiến trúc **microservices**, gồm 1 front-end và 6 backend service độc lập.

## Kiến trúc dự án

```
PBL3/
├── front-end/              # React 19 + TypeScript + Vite (giao diện người dùng)
├── user-service/           # Xác thực & quản lý người dùng (Node.js + Express)
├── note-service/           # Quản lý ghi chú / thư mục / thùng rác (Java Spring Boot)
├── collab-service/         # Soạn thảo cộng tác real-time qua WebSocket + Yjs (Java Spring Boot)
├── calendar-service/       # Lịch & sự kiện, nhắc việc (Node.js + TypeScript)
├── ai-service/              # Trợ lý AI dựa trên Google Gemini (Node.js + TypeScript)
├── notification-service/   # Gửi thông báo / email (Node.js)
├── render.yaml              # Cấu hình triển khai lên Render
└── package.json              # Workspace gốc, script chạy song song các service
```

## Công nghệ sử dụng

| Thành phần | Công nghệ chính |
|---|---|
| Front-end | React 19, TypeScript, Vite, TailwindCSS, Radix UI, TipTap (rich-text editor), Yjs (collaborative editing), React Router |
| User Service | Node.js, Express 5, MongoDB (Mongoose), JWT, Passport (Local + Google OAuth2), bcrypt |
| Note Service | Java 21, Spring Boot 3.5, Spring Data MongoDB, Lombok, Commonmark, OpenHTMLtoPDF (export PDF) |
| Collab Service | Java 21, Spring Boot 3.5, Spring WebSocket, Java-WebSocket (Yjs sync), Spring Mail |
| Calendar Service | Node.js, TypeScript, Express, MongoDB (Mongoose), node-cron (nhắc lịch) |
| AI Service | Node.js, TypeScript, Express, Google Generative AI SDK (Gemini) |
| Notification Service | Node.js, Express, MongoDB, Nodemailer, node-cron |
| Triển khai | Render (Docker cho 2 service Java, Node runtime cho các service còn lại) |

## Tính năng chính

- **Xác thực người dùng**: đăng ký/đăng nhập bằng email hoặc Google OAuth2, JWT.
- **Quản lý ghi chú**: tạo/sửa/xoá ghi chú theo thư mục, thùng rác (soft delete), tìm kiếm, xuất PDF.
- **Cộng tác thời gian thực**: nhiều người cùng chỉnh sửa một ghi chú qua WebSocket (đồng bộ bằng Yjs), mời cộng tác viên qua email.
- **Trợ lý AI**: chat với AI, tóm tắt văn bản, tạo ghi chú có cấu trúc, giải thích và cải thiện văn phong (Google Gemini).
- **Lịch & nhắc việc**: tạo sự kiện, nhắc lịch tự động.
- **Thông báo**: gửi email thông báo cho người dùng.

## Yêu cầu môi trường

- Node.js ≥ 18, npm
- Java 21, Maven
- MongoDB (local hoặc Atlas)
- Google Client ID/Secret (đăng nhập Google) và Gemini API Key (cho ai-service)

## Cài đặt & chạy dự án

### 1. Clone dự án

```bash
git clone https://github.com/iamgem01/PBL3.git
cd PBL3
```

### 2. Cài đặt dependencies

```bash
npm install
```

Lệnh trên cài cho các workspace Node ở gốc (`user-service`, `front-end`, `ai-service`). Với `calendar-service` và `notification-service`, vào từng thư mục và chạy `npm install` riêng. Với hai service Java (`note-service`, `collab-service`), Maven sẽ tự tải dependency khi build/chạy (`mvn spring-boot:run`).

### 3. Cấu hình biến môi trường

Mỗi service dùng file `.env` riêng (tham khảo `.env.example` nếu có, ví dụ `user-service/.env.example`). Các biến quan trọng cần cấu hình:

- **user-service**: `MONGODB_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `PORT` (mặc định 5000)
- **calendar-service**: `MONGODB_URI`, `PORT` (mặc định 5003)
- **ai-service**: `GEMINI_API_KEY`, `GEMINI_MODEL`, `MONGODB_URI`, `PORT` (mặc định 3000/3001)
- **notification-service**: `MONGODB_URI`, cấu hình SMTP, `PORT` (mặc định 5004)
- **note-service** (`application.properties`): `spring.data.mongodb.uri`, `server.port` (mặc định 8082)
- **collab-service** (`application.properties`): `spring.data.mongodb.uri`, `note.service.url`, `GMAIL_APP_PASSWORD`, `server.port` (mặc định 8083)

### 4. Chạy từng service riêng lẻ

```bash
npm run dev:user-service          # http://localhost:5000
npm run dev:front-end             # http://localhost:5173
npm run dev:ai-service
npm run dev:calendar-service      # http://localhost:5003
npm run dev:notification-service  # http://localhost:5004
npm run dev:note-service          # http://localhost:8082 (yêu cầu Maven)
npm run dev:collab-service        # http://localhost:8083 (yêu cầu Maven)
```

### 5. Hoặc chạy toàn bộ cùng lúc

```bash
npm run dev:all
```

## Triển khai

Dự án có sẵn cấu hình `render.yaml` để triển khai từng service lên [Render](https://render.com): các service Node dùng runtime `node`, hai service Java (`note-service`, `collab-service`) build bằng Docker (`Dockerfile` trong từng thư mục).

## Đóng góp

Đây là đồ án học phần PBL3. Pull request/issue có thể gửi trực tiếp trên repository.
