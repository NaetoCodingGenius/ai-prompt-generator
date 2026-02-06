'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Template } from '@/types/template';
import { Loader2, Sparkles } from 'lucide-react';

interface PromptGeneratorProps {
  template: Template;
  onGenerate: (inputs: Record<string, string>) => Promise<void>;
  isGenerating: boolean;
}

export function PromptGenerator({
  template,
  onGenerate,
  isGenerating,
}: PromptGeneratorProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerate(inputs);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{template.name}</CardTitle>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {template.parameters.map((param) => (
            <div key={param.id} className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {param.label}
                {param.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {param.type === 'text' && (
                <Input
                  placeholder={param.placeholder}
                  value={inputs[param.id] || ''}
                  onChange={(e) =>
                    setInputs({ ...inputs, [param.id]: e.target.value })
                  }
                  required={param.required}
                />
              )}

              {param.type === 'textarea' && (
                <Textarea
                  placeholder={param.placeholder}
                  value={inputs[param.id] || ''}
                  onChange={(e) =>
                    setInputs({ ...inputs, [param.id]: e.target.value })
                  }
                  required={param.required}
                  rows={4}
                  className="resize-none"
                />
              )}

              {param.type === 'select' && param.options && (
                <Select
                  value={inputs[param.id] || ''}
                  onValueChange={(value) =>
                    setInputs({ ...inputs, [param.id]: value })
                  }
                  required={param.required}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${param.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {param.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}

          <Button type="submit" disabled={isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Prompt
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
