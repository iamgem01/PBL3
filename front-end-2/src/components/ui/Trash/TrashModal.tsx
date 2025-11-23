import { useState, useEffect } from "react";
import { getTrashItems, restoreFromTrash, permanentDelete } from "@/services";

interface TrashItem {
  id: string;
  title: string;
  type: 'NOTE' | 'FOLDER';
  deletedAt: string;
}

interface ApiTrashItem {
  id: string;
  item_type: 'NOTE' | 'FOLDER';
  name: string;
  user_id: string;
  workspace_id: string;
}

interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrashModal({ isOpen, onClose }: TrashModalProps) {
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchTrashItems();
    }
  }, [isOpen]);

  const mapApiToTrashItem = (apiItem: ApiTrashItem): TrashItem => {
    return {
      id: apiItem.id,
      title: apiItem.name || 'Untitled Note',
      type: apiItem.item_type,
      deletedAt: ''
    };
  };

  const fetchTrashItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await getTrashItems('user_001');
      console.log('API Response:', items);
      
      if (items && Array.isArray(items)) {
        const mappedItems = items.map(mapApiToTrashItem);
        setTrashItems(mappedItems);
      } else {
        setTrashItems([]);
        console.warn('Unexpected API response format:', items);
      }
    } catch (err: any) {
      console.error('Error fetching trash:', err);
      setError(err.message || "Failed to load trash items");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (itemId: string) => {
    try {
      await restoreFromTrash(itemId);
      await fetchTrashItems();
    } catch (err: any) {
      console.error('Restore error:', err);
     
      if (err instanceof SyntaxError && err.message.includes('JSON')) {
        console.log('Restore likely succeeded (non-JSON response), refreshing list...');
        await fetchTrashItems();
      } else {
        setError(err.message || "Failed to restore item");
      }
    }
  };

  const handlePermanentDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to permanently delete this item? This action cannot be undone.")) {
      return;
    }

    try {
      await permanentDelete(itemId);
      await fetchTrashItems();
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err.message || "Failed to delete item");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Recently';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Recently';
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minutes ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      
      return date.toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card rounded-xl shadow-2xl border border-border w-[90%] max-w-4xl max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground">Trash</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Loading trash items...</span>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 dark:text-red-400 py-8">
              <p>{error}</p>
              <button 
                onClick={fetchTrashItems}
                className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity"
              >
                Retry
              </button>
            </div>
          ) : trashItems.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p className="mb-2">No items in trash</p>
              <p className="text-sm">Items in Trash for over 30 days will be automatically deleted</p>
            </div>
          ) : (
            <div className="space-y-4">
              {trashItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors">
                  <div className="flex items-center space-x-3 flex-1">
                    <span className={item.type === 'NOTE' ? '📝 text-xl' : '📁 text-xl'} />
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-lg mb-1">
                        {item.title || 'Untitled Note'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.type} • Deleted {formatDate(item.deletedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRestore(item.id)}
                      className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded hover:opacity-90 transition-opacity"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(item.id)}
                      className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-muted/30">
          <p className="text-sm text-muted-foreground text-center">
            Items in Trash for over 30 days will be automatically deleted
          </p>
        </div>
      </div>
    </div>
  );
}