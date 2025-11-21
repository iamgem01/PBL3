const COLLAB_SERVICE_URL = import.meta.env.VITE_COLLAB_SERVICE_URL || 'http://localhost:8083';

/**
 * Xử lý response từ API
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
 */

/**
 * Lấy tất cả documents đã được share với current user
 */
export const getSharedNotes = async (): Promise<any[]> => {
    try {
        // Get current user ID
        const userData = localStorage.getItem('user');
        if (!userData) {
            console.error('❌ No user data in localStorage for shared notes');
            return [];
        }
        
        const user = JSON.parse(userData);
        const userId = user.id;
        
        console.log('========================================');
        console.log('📤 FETCHING SHARED NOTES FOR USER:', userId);
        console.log('========================================');
        console.log('URL:', `${COLLAB_SERVICE_URL}/api/notes/shared`);
        
        const response = await fetch(`${COLLAB_SERVICE_URL}/api/notes/shared`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': userId, // Pass user ID for filtering
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
 * Unshare một document
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
 * Mời user qua email để collaborate
 */
export const inviteUser = async (
    noteId: string, 
    inviterEmail: string, 
    inviteeEmail: string
): Promise<any> => {
    try {
        // Get current user ID
        const userData = localStorage.getItem('user');
        if (!userData) {
            console.error('❌ No user data in localStorage for invitation');
            throw new Error('User not authenticated');
        }
        
        const user = JSON.parse(userData);
        const userId = user.id;
        
        console.log('========================================');
        console.log('📧 INVITING USER');
        console.log('========================================');
        console.log('Note ID:', noteId);
        console.log('From:', inviterEmail);
        console.log('To:', inviteeEmail);
        
        const response = await fetch(`${COLLAB_SERVICE_URL}/api/invitations/invite`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': userId,
            },
            credentials: 'include',
            body: JSON.stringify({
                noteId,
                inviterEmail,
                inviteeEmail
            }),
        });
        
        const data = await handleResponse(response);
        console.log('✅ Invitation sent successfully');
        console.log('========================================');
        
        return data;
    } catch (error) {
        console.error('========================================');
        console.error('❌ ERROR SENDING INVITATION');
        console.error('========================================');
        console.error('Error:', error);
        console.error('========================================');
        throw error;
    }
};

/**
 * Accept invitation (người được mời click vào link)
 */
export const acceptInvitation = async (token: string, userEmail: string): Promise<any> => {
    try {
        console.log('========================================');
        console.log('✅ ACCEPTING INVITATION');
        console.log('========================================');
        console.log('Token:', token);
        console.log('User Email:', userEmail);
        
        const response = await fetch(`${COLLAB_SERVICE_URL}/api/invitations/accept`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                token,
                userEmail
            }),
        });
        
        const data = await handleResponse(response);
        console.log('✅ Invitation accepted');
        console.log('========================================');
        
        return data;
    } catch (error) {
        console.error('========================================');
        console.error('❌ ERROR ACCEPTING INVITATION');
        console.error('========================================');
        console.error('Error:', error);
        console.error('========================================');
        throw error;
    }
};

/**
 * Lấy danh sách invitations cho một note
 */
export const getInvitationsByNote = async (noteId: string): Promise<any[]> => {
    try {
        const response = await fetch(`${COLLAB_SERVICE_URL}/api/invitations/note/${noteId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        
        return await handleResponse(response);
    } catch (error) {
        console.error('❌ Error fetching invitations:', error);
        throw error;
    }
};

/**
 * Lấy pending invitations cho current user
 */
export const getPendingInvitations = async (email: string): Promise<any[]> => {
    try {
        const response = await fetch(`${COLLAB_SERVICE_URL}/api/invitations/user/${email}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        
        return await handleResponse(response);
    } catch (error) {
        console.error('❌ Error fetching pending invitations:', error);
        throw error;
    }
};

/**
 * Lấy chi tiết một note từ collab-service
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
 * Health check
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