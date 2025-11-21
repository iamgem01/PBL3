// CollaborativeEditor-optimized.tsx
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { useYjs } from '@/hooks/useYjs';
import { EditorToolbar } from './EditorToolbar';
import { PresenceIndicator } from '../../components/PresenceIndicator';
import { useEffect, useState, useCallback, memo } from 'react';

// Custom debounce implementation để tránh phụ thuộc lodash
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), wait);
  };
};

// Tách riêng component loading để tránh re-render
const EditorLoading = memo(() => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    <div className="text-center">
      <p className="text-lg font-medium text-foreground">Initializing editor...</p>
      <p className="text-sm text-muted-foreground mt-1">
        Loading rich text editor components
      </p>
    </div>
  </div>
));

interface CollaborativeEditorProps {
  documentId: string;
  isShared: boolean;
  initialContent?: string;
  onContentChange?: (content: string) => void;
}

export const CollaborativeEditor = ({
  documentId,
  isShared,
  initialContent,
  onContentChange,
}: CollaborativeEditorProps) => {
  const { doc, users, updateAwareness, yjsService } = useYjs(documentId, isShared);
  const [isEditorReady, setIsEditorReady] = useState(false);

  // Debounce content changes để tránh re-render liên tục
  const debouncedContentChange = useCallback(
    debounce((content: string) => {
      onContentChange?.(content);
    }, 500),
    [onContentChange]
  );

  // Tối ưu hóa selection updates
  const handleSelectionUpdate = useCallback(
    ({ editor }: { editor: Editor }) => {
      if (!isShared || !yjsService) return;
      
      const { from, to } = editor.state.selection;
      updateAwareness(
        { pos: from },
        { from, to }
      );
    },
    [isShared, yjsService, updateAwareness]
  );

  // Tối ưu hóa editor configuration
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Tắt history khi collaboration để tránh xung đột
        history: isShared ? undefined : {},
        dropcursor: false, // Có thể tắt nếu không cần
      }),
      ...(isShared && doc ? [
        Collaboration.configure({
          document: doc,
        }),
        CollaborationCursor.configure({
          provider: {
            awareness: yjsService?.getAwareness()!,
          },
          user: {
            name: 'Current User',
            color: '#f783ac',
          },
        })
      ] : []),
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
    ],
    content: initialContent || '<p></p>',
    immediatelyRender: false,
    onUpdate: ({ editor }: { editor: Editor }) => {
      debouncedContentChange(editor.getHTML());
    },
    onSelectionUpdate: handleSelectionUpdate,
    editable: true,
    // Thêm các tùy chọn performance
    enableInputRules: true,
    enablePasteRules: true,
    injectCSS: true,
  });

  // Đảm bảo Yjs document đã sẵn sàng trước khi khởi tạo editor
  useEffect(() => {
    if (doc && yjsService) {
      setIsEditorReady(true);
    } else {
      setIsEditorReady(false);
    }
  }, [doc, yjsService]);

  // Cleanup optimizations
  useEffect(() => {
    return () => {
      // Cleanup debounce
      const cleanupDebounce = () => {
        // Custom cleanup cho debounce
      };
      cleanupDebounce();
      
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  if (!isEditorReady && isShared) {
    return <EditorLoading />;
  }

  if (!editor) {
    return <EditorLoading />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Presence Indicator */}
      {isShared && (
        <div className="border-b border-border p-3 bg-muted/30">
          <PresenceIndicator users={users} />
        </div>
      )}
      
      {/* Toolbar */}
      <EditorToolbar editor={editor} />
      
      {/* Editor Content với các optimization */}
      <div className="flex-1 overflow-auto p-8">
        <EditorContent 
          editor={editor} 
          className="prose prose-lg max-w-none min-h-[500px] focus:outline-none"
          // Thêm attributes để tối ưu hóa render
          style={{ 
            contain: 'content',
            willChange: 'auto'
          }}
        />
        
        {/* Editor Status */}
        <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
          <div className="flex justify-between items-center">
            <span>
              {isShared ? '🟢 Collaborative Mode' : '🔵 Local Mode'}
            </span>
            <span>
              {editor.storage.characterCount?.characters()} characters •{' '}
              {editor.storage.characterCount?.words()} words
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};