import { Editor } from '@tiptap/react';
import {
  Bold, 
  Italic,
  Underline,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Highlighter
} from 'lucide-react';
import { memo, useCallback } from 'react';

interface EditorToolbarProps {
  editor: Editor;
}

export const EditorToolbar = memo(({ editor }: EditorToolbarProps) => {
  const textColors = [
    '#000000', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'
  ];

  if (!editor) return null;

  const handleUndo = useCallback(() => {
    editor.chain().focus().undo().run();
  }, [editor]);

  const handleRedo = useCallback(() => {
    editor.chain().focus().redo().run();
  }, [editor]);

  const handleBold = useCallback(() => {
    editor.chain().focus().toggleBold().run();
  }, [editor]);

  const handleItalic = useCallback(() => {
    editor.chain().focus().toggleItalic().run();
  }, [editor]);

  const handleUnderline = useCallback(() => {
    editor.chain().focus().toggleUnderline().run();
  }, [editor]);

  const handleStrike = useCallback(() => {
    editor.chain().focus().toggleStrike().run();
  }, [editor]);

  const handleCode = useCallback(() => {
    editor.chain().focus().toggleCode().run();
  }, [editor]);

  const handleBulletList = useCallback(() => {
    editor.chain().focus().toggleBulletList().run();
  }, [editor]);

  const handleOrderedList = useCallback(() => {
    editor.chain().focus().toggleOrderedList().run();
  }, [editor]);

  const handleBlockquote = useCallback(() => {
    editor.chain().focus().toggleBlockquote().run();
  }, [editor]);

  const handleAlignLeft = useCallback(() => {
    editor.chain().focus().setTextAlign('left').run();
  }, [editor]);

  const handleAlignCenter = useCallback(() => {
    editor.chain().focus().setTextAlign('center').run();
  }, [editor]);

  const handleAlignRight = useCallback(() => {
    editor.chain().focus().setTextAlign('right').run();
  }, [editor]);

  const handleColorClick = useCallback((color: string) => {
    editor.chain().focus().setColor(color).run();
  }, [editor]);

  const handleHeadingChange = useCallback((level: string) => {
    if (level === 'paragraph') {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level: parseInt(level) as 1 | 2 | 3 | 4 | 5 | 6 }).run();
    }
  }, [editor]);

  return (
    <div className="border-b border-border bg-background p-3 sticky top-0 z-10 editor-toolbar">
      <div className="flex items-center gap-1 flex-wrap">
        {/* History */}
        <button
          onClick={handleUndo}
          disabled={!editor.can().chain().focus().undo().run()}
          className="p-2 hover:bg-muted rounded transition-colors"
          title="Undo"
        >
          <Undo size={18} />
        </button>
        <button
          onClick={handleRedo}
          disabled={!editor.can().chain().focus().redo().run()}
          className="p-2 hover:bg-muted rounded transition-colors"
          title="Redo"
        >
          <Redo size={18} />
        </button>

        <div className="w-px h-6 bg-border mx-2" />

        {/* Text Formatting */}
        <button
          onClick={handleBold}
          className={`p-2 rounded transition-colors ${
            editor.isActive('bold') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          }`}
          title="Bold"
        >
          <Bold size={18} />
        </button>
        <button
          onClick={handleItalic}
          className={`p-2 rounded transition-colors ${
            editor.isActive('italic') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          }`}
          title="Italic"
        >
          <Italic size={18} />
        </button>
        <button
          onClick={handleUnderline}
          className={`p-2 rounded transition-colors ${
            editor.isActive('underline') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          }`}
          title="Underline"
        >
          <Underline size={18} />
        </button>
        <button
          onClick={handleStrike}
          className={`p-2 rounded transition-colors ${
            editor.isActive('strike') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          }`}
          title="Strikethrough"
        >
          <Strikethrough size={18} />
        </button>
        <button
          onClick={handleCode}
          className={`p-2 rounded transition-colors ${
            editor.isActive('code') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          }`}
          title="Code"
        >
          <Code size={18} />
        </button>

        <div className="w-px h-6 bg-border mx-2" />

        {/* Lists */}
        <button
          onClick={handleBulletList}
          className={`p-2 rounded transition-colors ${
            editor.isActive('bulletList') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          }`}
          title="Bullet List"
        >
          <List size={18} />
        </button>
        <button
          onClick={handleOrderedList}
          className={`p-2 rounded transition-colors ${
            editor.isActive('orderedList') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          }`}
          title="Numbered List"
        >
          <ListOrdered size={18} />
        </button>
        <button
          onClick={handleBlockquote}
          className={`p-2 rounded transition-colors ${
            editor.isActive('blockquote') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          }`}
          title="Quote"
        >
          <Quote size={18} />
        </button>

        <div className="w-px h-6 bg-border mx-2" />

        {/* Alignment */}
        <button
          onClick={handleAlignLeft}
          className={`p-2 rounded transition-colors ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          }`}
          title="Align Left"
        >
          <AlignLeft size={18} />
        </button>
        <button
          onClick={handleAlignCenter}
          className={`p-2 rounded transition-colors ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          }`}
          title="Align Center"
        >
          <AlignCenter size={18} />
        </button>
        <button
          onClick={handleAlignRight}
          className={`p-2 rounded transition-colors ${
            editor.isActive({ textAlign: 'right' }) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          }`}
          title="Align Right"
        >
          <AlignRight size={18} />
        </button>

        <div className="w-px h-6 bg-border mx-2" />

        {/* Headings */}
        <select
          value={editor.getAttributes('heading').level || 'paragraph'}
          onChange={(e) => handleHeadingChange(e.target.value)}
          className="p-2 bg-background border border-border rounded text-sm"
        >
          <option value="paragraph">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>

        {/* Text Color */}
        <div className="relative group">
          <button className="p-2 hover:bg-muted rounded transition-colors" title="Text Color">
            <Palette size={18} />
          </button>
          <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-xl p-2 hidden group-hover:flex flex-wrap gap-1 w-32 z-50">
            {textColors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorClick(color)}
                className="w-6 h-6 rounded border border-border"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});