import { handleResponse, NOTE_SERVICE_URL } from './utils';

/**
 * Tạo một thư mục mới.
 */
export const createFolder = async (folderData: any) => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/folders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(folderData),
  });

  return handleResponse(response);
};

/**
 * Lấy tất cả thư mục.
 */
export const getAllFolders = async (userId?: string, workspaceId?: string) => {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);
  if (workspaceId) params.append('workspaceId', workspaceId);
  
  const url = `${NOTE_SERVICE_URL}/api/folders${params.toString() ? '?' + params.toString() : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  return handleResponse(response);
};

/**
 * Lấy thư mục theo ID.
 */
export const getFolderById = async (id: string) => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/folders/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  return handleResponse(response);
};

/**
 * Đổi tên thư mục.
 */
export const renameFolder = async (id: string, newName: string) => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/folders/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ newName }),
  });

  return handleResponse(response);
};

/**
 * Di chuyển thư mục.
 */
export const moveFolder = async (id: string, newParentId: string) => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/folders/move/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ newParentId }),
  });

  return handleResponse(response);
};