
export type TemplateCategory = 
  | 'productivity' 
  | 'personal' 
  | 'education' 
  | 'business' 
  | 'creative'
  | 'health';

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  icon: string;
  description: string;
  content: string;
  thumbnail?: string;
  tags?: string[];
  createdAt?: string;
  author?: string;
  isPremium?: boolean;
}

export interface TemplateGroup {
  category: TemplateCategory;
  displayName: string;
  icon: string;
  templates: Template[];
}