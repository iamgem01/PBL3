export interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    isImportant?: boolean;
    shares?: any[]; 
  }
  
  export interface ToolbarPosition {
    x: number;
    y: number;
  }