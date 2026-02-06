export interface Template {
  id: string;
  name: string;
  category: 'coding' | 'writing' | 'analysis' | 'creative' | 'business';
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  parameters: TemplateParameter[];
  example?: string;
}

export interface TemplateParameter {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select';
  placeholder?: string;
  options?: string[];
  required: boolean;
  defaultValue?: string;
}
