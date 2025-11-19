// Lấy URL của note-service từ biến môi trường
const NOTE_SERVICE_URL = import.meta.env.VITE_NOTE_SERVICE_URL;

if (!NOTE_SERVICE_URL) {
  throw new Error("VITE_NOTE_SERVICE_URL is not defined in .env file");
}

// Helper function để xử lý response
export const handleResponse = async (response: Response): Promise<any> => {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Request failed with status ${response.status}`;
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Nếu không parse được JSON, dùng text response
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }

  // Thử parse JSON, nếu fail thì trả về text hoặc empty object
  const text = await response.text();
  if (!text) return {}; // Response trống
  
  try {
    return JSON.parse(text);
  } catch {
    // Nếu là plain text response nhưng status OK, coi như thành công
    console.log('Operation successful (non-JSON response):', text);
    return { message: text };
  }
};

export { NOTE_SERVICE_URL };