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
import { useEffect, useState, useCallback, memo, useRef, useMemo } from 'react';

const DEBOUNCE_DELAY = 1000;

const EditorLoading = memo(() => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4 h-full">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    <div className="text-center">
      <p className="text-lg font-medium text-foreground">Initializing editor...</p>
      <p className="text-sm text-muted-foreground mt-2">Loading document content</p>
    </div>
  </div>
));

interface CollaborativeEditorProps {
  documentId: string;
  isShared: boolean;
  initialContent?: string;
  onContentChange?: (content: string) => void;
}

export const CollaborativeEditor = memo(({
  documentId,
  isShared,
  initialContent,
  onContentChange,
}: CollaborativeEditorProps) => {
  const { 
    doc, 
    users, 
    updateAwareness, 
    yjsService, 
    awareness, 
    provider, 
    isSynced,
    persistenceReady // ✅ Nhận thêm trạng thái persistence
  } = useYjs(documentId, isShared);
  
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'offline'>('connecting');
  
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentUser = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return {
        id: user.id || 'user_' + Math.random().toString(36).slice(2,9),
        name: user.name || 'User',
        email: user.email || 'user@example.com',
        color: user.color || '#f783ac',
      };
    } catch { 
      return { 
        id: 'user_' + Math.random().toString(36).slice(2,9),
        name: 'Anonymous', 
        email: 'user@example.com',
        color: '#f783ac' 
      }; 
    }
  }, []);

  useEffect(() => {
    if (!isShared) {
      setConnectionStatus('offline');
      return;
    }
    const check = () => setConnectionStatus(provider?.wsconnected ? 'connected' : 'disconnected');
    const interval = setInterval(check, 1000);
    check();
    return () => clearInterval(interval);
  }, [provider, isShared]);

  const handleContentChange = useCallback((content: string) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      onContentChange?.(content);
    }, DEBOUNCE_DELAY);
  }, [onContentChange]);

  const extensions = useMemo(() => {
    const base: any[] = [
      StarterKit.configure({ 
        history: isShared ? false : undefined // Disable history for shared docs (Yjs handles it)
      }),
      Placeholder.configure({ placeholder: 'Start writing...' }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
    ];

    // ✅ QUAN TRỌNG: Chỉ thêm collaboration khi persistence đã ready
    if (isShared && doc && provider && persistenceReady) {
      console.log('✅ Adding Collaboration extension');
      base.push(Collaboration.configure({ 
        document: doc 
      }));
    }

    // ✅ QUAN TRỌNG: Chỉ thêm collaboration cursor khi tất cả đã sẵn sàng
    if (isShared && doc && provider && awareness && isSynced && persistenceReady) {
      console.log('✅ Adding CollaborationCursor extension');
      base.push(CollaborationCursor.configure({ 
        provider, 
        user: currentUser 
      }));
    }
    
    return base;
  }, [isShared, doc, provider, awareness, currentUser, isSynced, persistenceReady]);

  const editor = useEditor({
    extensions,
    content: initialContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      handleContentChange(editor.getHTML());
      if (isShared && updateAwareness) {
         const { from, to } = editor.state.selection;
         updateAwareness({ pos: from }, { from, to });
      }
    },
    editorProps: {
        attributes: {
            class: 'prose prose-lg max-w-none min-h-[600px] focus:outline-none px-8 py-12 mx-auto'
        }
    }
  }, [extensions]);

  // ✅ FIX: Chỉ set editor ready khi persistence đã sync
  useEffect(() => {
    if (isShared) {
      const ready = !!doc && !!yjsService && persistenceReady;
      console.log('🔄 Editor ready check:', { doc: !!doc, yjsService: !!yjsService, persistenceReady, ready });
      setIsEditorReady(ready);
    } else {
      setIsEditorReady(true);
    }
  }, [doc, yjsService, isShared, persistenceReady]);

  // Cleanup timeout on unmount
  useEffect(() => () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
  }, []);

  if (!isEditorReady || !editor) {
    console.log('⏳ Editor not ready:', { isEditorReady, editor: !!editor });
    return <EditorLoading />;
  }

  const ConnectionStatus = () => {
    if (!isShared) return null;
    const config = {
      connecting: { color: 'bg-yellow-500', text: 'Connecting...' },
      connected: { color: 'bg-green-500', text: 'Connected' },
      disconnected: { color: 'bg-red-500', text: 'Reconnecting...' },
      offline: { color: 'bg-gray-500', text: 'Offline' },
    };
    const current = config[connectionStatus];
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className={`w-2 h-2 rounded-full ${current.color}`}></div>
        <span>{current.text}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {isShared && users.length > 0 && (
        <div className="border-b border-border bg-blue-50 dark:bg-blue-900/20">
          <PresenceIndicator users={users} />
        </div>
      )}
      
      <EditorToolbar editor={editor} />
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <EditorContent editor={editor} />
        </div>
      </div>
      
      <div className="border-t border-border bg-muted/30 px-6 py-2">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{isShared ? '🟢 Collaborative Mode' : '🔵 Local Mode'}</span>
            <ConnectionStatus />
            {isShared && (
              <span>Persistence: {persistenceReady ? '✅ Ready' : '⏳ Loading'}</span>
            )}
          </div>
          <span>{editor.storage.characterCount?.characters() || 0} characters</span>
        </div>
      </div>
    </div>
  );
});

CollaborativeEditor.displayName = 'CollaborativeEditor';