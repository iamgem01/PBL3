// src/components/template/TemplateCard.tsx
import type { Template } from '@/data/template/type';
import { Check } from 'lucide-react';

interface TemplateCardProps {
  template: Template;
  onSelect: (template: Template) => void;
  selected?: boolean;
}

export function TemplateCard({ template, onSelect, selected }: TemplateCardProps) {
  return (
    <button
      onClick={() => onSelect(template)}
      className={`
        relative w-full text-left p-4 rounded-xl border-2 transition-all duration-200
        hover:shadow-md hover:scale-105 group
        ${selected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-border bg-card hover:border-blue-300'
        }
      `}
    >
      {/* Selection indicator */}
      {selected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <Check size={14} className="text-white" />
        </div>
      )}

      {/* Icon & Badge */}
      <div className="flex items-start justify-between mb-2">
        <div className="text-3xl mb-2">{template.icon}</div>
        {template.isPremium && (
          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">
            Premium
          </span>
        )}
      </div>

      {/* Template Name */}
      <h3 className="font-semibold text-foreground mb-1 group-hover:text-blue-600 transition-colors">
        {template.name}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
        {template.description}
      </p>

      {/* Tags */}
      {template.tags && template.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 3).map((tag) => (
            <span 
              key={tag}
              className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-transparent rounded-xl pointer-events-none transition-all" />
    </button>
  );
}