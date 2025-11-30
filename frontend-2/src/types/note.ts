export interface Note {
    id: string;
    title: string;
    content: string;
    contentType: 'markdown' | 'richtext';
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    shares?: any[];
    version?: number;
    metadata?: any;
    tags?: string[];
    isImportant?: boolean;
    isDeleted?: boolean;
  }
  
  export interface NoteShare {
    id: string;
    noteId: string;
    userId: string;
    email: string;
    permission: 'READ' | 'WRITE' | 'ADMIN';
    sharedAt: string;
    sharedBy: string;
  }
  
  export interface NoteHistory {
    id: string;
    noteId: string;
    content: string;
    version: number;
    createdAt: string;
    createdBy: string;
    changes?: string;
  }
  
  export interface NoteComment {
    id: string;
    noteId: string;
    userId: string;
    userName: string;
    userEmail: string;
    content: string;
    position: {
      from: number;
      to: number;
      text: string;
    };
    resolved: boolean;
    createdAt: string;
    updatedAt: string;
    replies?: CommentReply[];
  }
  
  export interface CommentReply {
    id: string;
    commentId: string;
    userId: string;
    userName: string;
    userEmail: string;
    content: string;
    createdAt: string;
  }
  
  export interface CollaborativeUser {
    userId: string;
    name: string;
    email: string;
    color: string;
    cursor?: {
      pos: number;
    };
    selection?: {
      from: number;
      to: number;
    };
    lastActive: number;
  }
  
  export interface DocumentState {
    note: Note | null;
    isLoading: boolean;
    error: string | null;
    isSaving: boolean;
    isCollaborative: boolean;
    connectedUsers: CollaborativeUser[];
    comments: NoteComment[];
    history: NoteHistory[];
  }