import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/layout/sidebar/sidebar";
import { ArrowLeft, Loader2, Check, Type } from "lucide-react";
import { getAllNotes, createNote, updateNote } from '@/services';

export default function NotePage() {
    const [collapsed, setCollapsed] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [noteId, setNoteId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    
    // Refs để auto-focus
    const titleRef = useRef<HTMLInputElement>(null);
    const contentRef = useRef<HTMLTextAreaElement>(null);

    // Auto-focus vào title khi load page
    useEffect(() => {
        if (titleRef.current) {
            titleRef.current.focus();
        }
    }, []);

    // Auto-save function với debounce
    const autoSave = useCallback(async (currentTitle: string, currentContent: string) => {
        if (!currentTitle.trim() && !currentContent.trim()) {
            return; // Không lưu nếu chưa có nội dung
        }

        setIsSaving(true);
        setSaveStatus('saving');

        try {
            const noteData = {
                title: currentTitle.trim() || "Untitled Note",
                content: currentContent.trim(),
                updatedAt: new Date().toISOString(),
            };

            let savedNote;
            if (noteId) {
                // Update existing note
                savedNote = await updateNote(noteId, noteData);
            } else {
                // Create new note
                savedNote = await createNote({
                    ...noteData,
                    createdAt: new Date().toISOString(),
                });
                setNoteId(savedNote.id); // Lưu ID của note vừa tạo
            }

            setSaveStatus('saved');
            setError(null);

        } catch (err: any) {
            setSaveStatus('error');
            setError(err.message || "Failed to save note");
        } finally {
            setIsSaving(false);
        }
    }, [noteId]);

    // Debounce auto-save (chờ 1 giây sau khi user dừng nhập)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (title || content) {
                autoSave(title, content);
            }
        }, 1000); // 1 second delay

        return () => clearTimeout(timeoutId);
    }, [title, content, autoSave]);

    // Reset save status sau 2 giây
    useEffect(() => {
        if (saveStatus === 'saved') {
            const timeout = setTimeout(() => setSaveStatus('idle'), 2000);
            return () => clearTimeout(timeout);
        }
    }, [saveStatus]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl/Cmd + S to manually save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (title || content) {
                    autoSave(title, content);
                }
            }
            // Ctrl/Cmd + Enter to focus content
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                contentRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [title, content, autoSave]);

    const handleBack = () => {
        navigate('/home');
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <main className={`transition-all duration-300 flex-1 overflow-y-auto ${collapsed ? "ml-20" : "ml-64"}`}>
                
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleBack}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Back to Home (Esc)"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div className="flex items-center gap-2">
                                <Type size={20} className="text-gray-400" />
                                <h1 className="text-xl font-semibold text-gray-900">Note Editor</h1>
                            </div>
                        </div>
                        
                        {/* Save Status Indicator */}
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-500">
                                {noteId ? `ID: ${noteId.slice(-8)}` : 'Draft'}
                            </div>
                            {saveStatus === 'saving' && (
                                <div className="flex items-center gap-2 text-blue-600">
                                    <Loader2 size={16} className="animate-spin" />
                                    <span className="text-sm">Saving...</span>
                                </div>
                            )}
                            {saveStatus === 'saved' && (
                                <div className="flex items-center gap-2 text-green-600">
                                    <Check size={16} />
                                    <span className="text-sm">Saved</span>
                                </div>
                            )}
                            {saveStatus === 'error' && (
                                <div className="flex items-center gap-2 text-red-600">
                                    <span className="text-sm">Save failed</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto p-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Title Input */}
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                            <input
                                ref={titleRef}
                                type="text"
                                placeholder="Enter your note title here..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full text-3xl font-bold text-gray-900 placeholder-gray-300 border-none outline-none focus:ring-0 p-0 bg-transparent"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        contentRef.current?.focus();
                                    }
                                }}
                            />
                        </div>

                        {/* Content Input */}
                        <div className="relative">
                            {/* Line numbers (optional) */}
                            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-6 text-xs text-gray-400 font-mono select-none">
                                {content.split('\n').map((_, index) => (
                                    <div key={index} className="leading-6 h-6 flex items-center">
                                        {index + 1}
                                    </div>
                                ))}
                                {/* Always show at least 10 lines */}
                                {Array.from({ length: Math.max(0, 10 - content.split('\n').length) }, (_, index) => (
                                    <div key={`empty-${index}`} className="leading-6 h-6 flex items-center opacity-30">
                                        {content.split('\n').length + index + 1}
                                    </div>
                                ))}
                            </div>

                            <textarea
                                ref={contentRef}
                                placeholder="Start writing your note...

Tips:
• Press Ctrl+Enter to focus here from title
• Your work is automatically saved
• Press Ctrl+S to save manually"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full min-h-[500px] text-gray-700 placeholder-gray-400 border-none outline-none focus:ring-0 p-6 pl-16 resize-none font-mono text-sm leading-6 bg-white"
                                style={{ 
                                    lineHeight: '1.5',
                                    tabSize: 4,
                                    whiteSpace: 'pre-wrap',
                                    wordWrap: 'break-word'
                                }}
                                spellCheck={false}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
                        <div>
                            Lines: {content.split('\n').length} | 
                            Characters: {content.length} | 
                            Words: {content.trim() ? content.trim().split(/\s+/).length : 0}
                        </div>
                        <div>
                            Auto-saved • Ctrl+S to save manually
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
