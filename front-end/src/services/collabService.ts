const COLLAB_SERVICE_URL = import.meta.env.VITE_COLLAB_SERVICE_URL || 'http://localhost:8083';

/**
 * Xử lý response từ API
 * Throw error nếu request failed
 */
const handleResponse = async (response: Response): Promise<any> => {
    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);

    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        
        let errorMessage = `Request failed with status ${response.status}`;
        
        try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorMessage;
            console.error('❌ Parsed error:', errorData);
        } catch {
            errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
    }

    const text = await response.text();
    console.log('📥 Response text length:', text.length);
    
    if (!text) {
        console.log('ℹ️ Empty response body');
        return {};
    }
    
    try {
        const data = JSON.parse(text);
        console.log('✅ Parsed response data:', data);
        return data;
    } catch (e) {
        console.log('⚠️ Non-JSON response:', text);
        return { message: text };
    }
};

/**
 * Lấy tất cả documents đã được share từ collab-service
 * Endpoint: GET /api/notes/shared
 */
export const getSharedNotes = async (): Promise<any[]> => {
    try {
        console.log('========================================');
        console.log('📤 FETCHING SHARED NOTES');
        console.log('========================================');
        console.log('URL:', `${COLLAB_SERVICE_URL}/api/notes/shared`);
        
        const response = await fetch(`${COLLAB_SERVICE_URL}/api/notes/shared`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        
        const data = await handleResponse(response);
        console.log('✅ Fetched shared notes:', data.length);
        console.log('========================================');
        
        return data;
    } catch (error) {
        console.error('========================================');
        console.error('❌ ERROR FETCHING SHARED NOTES');
        console.error('========================================');
        console.error('Error:', error);
        console.error('========================================');
        throw error;
    }
};

/**
 * Share một document với danh sách users
 * Endpoint: POST /api/notes/{noteId}/share
 * Body: { userIds: ["all"] } hoặc { userIds: ["user1", "user2"] }
 */
export const shareNote = async (noteId: string, userIds: string[]): Promise<any> => {
    try {
        console.log('========================================');
        console.log('📤 SHARING NOTE');
        console.log('========================================');
        console.log('URL:', `${COLLAB_SERVICE_URL}/api/notes/${noteId}/share`);
        console.log('Note ID:', noteId);
        console.log('User IDs:', userIds);
        
        const requestBody = { userIds };
        console.log('Request body:', JSON.stringify(requestBody));
        
        const response = await fetch(`${COLLAB_SERVICE_URL}/api/notes/${noteId}/share`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(requestBody),
        });
        
        const data = await handleResponse(response);
        console.log('✅ Share successful');
        console.log('Response data:', data);
        console.log('========================================');
        
        return data;
    } catch (error) {
        console.error('========================================');
        console.error('❌ ERROR SHARING NOTE');
        console.error('========================================');
        console.error('Note ID:', noteId);
        console.error('Error:', error);
        console.error('========================================');
        throw error;
    }
};

/**
 * Unshare một document (xóa tất cả shares)
 * Endpoint: POST /api/notes/{noteId}/unshare
 */
export const unshareNote = async (noteId: string): Promise<any> => {
    try {
        console.log('========================================');
        console.log('📤 UNSHARING NOTE');
        console.log('========================================');
        console.log('URL:', `${COLLAB_SERVICE_URL}/api/notes/${noteId}/unshare`);
        console.log('Note ID:', noteId);
        
        const response = await fetch(`${COLLAB_SERVICE_URL}/api/notes/${noteId}/unshare`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        
        const data = await handleResponse(response);
        console.log('✅ Unshare successful');
        console.log('========================================');
        
        return data;
    } catch (error) {
        console.error('========================================');
        console.error('❌ ERROR UNSHARING NOTE');
        console.error('========================================');
        console.error('Note ID:', noteId);
        console.error('Error:', error);
        console.error('========================================');
        throw error;
    }
};

/**
 * Lấy chi tiết một note từ collab-service
 * Endpoint: GET /api/notes/{noteId}
 */
export const getNoteById = async (noteId: string): Promise<any> => {
    try {
        console.log('📤 Fetching note from collab-service:', noteId);
        
        const response = await fetch(`${COLLAB_SERVICE_URL}/api/notes/${noteId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        
        const data = await handleResponse(response);
        console.log('✅ Note fetched successfully');
        
        return data;
    } catch (error) {
        console.error('❌ Error fetching note from collab-service:', error);
        throw error;
    }
};

/**
 * Health check - Kiểm tra collab-service có hoạt động không
 * Endpoint: GET /health
 */
export const checkCollabServiceHealth = async (): Promise<boolean> => {
    try {
        console.log('🏥 Checking collab-service health...');
        
        const response = await fetch(`${COLLAB_SERVICE_URL}/health`, {
            method: 'GET',
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Collab-service is healthy:', data);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('❌ Collab-service health check failed:', error);
        return false;
    }
};