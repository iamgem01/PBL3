import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Download, Trash2 } from 'lucide-react';
import { formatDate } from './documentUtils';
import type { Note } from './documentTypes';

interface DocumentHeaderProps {
  note: Note | null;
  isImportantLoading: boolean;
  isExporting: boolean;
  isDeleting: boolean;
  onToggleImportant: () => void;
  onExportPdf: () => void;
  onShowDeleteConfirm: () => void;
}

export const DocumentHeader = ({
  note,
  isImportantLoading,
  isExporting,
  isDeleting,
  onToggleImportant,
  onExportPdf,
  onShowDeleteConfirm,
}: DocumentHeaderProps) => {
  const navigate = useNavigate();

  const handleClick = (handler: Function, name: string) => {
    console.log(`Button ${name} clicked`);
    handler();
  };

  return (
    <div className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            onClick={() => {
              console.log('Back button clicked');
              navigate(-1);
            }}
            className="flex-shrink-0 p-2 hover:bg-muted rounded-lg transition-colors text-foreground hover:shadow-sm"
            title="Back to notes"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-foreground font-gabarito truncate">
              {note?.title || "Untitled Note"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Last updated {note ? formatDate(note.updatedAt) : ''}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
          {/* Toggle Important */}
          <button
            onClick={() => handleClick(onToggleImportant, 'important')}
            disabled={isImportantLoading}
            className={`p-2 rounded-lg transition-all hover:shadow-sm ${
              note?.isImportant 
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50' 
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
            title={note?.isImportant ? "Remove from important" : "Mark as important"}
          >
            {isImportantLoading ? (
              <div className="w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            ) : (
              <Star className="w-5 h-5" fill={note?.isImportant ? 'currentColor' : 'none'} />
            )}
          </button>

          {/* Export PDF */}
          <button
            onClick={() => handleClick(onExportPdf, 'export')}
            disabled={isExporting}
            className="p-2 hover:bg-muted rounded-lg transition-all text-muted-foreground hover:text-foreground hover:shadow-sm"
            title="Export as PDF"
          >
            {isExporting ? (
              <div className="w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            ) : (
              <Download className="w-5 h-5" />
            )}
          </button>

          {/* Delete Button */}
          <button
            onClick={() => handleClick(onShowDeleteConfirm, 'delete')}
            disabled={isDeleting}
            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all text-red-600 dark:text-red-400 hover:shadow-sm"
            title="Delete note"
          >
            {isDeleting ? (
              <div className="w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};