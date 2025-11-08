import { Router } from 'express';
import { chatController } from '../controllers/chat.controller.js';
import { validate, chatMessageSchema, summarizeSchema, improveSchema, textProcessingSchema } from '../middleware/validation.js';

const router = Router();

// Chat endpoint
router.post('/message', validate(chatMessageSchema), chatController.sendMessage);

// Summarize endpoint
router.post('/summarize', validate(summarizeSchema), chatController.summarize);

// Create note endpoint
router.post('/note', validate(textProcessingSchema), chatController.createNote);

// Explain endpoint
router.post('/explain', validate(textProcessingSchema), chatController.explain);

// Improve writing endpoint
router.post('/improve', validate(improveSchema), chatController.improveWriting);

export default router;

