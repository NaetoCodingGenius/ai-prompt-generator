'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Clock } from 'lucide-react';
import { GeneratedPrompt } from '@/types/prompt';

interface PromptHistoryProps {
  prompts: GeneratedPrompt[];
  onSelectPrompt: (prompt: GeneratedPrompt) => void;
  onDeletePrompt: (id: string) => void;
  selectedPromptId: string | null;
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function PromptHistory({
  prompts,
  onSelectPrompt,
  onDeletePrompt,
  selectedPromptId,
}: PromptHistoryProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          History
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {prompts.length} {prompts.length === 1 ? 'prompt' : 'prompts'}
        </p>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-2 pr-4">
          {prompts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">
                  No prompts yet. Generate your first prompt to get started!
                </p>
              </CardContent>
            </Card>
          ) : (
            prompts.map((prompt) => (
              <Card
                key={prompt.id}
                className={`cursor-pointer hover:border-primary transition-all ${
                  selectedPromptId === prompt.id
                    ? 'border-primary ring-2 ring-primary ring-offset-1'
                    : ''
                }`}
                onClick={() => onSelectPrompt(prompt)}
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {prompt.templateName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(prompt.timestamp)}
                      </p>
                      {prompt.refinements.length > 0 && (
                        <p className="text-xs text-primary mt-1">
                          {prompt.refinements.length} refinement
                          {prompt.refinements.length > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePrompt(prompt.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
