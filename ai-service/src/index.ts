import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRouter from "./routes/chat.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

// Environment validation
const requiredEnvVars = ["GEMINI_API_KEY", "PORT", "CORS_ORIGIN"];

const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:");
  missingEnvVars.forEach((varName) => {
    console.error(`   - ${varName}`);
  });
  console.error(
    "\n💡 Please check your .env file and add the missing variables."
  );
  process.exit(1);
}

console.log("✅ All required environment variables are present");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: [
      process.env.CORS_ORIGIN || "http://localhost:5173",
      "http://localhost:3000",  // Thêm dòng này
      "http://localhost:5174"   // Và thêm port khác nếu cần
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use("/api/chat", chatRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "AI Service is running" });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 AI Service Backend running on port ${PORT}`);
});
