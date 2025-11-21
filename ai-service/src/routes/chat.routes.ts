import { Router } from 'express';
import { chatController, upload } from '../controllers/chat.controller.js';
import { 
    validate, 
    validateFiles,
    chatMessageSchema, 
    summarizeSchema, 
    improveSchema, 
    textProcessingSchema, 
    translateSchema 
} from '../middleware/validation.js';

const router = Router();

// Main chat endpoint với file upload
router.post('/message',
    upload.array('files', 10),
    validateFiles,
    validate(chatMessageSchema),
    chatController.sendMessage
);

// Summarize endpoint
router.post('/summarize', 
    validate(summarizeSchema), 
    chatController.summarize
);

// Create note endpoint
router.post('/note', 
    validate(textProcessingSchema), 
    chatController.createNote
);

// Explain endpoint
router.post('/explain', 
    validate(textProcessingSchema), 
    chatController.explain
);

// Improve writing endpoint
router.post('/improve', 
    validate(improveSchema), 
    chatController.improveWriting
);

// Translate endpoint
router.post('/translate', 
    validate(translateSchema), 
    chatController.translate
);

// Get default preferences endpoint
router.get('/preferences', 
    chatController.getDefaultPreferences
);

export default router;