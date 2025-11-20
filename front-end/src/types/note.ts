export interface Note {
    id: string;
    folderId: string;
    title: string;
    content: string;
    contentType?: string; // default "markdown"
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    version?: number; // default 1
    shares?: any[];
    metadata?: any;
    tags?: string[];
    isImportant?: boolean; // default false
    isDeleted?: boolean; // default false
    deletedAt?: string;
}

export interface NoteRequest {
    title: string;
    content: string;
    folderId: string;
}

export interface NoteResponse extends Note {
    // Additional response fields if needed
}
