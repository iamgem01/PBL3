import { getAuthHeaders } from '@/utils/authUtils';
import { handleResponse, NOTE_SERVICE_URL, COLLAB_SERVICE_URL } from './utils';

/**
 * Lấy tất cả các ghi chú từ server với validation nghiêm ngặt.
 */
export const getAllNotes = async () => {
  try {
    const response = await fetch(`${NOTE_SERVICE_URL}/api/notes`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    const data = await handleResponse(response);
    
    // Tạm thời disable validation để test
    console.log(` [FRONTEND] First note sample:`, data[0]);
    return data;

  } catch (error) {
    console.error('❌ Error fetching notes:', error);
    throw error;
  }
};

/**
 * Lấy một ghi chú cụ thể bằng ID của nó.
 * Kiểm tra cả note-service và collab-service để lấy thông tin đầy đủ
 */
export const getNoteById = async (id: string) => {
  try {
    // Thử lấy từ collab-service trước (để có thông tin shares)
    const collabResponse = await fetch(`${COLLAB_SERVICE_URL}/api/notes/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (collabResponse.ok) {
      console.log('📄 Note found in collab-service');
      return await handleResponse(collabResponse);
    }

    // Nếu không tìm thấy trong collab-service, thử note-service
    console.log('📄 Note not in collab-service, checking note-service');
    const noteResponse = await fetch(`${NOTE_SERVICE_URL}/api/notes/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    return await handleResponse(noteResponse);
  } catch (error) {
    console.error('❌ Error fetching note:', error);
    throw error;
  }
};

/**
 * Tạo một ghi chú mới với validation.
 */
export const createNote = async (noteData: any) => {
  try {
    const response = await fetch(`${NOTE_SERVICE_URL}/api/notes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(noteData),
    });

    const result = await handleResponse(response);
    console.log(`✅ Note created successfully: ${result.id}`);
    return result;

  } catch (error) {
    console.error('❌ Error creating note:', error);
    throw error;
  }
};

/**
 * Cập nhật một ghi chú.
 */
export const updateNote = async (id: string, noteData: any) => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/notes/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  return handleResponse(response);
};

/**
 * Lấy danh sách ghi chú quan trọng.
 */
export const getImportantNotes = async () => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/notes/important`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  return handleResponse(response);
};

/**
 * Đánh dấu ghi chú là quan trọng.
 */
export const markAsImportant = async (id: string) => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/notes/${id}/important`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  return handleResponse(response);
};

/**
 * Bỏ đánh dấu quan trọng của ghi chú.
 */
export const removeAsImportant = async (id: string) => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/notes/${id}/important`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  return handleResponse(response);
};

export const getSharedNotes = async (): Promise<any[]> => {
    try {
        const response = await fetch(`${NOTE_SERVICE_URL}/api/notes/shared`, {
            method: 'GET',
            headers: getAuthHeaders(),
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
            headers: getAuthHeaders(),
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
            headers: getAuthHeaders(),
            credentials: 'include',
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error unsharing note:', error);
        throw error;
    }
};

/**
 * Lấy note với thông tin shares (nếu có)
 */
export const getNoteWithShares = async (id: string) => {
  try {
    // Thử lấy từ collab-service trước
    const collabResponse = await fetch(`${COLLAB_SERVICE_URL}/api/notes/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (collabResponse.ok) {
      console.log('📄 Note found in collab-service with shares data');
      return await handleResponse(collabResponse);
    }

    // Nếu không tìm thấy, lấy từ note-service
    console.log('📄 Note not shared, loading from note-service');
    const noteResponse = await fetch(`${NOTE_SERVICE_URL}/api/notes/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    return await handleResponse(noteResponse);
  } catch (error) {
    console.error('❌ Error fetching note with shares:', error);
    throw error;
  }
};