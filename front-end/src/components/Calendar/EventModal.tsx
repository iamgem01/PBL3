import { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, AlignLeft, Bell, Link as LinkIcon, Trash2 } from 'lucide-react';
import type { CalendarEvent, CreateEventInput } from '@/types/calendar';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: CreateEventInput) => Promise<void>;
  onDelete?: (eventId: string) => Promise<void>;
  event?: CalendarEvent | null;
  selectedDate?: Date;
}

export const EventModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  event, 
  selectedDate 
}: EventModalProps) => {
  const [formData, setFormData] = useState<CreateEventInput>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    allDay: false,
    color: '#3B82F6',
    location: '',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (event) {
      // Edit mode
      setFormData({
        title: event.title,
        description: event.description || '',
        startDate: new Date(event.startDate).toISOString().slice(0, 16),
        endDate: new Date(event.endDate).toISOString().slice(0, 16),
        allDay: event.allDay,
        color: event.color || '#3B82F6',
        location: event.location || '',
        noteId: event.noteId,
      });
    } else if (selectedDate) {
      // Create mode with selected date
      const start = new Date(selectedDate);
      start.setHours(9, 0, 0, 0);
      const end = new Date(start);
      end.setHours(10, 0, 0, 0);
      
      setFormData({
        title: '',
        description: '',
        startDate: start.toISOString().slice(0, 16),
        endDate: end.toISOString().slice(0, 16),
        allDay: false,
        color: '#3B82F6',
        location: '',
      });
    }
  }, [event, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save event:', error);
      alert('Failed to save event. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!event?.id || !onDelete) return;
    
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    setIsDeleting(true);
    try {
      await onDelete(event.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Failed to delete event. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  const colors = [
    { value: '#3B82F6', label: 'Blue' },
    { value: '#EF4444', label: 'Red' },
    { value: '#10B981', label: 'Green' },
    { value: '#F59E0B', label: 'Orange' },
    { value: '#8B5CF6', label: 'Purple' },
    { value: '#EC4899', label: 'Pink' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-xl font-semibold text-foreground">
            {event ? 'Edit Event' : 'Create Event'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Event Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Team meeting, Birthday party..."
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Calendar size={16} /> Start
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Clock size={16} /> End
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>
          </div>

          {/* All Day */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allDay"
              checked={formData.allDay}
              onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
              className="w-4 h-4 rounded border-border"
            />
            <label htmlFor="allDay" className="text-sm text-foreground">
              All day event
            </label>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <MapPin size={16} /> Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Conference room, Address..."
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <AlignLeft size={16} /> Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add notes, agenda, or details..."
              rows={4}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none resize-none"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Event Color
            </label>
            <div className="flex gap-2">
              {colors.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: value })}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    formData.color === value ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                  }`}
                  style={{ backgroundColor: value }}
                  title={label}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-border">
            <div>
              {event && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !formData.title.trim()}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : event ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};