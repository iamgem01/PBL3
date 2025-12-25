import { handleResponse, NOTE_SERVICE_URL } from './utils';
import { getAuthHeaders } from '@/utils/authUtils';

/**
 * Chuyển item vào thùng rác.
 */
export const moveToTrash = async (id: string, itemType: 'NOTE' | 'FOLDER', userId?: string) => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/trash/move/${id}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify({ itemType, userId }),
  });

  return handleResponse(response);
};

/**
 * Khôi phục item từ thùng rác.
 */
export const restoreFromTrash = async (itemId: string) => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/trash/restore/${itemId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  return handleResponse(response);
};

/**
 * Xóa vĩnh viễn item khỏi thùng rác.
 */
export const permanentDelete = async (itemId: string) => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/trash/${itemId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  return handleResponse(response);
};

/**
 * Lấy danh sách items trong thùng rác.
 */
export const getTrashItems = async (userId?: string) => {
    const url = userId 
      ? `${NOTE_SERVICE_URL}/api/trash?userId=${userId}` 
      : `${NOTE_SERVICE_URL}/api/trash`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
  
    return handleResponse(response);
  };