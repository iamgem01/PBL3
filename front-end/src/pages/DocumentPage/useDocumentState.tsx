import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNoteById, updateNote, markAsImportant, removeAsImportant, moveToTrash, exportNoteAsPdf } from '@/services';
import type { Note, ToolbarPosition } from './documentTypes';
import { mockNotes } from '../../mockData/notes';

export const useDocumentState = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  
  // Toolbar state
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState<ToolbarPosition>({ x: 0, y: 0 });
  
  // Modal states
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isImportantLoading, setIsImportantLoading] = useState(false);

  // Fetch note
  useEffect(() => {
    const fetchNote = async () => {
      if (!id) {
        setError("Note ID is missing");
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching note with ID:', id);
        const noteData = await getNoteById(id);
        setNote(noteData);
      } catch (err: any) {
        console.error('Error fetching note:', err);
        setError(err.message || "Failed to load note");
      } finally {
        setIsLoading(false);
      }
    };
    fetchNote();
  }, [id]);

  // Handlers - Memoized with useCallback to prevent unnecessary rerenders
  const handleUpdateNote = useCallback(async (newContent: string) => {
    if (!note || !id) return;

    setIsUpdating(true);
    try {
      console.log('Updating note content');
      const updatedNote = await updateNote(id, {
        ...note,
        content: newContent,
        updatedAt: new Date().toISOString()
      });
      setNote(updatedNote);
    } catch (error: any) {
      console.error('Error updating note:', error);
      setError("Failed to update note: " + error.message);
    } finally {
      setIsUpdating(false);
    }
  }, [note, id]);

  const handleMoveToTrash = useCallback(async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      console.log('Moving note to trash');
      await moveToTrash(id, 'NOTE');
      navigate(-1);
    } catch (error: any) {
      console.error('Error moving to trash:', error);
      setError("Failed to move note to trash: " + error.message);
      setIsDeleting(false);
    }
  }, [id, navigate]);

  const handleToggleImportant = useCallback(async () => {
    if (!note || !id) return;

    setIsImportantLoading(true);
    try {
      console.log('Toggling important status, current:', note.isImportant);
      let updatedNote;
      if (note.isImportant) {
        updatedNote = await removeAsImportant(id);
      } else {
        updatedNote = await markAsImportant(id);
      }
      setNote(updatedNote);
    } catch (error: any) {
      console.error('Error toggling important:', error);
      setError("Failed to update important status: " + error.message);
    } finally {
      setIsImportantLoading(false);
    }
  }, [note, id]);

  const handleExportPdf = useCallback(async () => {
    if (!id) return;

    setIsExporting(true);
    try {
      console.log('Exporting note as PDF');
      const blob = await exportNoteAsPdf(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${note?.title || 'note'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error exporting PDF:', error);
      setError("Failed to export note: " + error.message);
    } finally {
      setIsExporting(false);
    }
  }, [id, note?.title]);

  return useMemo(() => ({
    // State
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

    // Handlers
    handleUpdateNote,
    handleMoveToTrash,
    handleToggleImportant,
    handleExportPdf,
  }), [
    note,
    isLoading,
    error,
    collapsed,
    showToolbar,
    toolbarPosition,
    isUpdating,
    isDeleting,
    isExporting,
    showDeleteConfirm,
    isImportantLoading,
    handleUpdateNote,
    handleMoveToTrash,
    handleToggleImportant,
    handleExportPdf,
  ]);
};