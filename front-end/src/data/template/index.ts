// src/data/template/index.ts

import type { Template, TemplateCategory, TemplateGroup } from './type';
import { todoTemplates } from './todo';
import { journalTemplates } from './journal';
import { scheduleTemplates } from './schedule';
import { businessTemplates } from './business';
export { default } from '../../pages/TemplatePage/TemplatePage';

/**
 * Tất cả templates được tổ chức theo category
 */
export const ALL_TEMPLATES: Template[] = [
  ...todoTemplates,
  ...journalTemplates,
  ...scheduleTemplates,
  ...businessTemplates,
];

/**
 * Templates được nhóm theo category để hiển thị
 */
export const TEMPLATE_GROUPS: TemplateGroup[] = [
  {
    category: 'productivity',
    displayName: 'Năng suất',
    icon: '⚡',
    templates: todoTemplates.filter(t => t.category === 'productivity')
  },
  {
    category: 'personal',
    displayName: 'Cá nhân',
    icon: '📔',
    templates: journalTemplates
  },
  {
    category: 'education',
    displayName: 'Học tập',
    icon: '📚',
    templates: scheduleTemplates.filter(t => t.category === 'education')
  },
  {
    category: 'business',
    displayName: 'Kinh doanh',
    icon: '💼',
    templates: businessTemplates
  }
];

/**
 * Template Manager - các utility functions
 */
export class TemplateManager {
  /**
   * Lấy tất cả templates
   */
  static getAllTemplates(): Template[] {
    return ALL_TEMPLATES;
  }

  /**
   * Lấy template theo ID
   */
  static getTemplateById(id: string): Template | undefined {
    return ALL_TEMPLATES.find(t => t.id === id);
  }

  /**
   * Lấy templates theo category
   */
  static getTemplatesByCategory(category: TemplateCategory): Template[] {
    return ALL_TEMPLATES.filter(t => t.category === category);
  }

  /**
   * Search templates theo tên hoặc tags
   */
  static searchTemplates(query: string): Template[] {
    const lowerQuery = query.toLowerCase();
    return ALL_TEMPLATES.filter(t => 
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Lấy template groups để hiển thị
   */
  static getTemplateGroups(): TemplateGroup[] {
    return TEMPLATE_GROUPS;
  }

  /**
   * Tạo note data từ template
   */
  static createNoteFromTemplate(template: Template, userId: string) {
    const now = new Date().toISOString();
    
    return {
      title: template.name,
      content: template.content,
      contentType: 'richtext' as const,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
      templateId: template.id, // Tracking: note này được tạo từ template nào
      tags: template.tags || [],
      isImportant: false,
      isDeleted: false,
      version: 1,
      metadata: {
        templateName: template.name,
        templateCategory: template.category,
        createdFromTemplate: true
      }
    };
  }

  /**
   * Lấy popular templates (có thể dựa trên usage statistics)
   */
  static getPopularTemplates(limit: number = 6): Template[] {
    // TODO: Sau này có thể track usage và sort theo popularity
    // Hiện tại return các template đầu tiên
    return ALL_TEMPLATES.slice(0, limit);
  }

  /**
   * Lấy recent templates (từ localStorage nếu có)
   */
  static getRecentTemplates(userId: string, limit: number = 3): Template[] {
    try {
      const recentKey = `recent_templates_${userId}`;
      const recent = localStorage.getItem(recentKey);
      
      if (!recent) return [];
      
      const recentIds: string[] = JSON.parse(recent);
      const templates = recentIds
        .map(id => this.getTemplateById(id))
        .filter((t): t is Template => t !== undefined)
        .slice(0, limit);
      
      return templates;
    } catch (error) {
      console.error('Error getting recent templates:', error);
      return [];
    }
  }

  /**
   * Lưu template vào recent
   */
  static saveToRecent(userId: string, templateId: string): void {
    try {
      const recentKey = `recent_templates_${userId}`;
      const recent = localStorage.getItem(recentKey);
      
      let recentIds: string[] = recent ? JSON.parse(recent) : [];
      
      // Remove if exists, then add to beginning
      recentIds = recentIds.filter(id => id !== templateId);
      recentIds.unshift(templateId);
      
      // Keep only last 10
      recentIds = recentIds.slice(0, 10);
      
      localStorage.setItem(recentKey, JSON.stringify(recentIds));
    } catch (error) {
      console.error('Error saving to recent:', error);
    }
  }
}

// Export all for convenience
export * from './type';
export { todoTemplates } from './todo';
export { journalTemplates } from './journal';
export { scheduleTemplates } from './schedule';
export { businessTemplates } from './business';