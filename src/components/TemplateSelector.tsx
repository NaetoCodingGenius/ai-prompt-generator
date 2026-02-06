'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Template } from '@/types/template';
import { getAllTemplates } from '@/lib/templates';

interface TemplateSelectorProps {
  onSelectTemplate: (template: Template) => void;
  selectedTemplateId: string | null;
}

export function TemplateSelector({
  onSelectTemplate,
  selectedTemplateId,
}: TemplateSelectorProps) {
  const templates = getAllTemplates();

  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, Template[]>);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Choose a Template</h2>
        <p className="text-muted-foreground mt-2">
          Select a template to get started with generating professional prompts
        </p>
      </div>

      {Object.entries(groupedTemplates).map(([category, templates]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold capitalize mb-3">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer hover:border-primary transition-all hover:shadow-md ${
                  selectedTemplateId === template.id
                    ? 'border-primary ring-2 ring-primary ring-offset-2'
                    : ''
                }`}
                onClick={() => onSelectTemplate(template)}
              >
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
