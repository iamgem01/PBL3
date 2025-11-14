import { handleResponse, NOTE_SERVICE_URL } from './utils';

/**
 * Import ghi chú từ file.
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

  return handleResponse(response);
};

/**
 * Export ghi chú dưới dạng Markdown.
 */
export const exportNoteAsMarkdown = async (id: string) => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/data/export/md/${id}`, {
    method: 'GET',
    credentials: 'include',
  });

  return handleResponse(response);
};

/**
 * Export ghi chú dưới dạng PDF.
 */
export const exportNoteAsPdf = async (id: string) => {
  const response = await fetch(`${NOTE_SERVICE_URL}/api/data/export/pdf/${id}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to export PDF: ${response.status} ${errorText}`);
  }

  return response.blob();
};