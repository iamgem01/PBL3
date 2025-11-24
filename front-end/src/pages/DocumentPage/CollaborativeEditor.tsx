import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { useYjs } from '@/hooks/useYjs';
import { useCollaboration } from '@/hooks/useCollaboration';
import { EditorToolbar } from './EditorToolbar';
import { PresenceIndicator } from '../../components/PresenceIndicator';
import { CursorOverlay } from '../../components/collaboration/CursorOverlay';
import { SelectionHighlight } from '../../components/collaboration/SelectionHighlight';
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
  // ✅ FIXED: Đảm bảo thứ tự hook ổn định
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'offline'>('connecting');
  const [collaborationReady, setCollaborationReady] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorInitializedRef = useRef(false);
  const initAttemptRef = useRef(0);
  const editorRef = useRef<Editor | null>(null);

  const MAX_INIT_ATTEMPTS = 3;

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

  const { 
    doc, 
    users, 
    updateAwareness, 
    yjsService, 
    awareness, 
    provider, 
    isSynced, 
    persistenceReady 
  } = useYjs(documentId, isShared);

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

  useEffect(() => {
    if (isShared && doc && yjsService && persistenceReady && awareness) {
      console.log('✅ All collaboration conditions met');
      setCollaborationReady(true);
    } else {
      setCollaborationReady(false);
    }
  }, [isShared, doc, yjsService, persistenceReady, awareness]);

  const handleContentChange = useCallback((content: string) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      onContentChange?.(content);
    }, DEBOUNCE_DELAY);
  }, [onContentChange]);

  const extensions = useMemo(() => {
    try {
      const base: any[] = [
        StarterKit.configure({ 
          history: isShared ? false : undefined
        }),
        Placeholder.configure({ placeholder: 'Start writing...' }),
        Underline,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        TextStyle,
        Color,
      ];

      if (isShared && doc && persistenceReady) {
        console.log('✅ Adding Collaboration extension (basic mode)');
        base.push(Collaboration.configure({ 
          document: doc 
        }));
      }
      
      return base;
    } catch (error) {
      console.error('❌ Error setting up extensions:', error);
      setEditorError('Failed to initialize editor extensions');
      return [];
    }
  }, [isShared, doc, persistenceReady]);

  const editor = useEditor({
    extensions,
    content: initialContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      handleContentChange(editor.getHTML());
    },
    onCreate: ({ editor }) => {
      console.log('✅ Editor created successfully');
      editorInitializedRef.current = true;
      editorRef.current = editor;
      setEditorError(null);
    },
    onDestroy: () => {
      console.log('🔌 Editor destroyed');
      editorInitializedRef.current = false;
      editorRef.current = null;
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none min-h-[600px] focus:outline-none px-8 py-12 mx-auto'
      }
    }
  }, [extensions]);

  // ⭐ NEW: Hook tích hợp STOMP cho cursor/selection
  const { cursorUsers, isConnected: stompConnected } = useCollaboration({
    noteId: documentId,
    isShared,
    editor: editorRef.current,
  });

  // FIXED: Improved editor ready check với retry logic và ổn định hơn
  useEffect(() => {
    let mounted = true;

    const checkEditorReady = () => {
      if (!mounted) return;

      if (isShared) {
        const ready = !!doc && !!yjsService && persistenceReady && editorInitializedRef.current && collaborationReady;
        console.log('🔄 Editor ready check:', { 
          doc: !!doc, 
          yjsService: !!yjsService, 
          persistenceReady, 
          editorInitialized: editorInitializedRef.current,
          collaborationReady,
          ready,
          attempt: initAttemptRef.current
        });
        
        if (ready) {
          setIsEditorReady(true);
          setEditorError(null);
        } else if (initAttemptRef.current < MAX_INIT_ATTEMPTS) {
          initAttemptRef.current += 1;
          // Retry after delay
          setTimeout(checkEditorReady, 1000 * initAttemptRef.current);
        } else {
          console.warn('⚠️ Editor initialization timeout after max attempts');
          // Vẫn hiển thị editor ngay cả khi collaboration chưa ready
          if (editorInitializedRef.current && editor) {
            setIsEditorReady(true);
          }
        }
      } else {
        // Local mode - chỉ cần editor
        setIsEditorReady(!!editor);
      }
    };

    // Delay check để tránh race condition
    const timeoutId = setTimeout(checkEditorReady, 100);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [doc, yjsService, isShared, persistenceReady, editor, collaborationReady]);

  // Cleanup effect
  useEffect(() => () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    editorInitializedRef.current = false;
    initAttemptRef.current = 0;
  }, []);

  // Error boundary fallback
  if (editorError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 h-full">
        <div className="text-center text-red-500">
          <p className="text-lg font-medium">Editor Error</p>
          <p className="text-sm mt-2">{editorError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

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
      {/* ✅ FIXED: Chỉ hiển thị presence, BỎ typing indicator */}
      {isShared && users.length > 0 && (
        <div className="border-b border-border bg-blue-50 dark:bg-blue-900/20">
          <PresenceIndicator users={users} />
        </div>
      )}
      
      <EditorToolbar editor={editor} />
      
      <div className="flex-1 overflow-auto relative">
        <div className="max-w-4xl mx-auto relative">
          {/* ✅ Overlays với vibrant colors */}
          {isShared && editor && cursorUsers.length > 0 && (
            <>
              <SelectionHighlight users={cursorUsers} editor={editor} />
              <CursorOverlay users={cursorUsers} editor={editor} />
            </>
          )}
          
          <EditorContent editor={editor} />
        </div>
      </div>
      
      <div className="border-t border-border bg-muted/30 px-6 py-2">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{isShared ? '🟢 Collaborative Mode' : '🔵 Local Mode'}</span>
            <ConnectionStatus />
            {isShared && (
              <>
                <span>Collaboration: {collaborationReady ? '✅ Ready' : '⏳ Loading'}</span>
                {stompConnected && <span className="text-green-600">• Cursor tracking active</span>}
              </>
            )}
          </div>
          <span>{editor.storage.characterCount?.characters() || 0} characters</span>
        </div>
      </div>
    </div>
  );
});

CollaborativeEditor.displayName = 'CollaborativeEditor';