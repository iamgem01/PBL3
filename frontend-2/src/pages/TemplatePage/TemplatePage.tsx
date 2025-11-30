// src/pages/TemplatePage/TemplatePage.tsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Sparkles } from 'lucide-react';
import { TemplateManager } from '@/data/template';
import type { Template, TemplateCategory } from '@/data/template/type';
import { TemplateCard } from '@/components/template/TemplateCard';
import { createNote } from '@/services/noteService';
import { getCurrentUser } from '@/utils/authUtils';

export default function TemplatePage() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [isCreating, setIsCreating] = useState(false);

  const currentUser = getCurrentUser();
  const templateGroups = TemplateManager.getTemplateGroups();

  // Get templates based on filters
  const displayTemplates = useMemo(() => {
    let templates: Template[] = TemplateManager.getAllTemplates();

    // Filter by category
    if (selectedCategory !== 'all') {
      templates = templates.filter(t => t.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
      templates = TemplateManager.searchTemplates(searchQuery);
    }

    return templates;
  }, [selectedCategory, searchQuery]);

  // Get recent templates for this user
  const recentTemplates = useMemo(() => {
    return currentUser ? TemplateManager.getRecentTemplates(currentUser.id, 3) : [];
  }, [currentUser]);

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate || !currentUser) return;

    setIsCreating(true);
    try {
      const noteData = TemplateManager.createNoteFromTemplate(selectedTemplate, currentUser.id);
      const newNote = await createNote(noteData);
      
      TemplateManager.saveToRecent(currentUser.id, selectedTemplate.id);
      
      navigate(`/notes/${newNote.id}`);
    } catch (error: any) {
      console.error('Error creating note from template:', error);
      alert(`Failed to create document: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <>
      {/* Backdrop - che phủ toàn bộ màn hình */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={handleClose}
      />
      
      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-card border border-border rounded-2xl w-full max-w-7xl h-[85vh] flex flex-col shadow-2xl pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <header className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Choose Template</h1>
                <p className="text-sm text-muted-foreground">Start with a pre-built structure</p>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Close"
            >
              <X size={20} />
            </button>
          </header>

          {/* Main Content - Scrollable */}
          <main className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
            {/* Recent Templates Section */}
            {recentTemplates.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles size={18} className="text-blue-500" />
                  Recently Used
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {recentTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      selected={selectedTemplate?.id === template.id}
                      onSelect={setSelectedTemplate}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Search & Filters */}
            <div className="mb-6 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates by name or tags..."
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Category Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    selectedCategory === 'all' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                      : 'bg-background border border-border hover:bg-muted'
                  }`}
                >
                  All Categories
                </button>
                {templateGroups.map((group) => (
                  <button
                    key={group.category}
                    onClick={() => setSelectedCategory(group.category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      selectedCategory === group.category 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                        : 'bg-background border border-border hover:bg-muted'
                    }`}
                  >
                    {group.icon} {group.displayName}
                  </button>
                ))}
              </div>
            </div>

            {/* Templates Grid */}
            <section>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  {selectedCategory !== 'all' 
                    ? `${templateGroups.find(g => g.category === selectedCategory)?.displayName} Templates` 
                    : 'All Templates'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {displayTemplates.length} template{displayTemplates.length !== 1 ? 's' : ''} available
                </p>
              </div>

              {displayTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Search size={32} className="text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium text-foreground mb-1">No templates found</p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search or filters
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                  {displayTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      selected={selectedTemplate?.id === template.id}
                      onSelect={setSelectedTemplate}
                    />
                  ))}
                </div>
              )}
            </section>
          </main>

          {/* Footer - Fixed at bottom when template selected */}
          {selectedTemplate && (
            <div className="px-6 py-4 border-t border-border flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{selectedTemplate.icon}</div>
                <div>
                  <p className="text-sm text-muted-foreground">Selected template</p>
                  <p className="font-semibold text-foreground">{selectedTemplate.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFromTemplate}
                  disabled={isCreating}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isCreating ? 'Creating...' : 'Create Document'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}