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

  // Debug function to log clicks
  const handleClick = (handler: Function, name: string) => {
    console.log(`Button ${name} clicked`);
    handler();
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button
              onClick={() => {
                console.log('Back button clicked');
                navigate(-1);
              }}
              className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to notes"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-gray-900 font-gabarito truncate">
                {note?.title || "Untitled Note"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
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
              className={`p-2 rounded-lg transition-colors ${
                note?.isImportant 
                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                  : 'hover:bg-gray-100 text-gray-600'
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
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
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
              className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
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
    </div>
  );
};