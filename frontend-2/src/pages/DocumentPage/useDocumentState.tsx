import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getNoteById,
  updateNote,
  markAsImportant,
  removeAsImportant,
  moveToTrash,
  exportNoteAsPdf,
  handleResponse,
  COLLAB_SERVICE_URL,
} from "@/services";
import type { Note } from "@/types/note";
import type { ToolbarPosition } from "./documentTypes";

export const useDocumentState = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState<ToolbarPosition>({
    x: 0,
    y: 0,
  });

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
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
          if (res.ok) {
            const data = await handleResponse(res);
            setNote(data);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.log("⚠️ Collab service failed, falling back to local API");
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

  const handleUpdateNote = useCallback(
    async (newContent: string) => {
      if (!note || !id) return;

      try {
        await updateNote(id, {
          ...note,
          content: newContent,
          updatedAt: new Date().toISOString(),
        });

        setNote((prev) =>
          prev
            ? {
                ...prev,
                content: newContent,
                updatedAt: new Date().toISOString(),
              }
            : null
        );
      } catch (error: any) {
        console.error("Failed to auto-save:", error);
      }
    },
    [note, id]
  );

  const getInitialContent = useCallback(() => {
    // ✅ ALWAYS return note content initially
    // Yjs will sync after editor is created, but we need initial content
    // to populate the Yjs document when first enabling collaboration
    console.log(
      "📝 Loading initial content:",
      note?.content?.length || 0,
      "chars"
    );
    return note?.content || "";
  }, [note]);

  const handleMoveToTrash = useCallback(async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await moveToTrash(id, "NOTE");
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
      const updatedNote = note.isImportant
        ? await removeAsImportant(id)
        : await markAsImportant(id);
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
      const a = document.createElement("a");
      a.href = url;
      a.download = `${note?.title || "note"}.pdf`;
      a.click();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsExporting(false);
    }
  }, [id, note?.title]);

  return useMemo(
    () => ({
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
      getInitialContent,
      noteId: id,
    }),
    [
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
      getInitialContent,
      id,
    ]
  );
};
