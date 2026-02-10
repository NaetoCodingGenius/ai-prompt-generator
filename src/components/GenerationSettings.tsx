'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, PenTool, Loader2 } from 'lucide-react';

interface GenerationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (settings: { count: number; mode: 'ai' | 'manual' }) => void;
  isGenerating: boolean;
}

export function GenerationSettings({
  isOpen,
  onClose,
  onGenerate,
  isGenerating,
}: GenerationSettingsProps) {
  const [count, setCount] = useState(20);
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');

  const handleGenerate = () => {
    onGenerate({ count, mode });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Flashcard Generation Settings</DialogTitle>
          <DialogDescription>
            Customize how you want to create your flashcards
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Mode Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Creation Mode</h3>
            <div className="grid grid-cols-2 gap-3">
              <Card
                className={`cursor-pointer transition-all ${
                  mode === 'ai'
                    ? 'border-primary bg-primary/5 ring-2 ring-primary'
                    : 'border-muted hover:border-primary/50'
                }`}
                onClick={() => setMode('ai')}
              >
                <CardContent className="flex flex-col items-center p-6">
                  <Sparkles className="h-8 w-8 text-primary mb-2" />
                  <h4 className="font-medium mb-1">AI Generated</h4>
                  <p className="text-xs text-muted-foreground text-center">
                    Let Claude AI create flashcards automatically
                  </p>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  mode === 'manual'
                    ? 'border-primary bg-primary/5 ring-2 ring-primary'
                    : 'border-muted hover:border-primary/50'
                }`}
                onClick={() => setMode('manual')}
              >
                <CardContent className="flex flex-col items-center p-6">
                  <PenTool className="h-8 w-8 text-primary mb-2" />
                  <h4 className="font-medium mb-1">Manual Creation</h4>
                  <p className="text-xs text-muted-foreground text-center">
                    Create flashcards yourself from the text
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Number of Flashcards */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Number of Flashcards</h3>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min={5}
                max={50}
                value={count}
                onChange={(e) => setCount(Math.max(5, Math.min(50, parseInt(e.target.value) || 20)))}
                className="w-24"
              />
              <input
                type="range"
                min={5}
                max={50}
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-12">
                {count} cards
              </span>
            </div>
            {mode === 'ai' ? (
              <p className="text-xs text-muted-foreground">
                AI will extract the most important concepts from your material
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Create blank cards to fill in yourself
              </p>
            )}
          </div>

          {/* Mode-specific Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            {mode === 'ai' ? (
              <>
                <p className="text-sm text-muted-foreground">
                  🤖 AI mode analyzes your content and automatically creates high-quality flashcards.
                </p>
                <p className="text-xs text-muted-foreground mt-2 font-medium">
                  ⚠️ Uses 1 of your 3 daily generations
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  ✏️ Manual mode creates blank flashcards that you fill in yourself.
                  You'll be able to add, edit, and organize cards before studying.
                </p>
                <p className="text-xs text-muted-foreground mt-2 font-medium">
                  ⚠️ Uses 1 of your 3 daily generations
                </p>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isGenerating}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : mode === 'ai' ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate {count} Flashcards
                </>
              ) : (
                <>
                  <PenTool className="h-4 w-4 mr-2" />
                  Create Manually
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
