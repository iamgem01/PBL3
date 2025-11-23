const COLLAB_SERVICE_URL = import.meta.env.VITE_COLLAB_SERVICE_URL || 'http://localhost:8083';

/**
 * Xá»­ lÃ½ response tá»« API
 */
const handleResponse = async (response: Response): Promise<any> => {
    console.log('ðŸ“¥ Response status:', response.status);
    console.log('ðŸ“¥ Response ok:', response.ok);

    if (!response.ok) {
        const errorText = await response.text();
        console.error('âŒ Error response:', errorText);
        
        let errorMessage = `Request failed with status ${response.status}`;
        
        try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorMessage;
            console.error('âŒ Parsed error:', errorData);
        } catch {
            errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
    }

    const text = await response.text();
    console.log('ðŸ“¥ Response text length:', text.length);
    
    if (!text) {
        console.log('â„¹ï¸ Empty response body');
        return {};
    }
    
    try {
        const data = JSON.parse(text);
        console.log('âœ… Parsed response data:', data);
        return data;
    } catch (e) {
        console.log('âš ï¸ Non-JSON response:', text);
        return { message: text };
    }
};

/**
 * Láº¥y táº¥t cáº£ documents Ä‘Ã£ Ä‘Æ°á»£c share tá»« collab-service
 */

/**
 * Láº¥y táº¥t cáº£ documents Ä‘Ã£ Ä‘Æ°á»£c share vá»›i current user
 */
export const getSharedNotes = async (): Promise<any[]> => {
    try {
        // Get current user ID
        const userData = localStorage.getItem('user');
        if (!userData) {
            console.error('âŒ No user data in localStorage for shared notes');
            return [];
        }
        
        const user = JSON.parse(userData);
        const userId = user.id;
        
        console.log('========================================');
        console.log('ðŸ“¤ FETCHING SHARED NOTES FOR USER:', userId);
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
        console.log('âœ… Fetched shared notes:', data.length);
        console.log('========================================');
        
        return data;
    } catch (error) {
        console.error('========================================');
        console.error('âŒ ERROR FETCHING SHARED NOTES');
        console.error('========================================');
        console.error('Error:', error);
        console.error('========================================');
        throw error;
    }
};

/**
 * Share má»™t document vá»›i danh sÃ¡ch users
 */
export const shareNote = async (noteId: string, userIds: string[]): Promise<any> => {
    try {
        console.log('========================================');
        console.log('ðŸ“¤ SHARING NOTE');
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
        console.log('âœ… Share successful');
        console.log('Response data:', data);
        console.log('========================================');
        
        return data;
    } catch (error) {
        console.error('========================================');
        console.error('âŒ ERROR SHARING NOTE');
        console.error('========================================');
        console.error('Note ID:', noteId);
        console.error('Error:', error);
        console.error('========================================');
        throw error;
    }
};

/**
 * Unshare má»™t document
 */
export const unshareNote = async (noteId: string): Promise<any> => {
    try {
        console.log('========================================');
        console.log('ðŸ“¤ UNSHARING NOTE');
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
        console.log('âœ… Unshare successful');
        console.log('========================================');
        
        return data;
    } catch (error) {
        console.error('========================================');
        console.error('âŒ ERROR UNSHARING NOTE');
        console.error('========================================');
        console.error('Note ID:', noteId);
        console.error('Error:', error);
        console.error('========================================');
        throw error;
    }
};

/**
 * Má»i user qua email Ä‘á»ƒ collaborate
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
            console.error('âŒ No user data in localStorage for invitation');
            throw new Error('User not authenticated');
        }
        
        const user = JSON.parse(userData);
        const userId = user.id;
        
        console.log('========================================');
        console.log('ðŸ“§ INVITING USER');
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
        console.log('âœ… Invitation sent successfully');
        console.log('========================================');
        
        return data;
    } catch (error) {
        console.error('========================================');
        console.error('âŒ ERROR SENDING INVITATION');
        console.error('========================================');
        console.error('Error:', error);
        console.error('========================================');
        throw error;
    }
};

/**
 * Accept invitation (ngÆ°á»i Ä‘Æ°á»£c má»i click vÃ o link)
 */
export const acceptInvitation = async (token: string, userEmail: string): Promise<any> => {
    try {
        console.log('========================================');
        console.log('âœ… ACCEPTING INVITATION');
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
        console.log('âœ… Invitation accepted');
        console.log('========================================');
        
        return data;
    } catch (error) {
        console.error('========================================');
        console.error('âŒ ERROR ACCEPTING INVITATION');
        console.error('========================================');
        console.error('Error:', error);
        console.error('========================================');
        throw error;
    }
};

/**
 * Láº¥y danh sÃ¡ch invitations cho má»™t note
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
        console.error('âŒ Error fetching invitations:', error);
        throw error;
    }
};

/**
 * Láº¥y pending invitations cho current user
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
        console.error('âŒ Error fetching pending invitations:', error);
        throw error;
    }
};

/**
 * Láº¥y chi tiáº¿t má»™t note tá»« collab-service
 */
export const getNoteById = async (noteId: string): Promise<any> => {
    try {
        console.log('ðŸ“¤ Fetching note from collab-service:', noteId);
        
        const response = await fetch(`${COLLAB_SERVICE_URL}/api/notes/${noteId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        
        const data = await handleResponse(response);
        console.log('âœ… Note fetched successfully');
        
        return data;
    } catch (error) {
        console.error('âŒ Error fetching note from collab-service:', error);
        throw error;
    }
};

/**
 * Health check
 */
export const checkCollabServiceHealth = async (): Promise<boolean> => {
    try {
        console.log('ðŸ¥ Checking collab-service health...');
        
        const response = await fetch(`${COLLAB_SERVICE_URL}/health`, {
            method: 'GET',
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('âœ… Collab-service is healthy:', data);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('âŒ Collab-service health check failed:', error);
        return false;
    }
};