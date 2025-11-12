import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getNoteById } from "@/services/noteService";
import Sidebar from "@/components/layout/sidebar/sidebar";

// Định nghĩa interface cho Note từ API
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isImportant?: boolean;
}

export default function DocumentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      if (!id) {
        setError("Note ID is missing");
        setIsLoading(false);
        return;
      }

      try {
        const noteData = await getNoteById(id);
        setNote(noteData);
      } catch (err: any) {
        setError(err.message || "Failed to load note");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  const LoadingContent = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/80 to-gray-100/60 p-8 font-inter backdrop-blur-sm">
      <div className="max-w-4xl mx-auto bg-white/70 rounded-2xl shadow-lg backdrop-blur-md p-10 border border-gray-100">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading note...</span>
        </div>
      </div>
    </div>
  );

  const ErrorContent = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/80 to-gray-100/60 p-8 font-inter backdrop-blur-sm">
      <div className="max-w-4xl mx-auto bg-white/70 rounded-2xl shadow-lg backdrop-blur-md p-10 border border-gray-100">
        <div className="text-center text-gray-500 py-20">
          <p className="text-red-500 mb-4">❌ {error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );

  const NotFoundContent = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/80 to-gray-100/60 p-8 font-inter backdrop-blur-sm">
      <div className="max-w-4xl mx-auto bg-white/70 rounded-2xl shadow-lg backdrop-blur-md p-10 border border-gray-100">
        <div className="text-center text-gray-500 py-20">
          <p>❌ Note not found.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );

  const NoteContent = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/80 to-gray-100/60 p-8 font-inter backdrop-blur-sm">
      <div className="max-w-4xl mx-auto">
        {/* Document Header */}
        <div className="mb-8 bg-white/70 rounded-2xl shadow-lg backdrop-blur-md p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to notes"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-gabarito">
                  {note?.title || "Untitled Note"}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Last updated {note ? new Date(note.updatedAt).toLocaleString() : ''}
                </p>
              </div>
            </div>
            {note?.isImportant && (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <span className="mr-1">⭐</span>
                Important
              </span>
            )}
          </div>
        </div>

        {/* Document Content */}
        <div className="bg-white/70 rounded-2xl shadow-lg backdrop-blur-md border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="prose prose-gray max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-lg">
                {note?.content || "No content available"}
              </div>
            </div>
          </div>
          
          {/* Document Footer */}
          <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              <p>Created: {note ? new Date(note.createdAt).toLocaleString() : ''}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (isLoading) return <LoadingContent />;
    if (error) return <ErrorContent />;
    if (!note) return <NotFoundContent />;
    return <NoteContent />;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <main className={`transition-all duration-300 flex-1 overflow-y-auto ${collapsed ? "ml-20" : "ml-64"}`}>
        {renderContent()}
      </main>
    </div>
  );
}