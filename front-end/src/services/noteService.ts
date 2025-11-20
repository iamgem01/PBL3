import { handleResponse, NOTE_SERVICE_URL } from './utils';

/**
 * Lấy tất cả các ghi chú từ server.
 */
export const getAllNotes = async () => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/notes`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  return handleResponse(response);
};

/**
 * Lấy một ghi chú cụ thể bằng ID của nó.
 */
export const getNoteById = async (id: string) => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/notes/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  return handleResponse(response);
};

/**
 * Tạo một ghi chú mới.
 */
export const createNote = async (noteData: any, userId: string = 'user_001') => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId,
    },
    credentials: 'include',
    body: JSON.stringify(noteData),
  });

  return handleResponse(response);
};

/**
 * Cập nhật một ghi chú.
 */
export const updateNote = async (id: string, noteData: any) => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/notes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(noteData),
  });

  return handleResponse(response);
};

/**
 * Lấy lịch sử của một ghi chú.
 */
export const getNoteHistory = async (id: string) => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/notes/${id}/history`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  return handleResponse(response);
};

/**
 * Khôi phục ghi chú từ lịch sử.
 */
export const restoreNoteFromHistory = async (id: string, historyId: string) => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/notes/${id}/restore/${historyId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  return handleResponse(response);
};

/**
 * Lấy danh sách ghi chú quan trọng.
 */
export const getImportantNotes = async (userId: string = 'user_001') => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/notes/important`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId,
    },
    credentials: 'include',
  });

  return handleResponse(response);
};

/**
 * Đánh dấu ghi chú là quan trọng.
 */
export const markAsImportant = async (id: string, userId: string = 'user_001') => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/notes/${id}/important`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId,
    },
    credentials: 'include',
  });

  return handleResponse(response);
};

/**
 * Bỏ đánh dấu quan trọng của ghi chú.
 */
export const removeAsImportant = async (id: string, userId: string = 'user_001') => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/notes/${id}/important`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId,
    },
    credentials: 'include',
  });

  return handleResponse(response);
};

export const getSharedNotes = async (): Promise<any[]> => {
    try {
        const response = await fetch(`${NOTE_SERVICE_URL}/api/notes/shared`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching shared notes:', error);
        throw error;
    }
};

export const shareNote = async (noteId: string, userIds: string[]): Promise<any> => {
    try {
        const response = await fetch(`${NOTE_SERVICE_URL}/api/notes/${noteId}/share`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ userIds }),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error sharing note:', error);
        throw error;
    }
};

export const unshareNote = async (noteId: string): Promise<any> => {
    try {
        const response = await fetch(`${NOTE_SERVICE_URL}/api/notes/${noteId}/unshare`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error unsharing note:', error);
        throw error;
    }
};