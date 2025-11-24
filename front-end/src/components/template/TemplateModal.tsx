// src/components/template/TemplateModal.tsx
import { useState, useMemo } from 'react';
import { X, Search, Sparkles, Clock, TrendingUp } from 'lucide-react';
import { TemplateManager } from '@/data/template';
import type { Template, TemplateCategory } from '@/data/template/type';
import { TemplateCard } from './TemplateCard';
import { createNote } from '@/services/noteService';
import { getCurrentUser } from '@/utils/authUtils';
import { useNavigate } from 'react-router-dom';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TemplateModal({ isOpen, onClose }: TemplateModalProps) {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'popular'>('all');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [isCreating, setIsCreating] = useState(false);

  const currentUser = getCurrentUser();
  const templateGroups = TemplateManager.getTemplateGroups();

  // Get templates based on active tab
  const displayTemplates = useMemo(() => {
    let templates: Template[] = [];

    switch (activeTab) {
      case 'recent':
        templates = currentUser ? TemplateManager.getRecentTemplates(currentUser.id) : [];
        break;
      case 'popular':
        templates = TemplateManager.getPopularTemplates();
        break;
      default:
        templates = TemplateManager.getAllTemplates();
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      templates = templates.filter(t => t.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
      templates = TemplateManager.searchTemplates(searchQuery);
    }

    return templates;
  }, [activeTab, selectedCategory, searchQuery, currentUser]);

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate || !currentUser) return;

    setIsCreating(true);
    try {
      // Create note data from template
      const noteData = TemplateManager.createNoteFromTemplate(selectedTemplate, currentUser.id);
      
      // Call API to create note
      const newNote = await createNote(noteData);
      
      // Save to recent templates
      TemplateManager.saveToRecent(currentUser.id, selectedTemplate.id);
      
      // Close modal and navigate to new document
      onClose();
      navigate(`/notes/${newNote.id}`);
    } catch (error: any) {
      console.error('Error creating note from template:', error);
      alert(`Failed to create document: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Choose Template</h2>
              <p className="text-sm text-muted-foreground">Start with a pre-built structure</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="px-6 py-4 border-b border-border space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tabs & Categories */}
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {/* Quick Tabs */}
            <div className="flex gap-2 border-r border-border pr-4">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'all' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'hover:bg-muted'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'recent' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'hover:bg-muted'
                }`}
              >
                <Clock size={14} />
                Recent
              </button>
              <button
                onClick={() => setActiveTab('popular')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'popular' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'hover:bg-muted'
                }`}
              >
                <TrendingUp size={14} />
                Popular
              </button>
            </div>

            {/* Category Filters */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === 'all' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'hover:bg-muted'
                }`}
              >
                All Categories
              </button>
              {templateGroups.map((group) => (
                <button
                  key={group.category}
                  onClick={() => setSelectedCategory(group.category)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === group.category 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'hover:bg-muted'
                  }`}
                >
                  {group.icon} {group.displayName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Section Header */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {activeTab === 'recent' ? 'Recent Templates' : 
               activeTab === 'popular' ? 'Popular Templates' : 
               selectedCategory !== 'all' ? `${templateGroups.find(g => g.category === selectedCategory)?.displayName} Templates` :
               'All Templates'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {displayTemplates.length} template{displayTemplates.length !== 1 ? 's' : ''} available
            </p>
          </div>

          {displayTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search size={32} className="text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground mb-1">No templates found</p>
              <p className="text-sm text-muted-foreground">
                {activeTab === 'recent' 
                  ? 'You haven\'t used any templates yet'
                  : 'Try adjusting your search or filters'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedTemplate ? (
              <span>Selected: <strong>{selectedTemplate.name}</strong></span>
            ) : (
              <span>Select a template to continue</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateFromTemplate}
              disabled={!selectedTemplate || isCreating}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                selectedTemplate && !isCreating
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              {isCreating ? 'Creating...' : 'Create Document'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}