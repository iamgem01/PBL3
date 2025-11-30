import { handleResponse, NOTE_SERVICE_URL } from './utils';

// Đảm bảo NOTE_SERVICE_URL = 'http://localhost:8082'

/**
 * Export ghi chú dưới dạng PDF.
 */
export const exportNoteAsPdf = async (id: string) => {
  try {
    const response = await fetch(`${NOTE_SERVICE_URL}/api/data/export/pdf/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to export PDF: ${response.status} ${errorText}`);
    }

    const blob = await response.blob();
    
    // Tạo link download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `note-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return blob;
  } catch (error) {
    console.error('Export PDF error:', error);
    throw error;
  }
};