import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRouter from './routes/chat.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/chat', chatRouter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'AI Service is running' });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 AI Service Backend running on port ${PORT}`);
});

