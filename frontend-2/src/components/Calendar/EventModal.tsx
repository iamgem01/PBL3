import { useState, useEffect, useCallback } from 'react';
import { X, Calendar, Clock, MapPin, AlignLeft, Trash2 } from 'lucide-react';
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
    color: '#8b5cf6',
    location: '',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Memoized color options
  const colors = [
    { value: '#8b5cf6', label: 'Purple' },
    { value: '#3B82F6', label: 'Blue' },
    { value: '#EC4899', label: 'Pink' },
    { value: '#10B981', label: 'Green' },
    { value: '#F59E0B', label: 'Orange' },
    { value: '#EF4444', label: 'Red' },
  ];

  const initializeFormData = useCallback(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        startDate: new Date(event.startDate).toISOString().slice(0, 16),
        endDate: new Date(event.endDate).toISOString().slice(0, 16),
        allDay: event.allDay,
        color: event.color || '#8b5cf6',
        location: event.location || '',
        noteId: event.noteId,
      });
    } else if (selectedDate) {
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
        color: '#8b5cf6',
        location: '',
      });
    }
  }, [event, selectedDate]);

  useEffect(() => {
    if (isOpen) {
      initializeFormData();
    }
  }, [isOpen, initializeFormData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save event:', error);
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
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {event ? 'Edit Event' : 'Create Event'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Team Meeting, Birthday Party..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Calendar size={16} className="text-slate-500" />
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Clock size={16} className="text-slate-500" />
                End Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="allDay"
              checked={formData.allDay}
              onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
              className="w-4 h-4 text-blue-500 border-slate-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="allDay" className="text-sm font-medium text-slate-700">
              All day event
            </label>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <MapPin size={16} className="text-slate-500" />
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Conference Room A, 123 Main St..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <AlignLeft size={16} className="text-slate-500" />
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add notes, agenda, or important details..."
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-none transition-colors"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Event Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {colors.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: value })}
                  className={`w-8 h-8 rounded-lg transition-all border-2 ${
                    formData.color === value 
                      ? 'border-slate-800 scale-110' 
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                  style={{ backgroundColor: value }}
                  title={label}
                />
              ))}
            </div>
          </div>
        </form>

        {/* Actions Footer */}
        <div className="flex justify-between items-center p-6 border-t border-slate-200 bg-slate-50">
          <div>
            {event && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                <Trash2 size={16} />
                {isDeleting ? 'Deleting...' : 'Delete Event'}
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSaving || !formData.title.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};