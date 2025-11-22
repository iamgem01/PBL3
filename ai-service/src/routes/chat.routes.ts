import { Router } from "express";
import { chatController, upload } from "../controllers/chat.controller.js";
import {
  validate,
  validateFiles,
  chatMessageSchema,
  summarizeSchema,
  improveSchema,
  textProcessingSchema,
  translateSchema,
} from "../middleware/validation.js";
import { connectDB } from "../utils/db.js";

const router = Router();

// Kết nối database
router.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error("Database connection error:", errorMessage);
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      error: process.env.NODE_ENV === "development" ? errorMessage : undefined,
    });
  }
});

// Session endpoints
router.get("/session/:sessionId", chatController.getSessionData);

// Main chat endpoint với file upload
router.post(
  "/message",
  upload.array("files", 10),
  validateFiles,
  validate(chatMessageSchema),
  chatController.sendMessage
);

// Summarize endpoint
router.post("/summarize", validate(summarizeSchema), chatController.summarize);

// Create note endpoint
router.post(
  "/note",
  upload.array("files", 10),
  validateFiles,
  validate(textProcessingSchema),
  chatController.createNote
);

// Explain endpoint
router.post(
  "/explain",
  upload.array("files", 10),
  validateFiles,
  validate(textProcessingSchema),
  chatController.explain
);

// Improve writing endpoint
router.post(
  "/improve",
  upload.array("files", 10),
  validateFiles,
  validate(improveSchema),
  chatController.improveWriting
);

// Translate endpoint
router.post(
  "/translate",
  upload.array("files", 10),
  validateFiles,
  validate(translateSchema),
  chatController.translate
);

// Get default preferences endpoint
router.get("/preferences", chatController.getDefaultPreferences);

export default router;
