import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNoteById, updateNote, markAsImportant, removeAsImportant, moveToTrash, exportNoteAsPdf, handleResponse, COLLAB_SERVICE_URL } from '@/services';
import type { Note } from '@/types/note';
import type { ToolbarPosition } from './documentTypes';

export const useDocumentState = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState<ToolbarPosition>({ x: 0, y: 0 });
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isImportantLoading, setIsImportantLoading] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      if (!id) {
        setError("Note ID is missing");
        return;
      }
      try {
        setIsLoading(true);
        // Thử lấy từ collab service (ưu tiên)
        try {
           const res = await fetch(`${COLLAB_SERVICE_URL}/api/notes/${id}`, { 
             headers: {'Content-Type': 'application/json'}, credentials: 'include' 
           });
           if(res.ok) {
             const data = await handleResponse(res);
             setNote(data);
             setIsLoading(false);
             return;
           }
        } catch (e) {
          console.log('⚠️ Collab service failed, falling back to local API');
        }

        // Fallback
        const noteData = await getNoteById(id);
        setNote(noteData);
      } catch (err: any) {
        setError(err.message || "Failed to load note");
      } finally {
        setIsLoading(false);
      }
    };
    fetchNote();
  }, [id]);

  // ✅ FIX: Update note ngầm, chỉ update timestamp trên UI
  const handleUpdateNote = useCallback(async (newContent: string) => {
    if (!note || !id) return;

    // Không set isUpdating (loading) toàn màn hình để tránh unmount editor
    try {
      await updateNote(id, {
        ...note,
        content: newContent,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state nhẹ nhàng
      setNote(prev => prev ? { 
        ...prev, 
        content: newContent, 
        updatedAt: new Date().toISOString() 
      } : null);
    } catch (error: any) {
      console.error("Failed to auto-save:", error);
    }
  }, [note, id]);

  // ✅ FIX: Function để lấy initial content thông minh
  const getInitialContent = useCallback(() => {
    // Nếu là shared document, để Yjs tự load từ persistence
    // Chỉ dùng initialContent cho local documents
    if (note?.shares && note.shares.length > 0) {
      console.log('🔄 Shared document - Yjs will load content from persistence');
      return ''; // Yjs sẽ tự load từ IndexedDB
    } else {
      console.log('📝 Local document - using content from API');
      return note?.content || '';
    }
  }, [note]);

  const handleMoveToTrash = useCallback(async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await moveToTrash(id, 'NOTE');
      navigate(-1);
    } catch (error: any) {
      setError("Failed to move to trash: " + error.message);
      setIsDeleting(false);
    }
  }, [id, navigate]);

  const handleToggleImportant = useCallback(async () => {
    if (!note || !id) return;
    setIsImportantLoading(true);
    try {
      const updatedNote = note.isImportant ? await removeAsImportant(id) : await markAsImportant(id);
      setNote(updatedNote);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsImportantLoading(false);
    }
  }, [note, id]);

  const handleExportPdf = useCallback(async () => {
    if (!id) return;
    setIsExporting(true);
    try {
      const blob = await exportNoteAsPdf(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${note?.title || 'note'}.pdf`;
      a.click();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsExporting(false);
    }
  }, [id, note?.title]);

  return useMemo(() => ({
    note, 
    isLoading, 
    error, 
    collapsed, 
    setCollapsed,
    showToolbar, 
    setShowToolbar, 
    toolbarPosition, 
    setToolbarPosition,
    isUpdating, 
    isDeleting, 
    isExporting, 
    showDeleteConfirm, 
    setShowDeleteConfirm, 
    isImportantLoading,
    handleUpdateNote, 
    handleMoveToTrash, 
    handleToggleImportant, 
    handleExportPdf,
    getInitialContent, // ✅ Export function mới
    noteId: id
  }), [
    note, isLoading, error, collapsed, showToolbar, toolbarPosition, 
    isUpdating, isDeleting, isExporting, showDeleteConfirm, isImportantLoading,
    handleUpdateNote, handleMoveToTrash, handleToggleImportant, handleExportPdf,
    getInitialContent, id
  ]);
};