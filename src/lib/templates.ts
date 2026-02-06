import templates from '@/data/templates.json';
import { Template } from '@/types/template';

export function getAllTemplates(): Template[] {
  return templates as Template[];
}

export function getTemplateById(id: string): Template | undefined {
  return templates.find((t) => (t as Template).id === id) as Template | undefined;
}

export function getTemplatesByCategory(category: string): Template[] {
  return templates.filter((t) => (t as Template).category === category) as Template[];
}

export function interpolateTemplate(
  template: string,
  values: Record<string, string>
): string {
  let result = template;
  Object.entries(values).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value || '');
  });
  return result;
}
