// Lấy URL của note-service từ biến môi trường
const NOTE_SERVICE_URL = import.meta.env.VITE_NOTE_SERVICE_URL;

if (!NOTE_SERVICE_URL) {
  throw new Error("VITE_NOTE_SERVICE_URL is not defined in .env file");
}

/**
 * Lấy tất cả các ghi chú từ server.
 * Yêu cầu này gửi kèm cookie xác thực.
 * @returns {Promise<any[]>} Một mảng các đối tượng ghi chú.
 */
export const getAllNotes = async () => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/notes`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Rất quan trọng: Gửi cookie để xác thực
  });

  if (!response.ok) {
    // Ném lỗi nếu server trả về status không phải 2xx
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch notes' }));
    throw new Error(errorData.message || 'An unknown error occurred');
  }

  return response.json();
};

/**
 * Lấy một ghi chú cụ thể bằng ID của nó.
 * @param {string} id - ID của ghi chú cần lấy.
 * @returns {Promise<any>} Đối tượng ghi chú.
 */
export const getNoteById = async (id: string) => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/notes/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Failed to fetch note with id ${id}` }));
    throw new Error(errorData.message || 'An unknown error occurred');
  }

  return response.json();
};

// Bạn có thể thêm các hàm khác ở đây (create, update, delete) nếu cần
/**
 * Tạo một ghi chú mới.
 * @param {any} noteData - Dữ liệu của ghi chú mới.
 * @param {string} userId - ID của người dùng.
 * @returns {Promise<any>} Đối tượng ghi chú đã tạo.
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to create note' }));
    throw new Error(errorData.message || 'An unknown error occurred');
  }

  return response.json();
};

/**
 * Cập nhật một ghi chú.
 * @param {string} id - ID của ghi chú cần cập nhật.
 * @param {any} noteData - Dữ liệu cập nhật.
 * @returns {Promise<any>} Đối tượng ghi chú đã cập nhật.
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to update note' }));
    throw new Error(errorData.message || 'An unknown error occurred');
  }

  return response.json();
};

/**
 * Xóa một ghi chú.
 * @param {string} id - ID của ghi chú cần xóa.
 * @returns {Promise<void>}
 */
export const deleteNote = async (id: string) => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/notes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to delete note' }));
    throw new Error(errorData.message || 'An unknown error occurred');
  }
};

/**
 * Lấy lịch sử của một ghi chú.
 * @param {string} id - ID của ghi chú.
 * @returns {Promise<any[]>} Mảng lịch sử ghi chú.
 */
export const getNoteHistory = async (id: string) => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/notes/${id}/history`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch note history' }));
    throw new Error(errorData.message || 'An unknown error occurred');
  }

  return response.json();
};

/**
 * Khôi phục ghi chú từ lịch sử.
 * @param {string} id - ID của ghi chú.
 * @param {string} historyId - ID của lịch sử.
 * @returns {Promise<any>} Đối tượng ghi chú đã khôi phục.
 */
export const restoreNoteFromHistory = async (id: string, historyId: string) => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/notes/${id}/restore/${historyId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to restore note from history' }));
    throw new Error(errorData.message || 'An unknown error occurred');
  }

  return response.json();
};

/**
 * Đánh dấu ghi chú là quan trọng.
 * @param {string} id - ID của ghi chú.
 * @param {string} userId - ID của người dùng.
 * @returns {Promise<any>} Đối tượng ghi chú đã cập nhật.
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to mark note as important' }));
    throw new Error(errorData.message || 'An unknown error occurred');
  }

  return response.json();
};

/**
 * Bỏ đánh dấu quan trọng của ghi chú.
 * @param {string} id - ID của ghi chú.
 * @param {string} userId - ID của người dùng.
 * @returns {Promise<any>} Đối tượng ghi chú đã cập nhật.
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to remove important mark' }));
    throw new Error(errorData.message || 'An unknown error occurred');
  }

  return response.json();
};

/**
 * Lấy danh sách ghi chú quan trọng.
 * @param {string} userId - ID của người dùng.
 * @returns {Promise<any[]>} Mảng ghi chú quan trọng.
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch important notes' }));
    throw new Error(errorData.message || 'An unknown error occurred');
  }

  return response.json();
};

// ============ FOLDER APIs ============

/**
 * Tạo một thư mục mới.
 * @param {any} folderData - Dữ liệu thư mục.
 * @returns {Promise<any>} Đối tượng thư mục đã tạo.
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to create folder' }));
    throw new Error(errorData.message || 'An unknown error occurred');
  }

  return response.json();
};

/**
 * Lấy tất cả thư mục.
 * @param {string} userId - ID người dùng (tùy chọn).
 * @param {string} workspaceId - ID workspace (tùy chọn).
 * @returns {Promise<any[]>} Mảng thư mục.
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch folders' }));
    throw new Error(errorData.message || 'An unknown error occurred');
  }

  return response.json();
};

/**
 * Lấy thư mục theo ID.
 * @param {string} id - ID của thư mục.
 * @returns {Promise<any>} Đối tượng thư mục.
 */
export const getFolderById = async (id: string) => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/folders/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch folder' }));
    throw new Error(errorData.message || 'An unknown error occurred');
  }

  return response.json();
};

/**
 * Đổi tên thư mục.
 * @param {string} id - ID của thư mục.
 * @param {string} newName - Tên mới.
 * @returns {Promise<any>} Đối tượng thư mục đã cập nhật.
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to rename folder' }));
    throw new Error(errorData.message || 'An unknown error occurred');
  }

  return response.json();
};

/**
 * Di chuyển thư mục.
 * @param {string} id - ID của thư mục.
 * @param {string} newParentId - ID thư mục cha mới.
 * @returns {Promise<any>} Đối tượng thư mục đã cập nhật.
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to move folder' }));
    throw new Error(errorData.message || 'An unknown error occurred');
  }

  return response.json();
};

// ============ TRASH APIs ============

/**
 * Chuyển item vào thùng rác.
 * @param {string} id - ID của item.
 * @param {string} itemType - Loại item ('NOTE' hoặc 'FOLDER').
 * @returns {Promise<any>} Kết quả.
 */
export const moveToTrash = async (id: string, itemType: 'NOTE' | 'FOLDER') => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/trash/move/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ itemType }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to move item to trash' }));
    throw new Error(errorData.message || 'An unknown error occurred');
  }

  return response.json();
};

/**
 * Khôi phục item từ thùng rác.
 * @param {string} itemId - ID của item trong thùng rác.
 * @returns {Promise<any>} Kết quả.
 */
export const restoreFromTrash = async (itemId: string) => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/trash/restore/${itemId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to restore item from trash' }));
    throw new Error(errorData.message || 'An unknown error occurred');
  }

  return response.json();
};

/**
 * Xóa vĩnh viễn item khỏi thùng rác.
 * @param {string} itemId - ID của item trong thùng rác.
 * @returns {Promise<any>} Kết quả.
 */
export const permanentDelete = async (itemId: string) => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/trash/${itemId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to permanently delete item' }));
    throw new Error(errorData.message || 'An unknown error occurred');
  }

  return response.json();
};

// ============ DATA IMPORT/EXPORT APIs ============

/**
 * Import ghi chú từ file.
 * @param {FormData} formData - Form data chứa file và thông tin import.
 * @param {string} userId - ID người dùng.
 * @param {string} folderId - ID thư mục (tùy chọn).
 * @returns {Promise<any>} Đối tượng ghi chú đã import.
 */
export const importNoteFromFile = async (formData: FormData, userId: string = 'user_001', folderId?: string) => {
  const params = new URLSearchParams();
  if (folderId) params.append('folderId', folderId);
  
  const url = `${NOTE_SERVICE_URL}/api/data/import${params.toString() ? '?' + params.toString() : ''}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'X-User-Id': userId,
    },
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to import note' }));
    throw new Error(errorData.message || 'An unknown error occurred');
  }

  return response.json();
};

/**
 * Export ghi chú dưới dạng Markdown.
 * @param {string} id - ID của ghi chú.
 * @returns {Promise<Blob>} File blob.
 */
export const exportNoteAsMarkdown = async (id: string) => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/data/export/md/${id}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to export note as markdown' }));
    throw new Error(errorData.message || 'An unknown error occurred');
  }

  return response.blob();
};

/**
 * Export ghi chú dưới dạng PDF.
 * @param {string} id - ID của ghi chú.
 * @returns {Promise<Blob>} File blob.
 */
export const exportNoteAsPdf = async (id: string) => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/data/export/pdf/${id}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to export note as PDF' }));
    throw new Error(errorData.message || 'An unknown error occurred');
  }

  return response.blob();
};

// ============ SEARCH APIs ============

/**
 * Lấy ghi chú theo thư mục.
 * @param {string} folderId - ID của thư mục.
 * @returns {Promise<any[]>} Mảng ghi chú trong thư mục.
 */
export const getNotesByFolder = async (folderId: string) => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/notes/folder/${folderId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch notes by folder' }));
    throw new Error(errorData.message || 'An unknown error occurred');
  }

  return response.json();
};