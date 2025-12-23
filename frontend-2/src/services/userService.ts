/**
 * Service xử lý các tác vụ liên quan đến User
 */

export const updateUserTheme = async (theme: string): Promise<void> => {
    try {
        // Lấy token từ sessionStorage (key thường là 'jwt_token' hoặc 'token' tùy vào cách bạn lưu lúc login)
        // Giả sử key là 'jwt_token' dựa trên ngữ cảnh yêu cầu trước đó
        const token = sessionStorage.getItem('jwt_token');
        
        if (!token) {
            console.warn("Không tìm thấy JWT token trong sessionStorage để cập nhật theme.");
            return;
        }

        const response = await fetch(`/api/users/theme?theme=${theme}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Lỗi khi cập nhật theme: ${response.status} ${response.statusText}`);
        }

        console.log(`Đã cập nhật theme thành công: ${theme}`);

    } catch (error) {
        console.error("Lỗi service updateUserTheme:", error);
        throw error;
    }
};