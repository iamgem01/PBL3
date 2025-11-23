export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

interface ChecklistProps {
  items: ChecklistItem[];
  onToggleCheck: (id: string) => void;
}

export default function Checklist({ items, onToggleCheck }: ChecklistProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📋</span>
        <h2 className="text-lg font-semibold">Essentials</h2>
      </div>
      <div className="space-y-3">
        {items.map(item => (
          <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => onToggleCheck(item.id)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className={`${
              item.checked ? 'line-through text-gray-400' : 'text-gray-700'
            } group-hover:text-gray-900 transition-colors`}>
              {item.text}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
