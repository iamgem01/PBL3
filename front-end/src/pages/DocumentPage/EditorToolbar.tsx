import { Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline, Strikethrough, Code,
  List, ListOrdered, Quote, Undo, Redo,
  AlignLeft, AlignCenter, AlignRight, Palette, Sparkles,
  X, ChevronDown
} from 'lucide-react';
import { memo, useState, useEffect } from 'react';
import { AIBubbleMenu } from '../../components/editor/AIBubbleMenu'; // Import component mới

// --- CUSTOM HOOK: Bắt dính trạng thái Editor ---
const useEditorState = (editor: Editor | null) => {
  const [state, setState] = useState({
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrike: false,
    isCode: false,
    isBulletList: false,
    isOrderedList: false,
    isBlockquote: false,
    align: 'left',
    headingLevel: 'paragraph',
    canUndo: false,
    canRedo: false,
    hasSelection: false, // Thêm trạng thái có text được select
  });

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      // Safely check for undo/redo availability
      let canUndo = false;
      let canRedo = false;
      try {
        canUndo = editor.can().undo();
        canRedo = editor.can().redo();
      } catch (e) {
        // History extension not available
      }

      // Logic Heading
      let currentHeading = 'paragraph';
      if (editor.isActive('heading', { level: 1 })) currentHeading = '1';
      else if (editor.isActive('heading', { level: 2 })) currentHeading = '2';
      else if (editor.isActive('heading', { level: 3 })) currentHeading = '3';

      // Logic Align
      let currentAlign = 'left';
      if (editor.isActive({ textAlign: 'center' })) currentAlign = 'center';
      else if (editor.isActive({ textAlign: 'right' })) currentAlign = 'right';

      // Check if text is selected
      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;

      setState({
        isBold: editor.isActive('bold'),
        isItalic: editor.isActive('italic'),
        isUnderline: editor.isActive('underline'),
        isStrike: editor.isActive('strike'),
        isCode: editor.isActive('code'),
        isBulletList: editor.isActive('bulletList'),
        isOrderedList: editor.isActive('orderedList'),
        isBlockquote: editor.isActive('blockquote'),
        align: currentAlign,
        headingLevel: currentHeading,
        canUndo,
        canRedo,
        hasSelection,
      });
    };

    handleUpdate();
    editor.on('selectionUpdate', handleUpdate);
    editor.on('transaction', handleUpdate);
    editor.on('focus', handleUpdate);

    return () => {
      editor.off('selectionUpdate', handleUpdate);
      editor.off('transaction', handleUpdate);
      editor.off('focus', handleUpdate);
    };
  }, [editor]);

  return state;
};

interface EditorToolbarProps {
  editor: Editor;
}

export const EditorToolbar = memo(({ editor }: EditorToolbarProps) => {
  const selectionState = useEditorState(editor);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showAIMenu, setShowAIMenu] = useState(false);

  if (!editor) return null;

  // --- HANDLERS ---
  
  const handleHeadingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    const value = e.target.value;
    if (value === 'paragraph') {
      editor.chain().focus().setParagraph().run();
    } else {
      const level = parseInt(value) as 1 | 2 | 3;
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };

  const handleList = (type: 'bullet' | 'ordered') => {
    if (type === 'bullet') editor.chain().focus().toggleBulletList().run();
    else editor.chain().focus().toggleOrderedList().run();
  };

  const handleAlign = (align: string) => {
    editor.chain().focus().setTextAlign(align).run();
  };

  const handleColorChange = (color: string) => {
    editor.chain().focus().setColor(color).run();
    setShowColorPicker(false);
  };

  // AI Button Handler
  const handleAIClick = () => {
    // Nếu không có text được select, focus vào editor trước
    if (!selectionState.hasSelection) {
      editor.commands.focus();
      // Có thể thêm tooltip hoặc notification
      return;
    }
    setShowAIMenu(true);
  };

  const colors = ['#000000', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'];

  // UI Button Wrapper
  const ToolButton = ({ icon: Icon, onClick, active, disabled, title }: any) => (
    <button
      onClick={(e) => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      title={title}
      type="button"
      className={`
        relative p-2 rounded-md transition-all duration-200 flex items-center justify-center
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-muted'}
        ${active 
          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800 shadow-sm scale-105 z-10' 
          : 'text-muted-foreground hover:text-foreground'
        }
      `}
    >
      <Icon size={18} strokeWidth={active ? 2.5 : 2} />
    </button>
  );

  return (
    <>
      <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-1 px-4 py-2 flex-wrap">
          {/* AI Button - Notion Style */}
          <button 
            onClick={handleAIClick}
            disabled={!selectionState.hasSelection}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-md font-medium text-sm
              transition-all duration-200 mr-2
              ${selectionState.hasSelection
                ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }
            `}
            title={selectionState.hasSelection ? 'AI Actions (Select text first)' : 'Select text to use AI'}
          >
            <Sparkles size={14} />
            <span>AI</span>
          </button>

          <div className="w-px h-5 bg-border mx-1" />

          <ToolButton icon={Undo} onClick={() => editor.chain().focus().undo().run()} disabled={!selectionState.canUndo} title="Undo (Ctrl+Z)" />
          <ToolButton icon={Redo} onClick={() => editor.chain().focus().redo().run()} disabled={!selectionState.canRedo} title="Redo (Ctrl+Y)" />

          <div className="w-px h-5 bg-border mx-1" />

          {/* HEADING DROPDOWN */}
          <div className="relative group">
            <select
              value={selectionState.headingLevel}
              onChange={handleHeadingChange}
              className="appearance-none pl-2 pr-8 py-1.5 text-sm border border-transparent hover:bg-muted rounded-md bg-transparent text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium w-32 transition-colors"
            >
              <option value="paragraph">Paragraph</option>
              <option value="1">Heading 1</option>
              <option value="2">Heading 2</option>
              <option value="3">Heading 3</option>
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
          </div>

          <div className="w-px h-5 bg-border mx-1" />

          {/* BASIC FORMATTING */}
          <ToolButton icon={Bold} onClick={() => editor.chain().focus().toggleBold().run()} active={selectionState.isBold} title="Bold (Ctrl+B)" />
          <ToolButton icon={Italic} onClick={() => editor.chain().focus().toggleItalic().run()} active={selectionState.isItalic} title="Italic (Ctrl+I)" />
          <ToolButton icon={Underline} onClick={() => editor.chain().focus().toggleUnderline().run()} active={selectionState.isUnderline} title="Underline (Ctrl+U)" />
          <ToolButton icon={Strikethrough} onClick={() => editor.chain().focus().toggleStrike().run()} active={selectionState.isStrike} title="Strikethrough" />
          <ToolButton icon={Code} onClick={() => editor.chain().focus().toggleCode().run()} active={selectionState.isCode} title="Code" />

          <div className="w-px h-5 bg-border mx-1" />

          {/* LISTS */}
          <ToolButton icon={List} onClick={() => handleList('bullet')} active={selectionState.isBulletList} title="Bullet List" />
          <ToolButton icon={ListOrdered} onClick={() => handleList('ordered')} active={selectionState.isOrderedList} title="Numbered List" />
          <ToolButton icon={Quote} onClick={() => editor.chain().focus().toggleBlockquote().run()} active={selectionState.isBlockquote} title="Quote" />

          <div className="w-px h-5 bg-border mx-1" />

          <ToolButton icon={AlignLeft} onClick={() => handleAlign('left')} active={selectionState.align === 'left'} title="Align Left" />
          <ToolButton icon={AlignCenter} onClick={() => handleAlign('center')} active={selectionState.align === 'center'} title="Align Center" />
          <ToolButton icon={AlignRight} onClick={() => handleAlign('right')} active={selectionState.align === 'right'} title="Align Right" />

          <div className="w-px h-5 bg-border mx-1" />

          {/* COLOR PICKER */}
          <div className="relative">
            <ToolButton icon={Palette} onClick={() => setShowColorPicker(!showColorPicker)} active={showColorPicker} title="Text Color" />
            {showColorPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowColorPicker(false)} />
                <div className="absolute top-full right-0 mt-2 p-3 bg-popover border border-border rounded-lg shadow-xl flex gap-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  {colors.map((color) => (
                    <button 
                      key={color} 
                      onClick={() => handleColorChange(color)} 
                      className="w-6 h-6 rounded-full border border-border hover:scale-110 transition-transform" 
                      style={{ backgroundColor: color }} 
                      title={color} 
                    />
                  ))}
                  <button 
                    onClick={() => handleColorChange('inherit')} 
                    className="w-6 h-6 rounded-full border border-border hover:scale-110 transition-transform flex items-center justify-center bg-muted" 
                    title="Reset Color"
                  >
                    <X size={12} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* AI Bubble Menu */}
      <AIBubbleMenu 
        editor={editor} 
        isOpen={showAIMenu} 
        onClose={() => setShowAIMenu(false)} 
      />
    </>
  );
});

EditorToolbar.displayName = 'EditorToolbar';