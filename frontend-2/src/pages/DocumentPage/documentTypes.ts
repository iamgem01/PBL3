export interface Note {
  id: string;
  title: string;
  content: string;
  contentType: 'markdown' | 'richtext';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isImportant?: boolean;
  shares?: any[];
  version?: number;
  metadata?: any;
  tags?: string[];
  isDeleted?: boolean;
}

export interface ToolbarPosition {
  x: number;
  y: number;
}

export interface SelectionRange {
  userId: string;
  userName: string;
  start: number;
  end: number;
  color: string;
}

export interface ActiveUser {
  userId: string;
  email: string;
  name: string;
  color: string;
  cursorPosition?: number;
  selection?: {
    start: number;
    end: number;
  };
}

export interface CommentThread {
  id: string;
  noteId: string;
  position: {
    from: number;
    to: number;
    text: string;
  };
  comments: Comment[];
  resolved: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentMetadata {
  wordCount: number;
  characterCount: number;
  lineCount: number;
  lastSaved: string;
  collaborators: number;
}