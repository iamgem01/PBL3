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
  const response = await fetch(NOTE_SERVICE_URL, {
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
  const response = await fetch(`${NOTE_SERVICE_URL}/${id}`, {
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