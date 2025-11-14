import { handleResponse, NOTE_SERVICE_URL } from './utils';

/**
 * Lấy ghi chú theo thư mục.
 */
export const getNotesByFolder = async (folderId: string) => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/notes/folder/${folderId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  return handleResponse(response);
};