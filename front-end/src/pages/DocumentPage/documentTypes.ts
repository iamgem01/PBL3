export interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    isImportant?: boolean;
  }
  
  export interface ToolbarPosition {
    x: number;
    y: number;
  }