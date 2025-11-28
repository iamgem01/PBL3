import React, { useState, useRef, useEffect } from 'react';
import { Share2, MessageSquare, User, Globe, Bold, Italic, Underline, Strikethrough, Link, Type, FileText, Plus, ListTodo, Heading1, Heading2, CheckSquare } from 'lucide-react';

interface ContentBlock {
  id: string;
  type: 'paragraph' | 'heading1' | 'heading2' | 'checklist' | 'todo' | 'bulletlist' | 'numberedlist';
  content: string;
  items?: { id: string; text: string; checked: boolean }[];
}

interface SelectionToolbar {
  show: boolean;
  x: number;
  y: number;
}

export default function TravelPlanner() {
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    {
      id: '1',
      type: 'heading1',
      content: 'Travel Planner',
    },
    {
      id: '2',
      type: 'paragraph',
      content: 'Expand each category below by clicking the ▶ to use your packing checklist!',
    },
    {
      id: '3',
      type: 'checklist',
      content: 'Essentials 📋',
      items: [
        { id: '1', text: 'Passport 🛂', checked: false },
        { id: '2', text: 'Boarding pass / Tickets', checked: false },
        { id: '3', text: 'Wallet (cash + cards)', checked: false },
        { id: '4', text: 'Phone + charger', checked: false },
        { id: '5', text: 'Travel insurance documents', checked: false },
        { id: '6', text: 'Keys', checked: false },
      ],
    },
  ]);

  const [noteName, setNoteName] = useState('Travel Planner');
  const [isEditingName, setIsEditingName] = useState(false);
  const [sidebarCollapsed] = useState(false);
  const [, setFocusedBlock] = useState<string | null>(null);
  const [showSlashMenu, setShowSlashMenu] = useState<{ blockId: string; show: boolean }>({ blockId: '', show: false });
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [selectionToolbar, setSelectionToolbar] = useState<SelectionToolbar>({
    show: false,
    x: 0,
    y: 0,
  });

  const contentRef = useRef<HTMLDivElement>(null);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setSelectionToolbar({
        show: true,
        x: rect.left + rect.width / 2,
        y: rect.top + window.scrollY - 50,
      });
    } else {
      setSelectionToolbar({ show: false, x: 0, y: 0 });
    }
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('selectionchange', () => {
      const selection = window.getSelection();
      if (!selection || selection.toString().length === 0) {
        setSelectionToolbar({ show: false, x: 0, y: 0 });
      }
    });

    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
    };
  }, []);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNoteName(e.target.value);
  };

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (noteName.trim() === '') {
      setNoteName('Travel Planner');
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditingName(false);
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
      setNoteName('Travel Planner');
    }
  };

  const addBlock = (afterId: string, type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content: '',
      ...(type === 'checklist' || type === 'todo' ? { items: [] } : {}),
    };

    const index = contentBlocks.findIndex(b => b.id === afterId);
    const newBlocks = [...contentBlocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setContentBlocks(newBlocks);
    setShowSlashMenu({ blockId: '', show: false });
  };

  const updateBlockContent = (id: string, content: string) => {
    setContentBlocks(prev =>
      prev.map(block => (block.id === id ? { ...block, content } : block))
    );
  };

  const updateBlockType = (id: string, type: ContentBlock['type']) => {
    setContentBlocks(prev =>
      prev.map(block => {
        if (block.id === id) {
          return {
            ...block,
            type,
            ...(type === 'checklist' || type === 'todo' ? { items: block.items || [] } : {}),
          };
        }
        return block;
      })
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent, blockId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addBlock(blockId, 'paragraph');
    } else if (e.key === '/' && (e.target as HTMLInputElement).value === '') {
      e.preventDefault();
      setShowSlashMenu({ blockId, show: true });
    }
  };

  const toggleCheckItem = (blockId: string, itemId: string) => {
    setContentBlocks(prev =>
      prev.map(block => {
        if (block.id === blockId && block.items) {
          return {
            ...block,
            items: block.items.map(item =>
              item.id === itemId ? { ...item, checked: !item.checked } : item
            ),
          };
        }
        return block;
      })
    );
  };

  const addItemToBlock = (blockId: string) => {
    setContentBlocks(prev =>
      prev.map(block => {
        if (block.id === blockId && block.items) {
          const newItem = { id: Date.now().toString(), text: '', checked: false };
          return {
            ...block,
            items: [...block.items, newItem],
          };
        }
        return block;
      })
    );
  };

  const updateItemText = (blockId: string, itemId: string, text: string) => {
    setContentBlocks(prev =>
      prev.map(block => {
        if (block.id === blockId && block.items) {
          return {
            ...block,
            items: block.items.map(item =>
              item.id === itemId ? { ...item, text } : item
            ),
          };
        }
        return block;
      })
    );
  };

  const renderBlock = (block: ContentBlock) => {

    return (
      <div
        key={block.id}
        className="group relative"
        onFocus={() => setFocusedBlock(block.id)}
        onBlur={() => setFocusedBlock(null)}
      >
        {/* Block Actions */}
        <div className="absolute -left-12 top-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <button
            onClick={() => addBlock(block.id, 'paragraph')}
            className="w-6 h-6 hover:bg-gray-200 rounded flex items-center justify-center text-gray-400 hover:text-gray-600"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button className="w-6 h-6 hover:bg-gray-200 rounded flex items-center justify-center text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
              <circle cx="3" cy="8" r="1.5"/>
              <circle cx="8" cy="8" r="1.5"/>
              <circle cx="13" cy="8" r="1.5"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="min-h-[32px]">
          {block.type === 'heading1' && (
            <input
              type="text"
              value={block.content}
              onChange={(e) => updateBlockContent(block.id, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, block.id)}
              placeholder="Heading 1"
              className="w-full text-4xl font-bold outline-none bg-transparent"
            />
          )}

          {block.type === 'heading2' && (
            <input
              type="text"
              value={block.content}
              onChange={(e) => updateBlockContent(block.id, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, block.id)}
              placeholder="Heading 2"
              className="w-full text-2xl font-bold outline-none bg-transparent"
            />
          )}

          {block.type === 'paragraph' && (
            <div className="relative">
              <input
                type="text"
                value={block.content}
                onChange={(e) => updateBlockContent(block.id, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, block.id)}
                placeholder="Type '/' for commands"
                className="w-full text-base outline-none bg-transparent"
              />
              {showSlashMenu.show && showSlashMenu.blockId === block.id && (
                <div className="absolute left-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 min-w-[240px]">
                  <button
                    onClick={() => {
                      updateBlockType(block.id, 'heading1');
                      setShowSlashMenu({ blockId: '', show: false });
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 rounded flex items-center gap-3"
                  >
                    <Heading1 className="w-4 h-4" />
                    <div>
                      <div className="text-sm font-medium">Heading 1</div>
                      <div className="text-xs text-gray-500">Big section heading</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      updateBlockType(block.id, 'heading2');
                      setShowSlashMenu({ blockId: '', show: false });
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 rounded flex items-center gap-3"
                  >
                    <Heading2 className="w-4 h-4" />
                    <div>
                      <div className="text-sm font-medium">Heading 2</div>
                      <div className="text-xs text-gray-500">Medium section heading</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      updateBlockType(block.id, 'checklist');
                      addItemToBlock(block.id);
                      setShowSlashMenu({ blockId: '', show: false });
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 rounded flex items-center gap-3"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <div>
                      <div className="text-sm font-medium">Checklist</div>
                      <div className="text-xs text-gray-500">Track tasks with checkboxes</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      updateBlockType(block.id, 'todo');
                      addItemToBlock(block.id);
                      setShowSlashMenu({ blockId: '', show: false });
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 rounded flex items-center gap-3"
                  >
                    <ListTodo className="w-4 h-4" />
                    <div>
                      <div className="text-sm font-medium">Todo List</div>
                      <div className="text-xs text-gray-500">Track to-do items</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}

          {(block.type === 'checklist' || block.type === 'todo') && (
            <div>
              {block.content && (
                <input
                  type="text"
                  value={block.content}
                  onChange={(e) => updateBlockContent(block.id, e.target.value)}
                  placeholder="List title"
                  className="w-full text-lg font-semibold outline-none bg-transparent mb-3"
                />
              )}
              <div className="space-y-2">
                {block.items?.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleCheckItem(block.id, item.id)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => updateItemText(block.id, item.id, e.target.value)}
                      placeholder="Item"
                      className={`flex-1 bg-transparent outline-none ${
                        item.checked ? 'line-through text-gray-400' : 'text-gray-700'
                      }`}
                    />
                  </div>
                ))}
                <button
                  onClick={() => addItemToBlock(block.id)}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2 pl-7"
                >
                  <Plus className="w-3 h-3" />
                  Add item
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-600" />
              {isEditingName ? (
                <input
                  ref={nameInputRef}
                  type="text"
                  value={noteName}
                  onChange={handleNameChange}
                  onBlur={handleNameBlur}
                  onKeyDown={handleNameKeyDown}
                  className="text-gray-600 bg-transparent border-b border-blue-500 outline-none px-1"
                />
              ) : (
                <span
                  className="text-gray-600 cursor-pointer hover:text-gray-900 transition-colors"
                  onClick={() => setIsEditingName(true)}
                >
                  {noteName}
                </span>
              )}
            </div>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded flex items-center gap-1">
              <Globe className="w-3 h-3" />
              Private
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button className="w-8 h-8 hover:bg-gray-100 rounded flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </button>
            <button className="w-8 h-8 hover:bg-gray-100 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 16 16">
                <circle cx="3" cy="8" r="1.5"/>
                <circle cx="8" cy="8" r="1.5"/>
                <circle cx="13" cy="8" r="1.5"/>
              </svg>
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8" ref={contentRef}>
          {/* Selection Toolbar */}
          {selectionToolbar.show && (
            <div
              className="fixed z-50 bg-gray-900 text-white rounded-lg shadow-2xl px-2 py-1.5 flex items-center gap-1"
              style={{
                left: `${selectionToolbar.x}px`,
                top: `${selectionToolbar.y}px`,
                transform: 'translateX(-50%)',
              }}
            >
              <button className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center transition-colors">
                <Type className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center transition-colors">
                <Bold className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center transition-colors">
                <Italic className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center transition-colors">
                <Underline className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center transition-colors">
                <Strikethrough className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-600 mx-1"></div>
              <button className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center transition-colors">
                <Link className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 hover:bg-gray-700 rounded flex items-center justify-center transition-colors">
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Hero Image */}
          <div className="relative mb-8 rounded-2xl overflow-hidden shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=400&fit=crop"
              alt="Travel landmarks"
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <button className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-xl transition-all">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L4.5 20.5l.75-8.5L12 2z"/>
                <path d="M12 2l7.5 18.5-.75-8.5L12 2z"/>
                <path d="M5.25 12l6.75 8.5L19.5 12H5.25z"/>
              </svg>
            </button>
          </div>

          {/* Content Blocks */}
          <div className="space-y-2 pl-12">
            {contentBlocks.map(block => renderBlock(block))}
          </div>
        </main>
      </div>
    </div>
  );
}