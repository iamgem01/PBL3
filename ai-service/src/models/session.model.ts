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
    userId?: string;
    action?: string;
  };
}

const sessionSchema = new Schema<ISession>({
  sessionId: { type: String, required: true, unique: true, index: true },
  context: { type: String },
  files: [{
    fileName: String,
    mimeType: String,
    size: Number,
    content: Buffer
  }],
  lastAccessed: { type: Date, default: Date.now },
  metadata: {
    userId: { type: String, index: true },
    action: String
  }
}, {
  timestamps: true
});

// Tự động xóa session sau 24h không hoạt động
sessionSchema.index({ lastAccessed: 1 }, { expireAfterSeconds: 86400 });

export const Session = model<ISession>('Session', sessionSchema);