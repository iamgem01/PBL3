import { useState, useCallback } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { Editor } from '@tiptap/react';
import { apiService } from '@/services/api';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  editor: Editor;
}

interface AIAction {
  id: string;
  label: string;
  icon: string;
  description: string;
  action: 'summarize' | 'improve' | 'translate' | 'explain';
}

const AI_ACTIONS: AIAction[] = [
  {
    id: 'summarize',
    label: 'Summarize',
    icon: '📝',
    description: 'Create a concise summary',
    action: 'summarize',
  },
  {
    id: 'improve',
    label: 'Improve Writing',
    icon: '✨',
    description: 'Enhance clarity and style',
    action: 'improve',
  },
  {
    id: 'translate',
    label: 'Translate',
    icon: '🌐',
    description: 'Translate to another language',
    action: 'translate',
  },
  {
    id: 'explain',
    label: 'Explain',
    icon: '💡',
    description: 'Get detailed explanation',
    action: 'explain',
  },
];

export const AIModal = ({ isOpen, onClose, editor }: AIModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const getSelectedText = useCallback(() => {
    const { from, to } = editor.state.selection;
    return editor.state.doc.textBetween(from, to, '\n');
  }, [editor]);

  const insertAIResult = useCallback((result: string) => {
    const { from, to } = editor.state.selection;
    
    // Replace selection or insert at cursor
    if (from !== to) {
      editor.chain().focus().deleteSelection().insertContent(result).run();
    } else {
      editor.chain().focus().insertContent(result).run();
    }
  }, [editor]);

  const handleAIAction = useCallback(async (action: AIAction['action']) => {
    setIsProcessing(true);
    setError(null);

    try {
      const selectedText = getSelectedText();
      const fullContent = editor.getHTML();
      const textToProcess = selectedText || fullContent;

      if (!textToProcess || textToProcess.trim().length === 0) {
        throw new Error('Please select some text or write content first');
      }

      let result: string;

      switch (action) {
        case 'summarize':
          const summaryResponse = await apiService.summarize({
            text: textToProcess,
            maxLength: 200,
          });
          result = summaryResponse.data.summary;
          break;

        case 'improve':
          const improveResponse = await apiService.improveWriting({
            text: textToProcess,
            style: 'professional',
          });
          result = improveResponse.data.improved;
          break;

        case 'translate':
          const translateResponse = await apiService.translate({
            text: textToProcess,
            targetLanguage: 'English', // You can make this configurable
          });
          result = translateResponse.data.translated;
          break;

        case 'explain':
          const explainResponse = await apiService.explain({
            text: textToProcess,
          });
          result = explainResponse.data.explanation;
          break;

        default:
          throw new Error('Unknown action');
      }

      // Insert result at cursor or replace selection
      insertAIResult(result);
      onClose();
    } catch (err: any) {
      console.error('AI action failed:', err);
      setError(err.message || 'Failed to process your request');
    } finally {
      setIsProcessing(false);
    }
  }, [editor, getSelectedText, insertAIResult, onClose]);

  const handleCustomPrompt = useCallback(async () => {
    if (!customPrompt.trim()) return;

    setIsProcessing(true);
    setError(null);

    try {
      const selectedText = getSelectedText();
      const context = selectedText || editor.getHTML();

      const response = await apiService.sendMessage({
        message: customPrompt,
        action: 'chat',
        context: context,
      });

      insertAIResult(response.data.response);
      setCustomPrompt('');
      onClose();
    } catch (err: any) {
      console.error('Custom prompt failed:', err);
      setError(err.message || 'Failed to process your request');
    } finally {
      setIsProcessing(false);
    }
  }, [customPrompt, editor, getSelectedText, insertAIResult, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-2xl w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">AI Assistant</h3>
              <p className="text-sm text-muted-foreground">
                Enhance your content with AI-powered tools
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            disabled={isProcessing}
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {AI_ACTIONS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleAIAction(item.action)}
              disabled={isProcessing}
              className="flex flex-col items-start gap-2 p-4 border-2 border-border rounded-xl hover:border-primary hover:bg-muted/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{item.icon}</span>
                <span className="font-semibold text-foreground">{item.label}</span>
              </div>
              <span className="text-xs text-muted-foreground">{item.description}</span>
            </button>
          ))}
        </div>

        {/* Custom Prompt */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            Or describe what you want:
          </label>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="E.g., 'Make this more professional', 'Add examples', 'Simplify this'"
            className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground resize-none"
            rows={3}
            disabled={isProcessing}
          />
          <button
            onClick={handleCustomPrompt}
            disabled={!customPrompt.trim() || isProcessing}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Generate</span>
              </>
            )}
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Tip:</strong> Select text in the editor before using AI actions for better results
          </p>
        </div>
      </div>
    </div>
  );
};