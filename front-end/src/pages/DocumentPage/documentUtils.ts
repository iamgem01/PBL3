export const formatDate = (dateString: string): string => {
  if (!dateString || dateString === null || dateString === undefined || dateString === '') {
    return new Date().toLocaleString();
  }
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleString();
  } catch {
    return 'Invalid date';
  }
};

export const generateUserColor = (userId: string): string => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'];
  const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

export const calculateWordCount = (content: string): number => {
  if (!content) return 0;
  return content.trim() ? content.trim().split(/\s+/).length : 0;
};

export const calculateCharacterCount = (content: string): number => {
  return content ? content.length : 0;
};

export const calculateLineCount = (content: string): number => {
  if (!content) return 0;
  return content.split('\n').length;
};

export const extractTextSelection = (content: string, start: number, end: number): string => {
  if (!content || start < 0 || end > content.length || start >= end) {
    return '';
  }
  return content.substring(start, end);
};

// Fix: Proper TypeScript type for debounce
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const sanitizeContent = (content: string): string => {
  // Basic sanitization for HTML content
  return content
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const isContentModified = (original: string, current: string): boolean => {
  return original !== current;
};

export const getDocumentStats = (content: string) => {
  return {
    words: calculateWordCount(content),
    characters: calculateCharacterCount(content),
    lines: calculateLineCount(content),
  };
};

// Type definitions for better TypeScript support
export interface DocumentStats {
  words: number;
  characters: number;
  lines: number;
}

export interface UserPresence {
  id: string;
  name: string;
  email: string;
  color: string;
  cursor?: { pos: number };
  selection?: { from: number; to: number };
  lastActive: number;
}