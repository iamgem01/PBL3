// src/models/session.model.ts
import { Schema, model, Document } from 'mongoose';

export interface IFileData {
  fileName: string;
  mimeType: string;
  size: number;
  content: Buffer;
}

export interface ISession extends Document {
  sessionId: string;
  context?: string;
  files: IFileData[];
  lastAccessed: Date;
  metadata: {
    userId: string; // 🔥 Bắt buộc có userId
    action?: string;
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>({
  sessionId: { type: String, required: true, unique: true, index: true },
  context: { type: String },
  files: [{
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    content: { type: Buffer, required: true }
  }],
  lastAccessed: { type: Date, default: Date.now },
  metadata: {
    userId: { type: String, required: true, index: true },
    action: { type: String },
    createdAt: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

// Tự động xóa session sau 24h không hoạt động
sessionSchema.index({ lastAccessed: 1 }, { expireAfterSeconds: 86400 });

// Index cho hiệu năng truy vấn
sessionSchema.index({ sessionId: 1, 'metadata.userId': 1 });

export const Session = model<ISession>('Session', sessionSchema);