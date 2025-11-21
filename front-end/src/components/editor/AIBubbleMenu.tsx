import { useState, useEffect, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { 
  Sparkles, Languages, FileText, Wand2, 
  Check, X, Loader2, ChevronRight, RefreshCw 
} from 'lucide-react';
import { apiService } from '@/services/api';

interface AIBubbleMenuProps {
  editor: Editor;
  isOpen: boolean;
  onClose: () => void;
}

interface AIAction {
  id: string;
  label: string;
  icon: any;
  color: string;
  description: string;
  action: 'translate' | 'summarize' | 'improve';
  targetLanguage?: string;
}

const AI_ACTIONS: AIAction[] = [
  {
    id: 'translate-en',
    label: 'Translate to English',
    icon: Languages,
    color: 'from-blue-500 to-cyan-500',
    description: 'VI → EN',
    action: 'translate',
    targetLanguage: 'English'
  },
  {
    id: 'translate-vi',
    label: 'Translate to Vietnamese',
    icon: Languages,
    color: 'from-purple-500 to-pink-500',
    description: 'EN → VI',
    action: 'translate',
    targetLanguage: 'Tiếng Việt'
  },
  {
    id: 'summarize',
    label: 'Summarize',
    icon: FileText,
    color: 'from-orange-500 to-red-500',
    description: 'Concise summary',
    action: 'summarize'
  },
  {
    id: 'improve',
    label: 'Improve Writing',
    icon: Wand2,
    color: 'from-green-500 to-emerald-500',
    description: 'Enhance clarity',
    action: 'improve'
  }
];

export const AIBubbleMenu = ({ editor, isOpen, onClose }: AIBubbleMenuProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Get selected text from editor
  const getSelectedText = useCallback(() => {
    const { from, to } = editor.state.selection;
    return editor.state.doc.textBetween(from, to, '\n');
  }, [editor]);

  // Update selected text when menu opens
  useEffect(() => {
    if (isOpen) {
      const text = getSelectedText();
      setSelectedText(text);
      setError(null);
    }
  }, [isOpen, getSelectedText]);

  // Handle AI Action
  const handleAIAction = useCallback(async (action: AIAction) => {
    setIsLoading(true);
    setError(null);
    setShowPreview(true);

    try {
      const text = selectedText || getSelectedText();
      
      if (!text || text.trim().length === 0) {
        throw new Error('Please select some text first');
      }

      let result: string;

      switch (action.action) {
        case 'translate':
          const translateResponse = await apiService.translate({
            text,
            targetLanguage: action.targetLanguage
          });
          result = translateResponse.data.translated;
          break;

        case 'summarize':
          const summaryResponse = await apiService.summarize({
            text,
            maxLength: 200
          });
          result = summaryResponse.data.summary;
          break;

        case 'improve':
          const improveResponse = await apiService.improveWriting({
            text,
            style: 'professional'
          });
          result = improveResponse.data.improved;
          break;

        default:
          throw new Error('Unknown action');
      }

      setAiResult(result);
    } catch (err: any) {
      console.error('AI action failed:', err);
      setError(err.message || 'Failed to process your request');
      setAiResult('');
    } finally {
      setIsLoading(false);
    }
  }, [selectedText, getSelectedText]);

  // Apply result to editor
  const handleApply = useCallback((mode: 'replace' | 'insert') => {
    const { from, to } = editor.state.selection;

    if (mode === 'replace') {
      editor.chain()
        .focus()
        .deleteRange({ from, to })
        .insertContent(aiResult)
        .run();
    } else {
      editor.chain()
        .focus()
        .setTextSelection(to)
        .insertContent('\n\n' + aiResult)
        .run();
    }

    // Close all modals
    setShowPreview(false);
    onClose();
  }, [editor, aiResult, onClose]);

  // Retry action
  const handleRetry = useCallback(() => {
    setError(null);
    setIsLoading(false);
    setShowPreview(false);
  }, []);

  // Close everything
  const handleCloseAll = useCallback(() => {
    setShowPreview(false);
    setError(null);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
        onClick={handleCloseAll}
      />

      {/* Bubble Menu */}
      {!showPreview && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2 min-w-[320px]">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 mb-2 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-violet-500" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  AI Actions
                </span>
              </div>
              <button
                onClick={handleCloseAll}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
              >
                <X size={16} className="text-slate-400" />
              </button>
            </div>

            {/* Actions Grid */}
            <div className="space-y-1">
              {AI_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => handleAIAction(action)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group text-left"
                  >
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <Icon size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-slate-700 dark:text-slate-200">
                        {action.label}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {action.description}
                      </div>
                    </div>
                    <ChevronRight 
                      size={16} 
                      className="text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" 
                    />
                  </button>
                );
              })}
            </div>

            {/* Footer Info */}
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 px-3 py-1">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                💡 Selected: <span className="font-medium">{selectedText.length}</span> characters
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Panel */}
      {showPreview && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 dark:border-slate-700">
            {/* Preview Header */}
            <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                    AI Result Preview
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Review before applying changes
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseAll}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                disabled={isLoading}
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Preview Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="relative">
                    <Loader2 className="animate-spin text-violet-500" size={48} />
                    <div className="absolute inset-0 blur-xl bg-violet-500/20 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">
                      AI is processing...
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      This usually takes a few seconds
                    </p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <X size={32} className="text-red-500" />
                  </div>
                  <div className="text-center max-w-md">
                    <p className="font-medium text-red-600 dark:text-red-400 mb-2">
                      Something went wrong
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      {error}
                    </p>
                    <button
                      onClick={handleRetry}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      <RefreshCw size={16} />
                      Try Again
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Original Text */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Original Text
                      </div>
                      <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {selectedText}
                    </p>
                  </div>

                  {/* AI Result */}
                  <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 rounded-xl p-4 border border-violet-200 dark:border-violet-800 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={14} className="text-violet-600 dark:text-violet-400" />
                      <div className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wide">
                        AI Generated Result
                      </div>
                      <div className="h-px flex-1 bg-violet-200 dark:bg-violet-800" />
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {aiResult}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preview Actions */}
            {!isLoading && !error && aiResult && (
              <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex gap-3 bg-slate-50 dark:bg-slate-800/50">
                <button
                  onClick={() => handleApply('replace')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all font-medium"
                >
                  <Check size={18} />
                  Replace Selection
                </button>
                <button
                  onClick={() => handleApply('insert')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 hover:scale-[1.02] active:scale-[0.98] transition-all font-medium"
                >
                  <ChevronRight size={18} />
                  Insert Below
                </button>
                <button
                  onClick={handleCloseAll}
                  className="px-4 py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all font-medium"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};