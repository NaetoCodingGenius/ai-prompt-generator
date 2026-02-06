'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Download, RefreshCw, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

interface PromptEditorProps {
  prompt: string;
  onRefine: (feedback: string) => Promise<void>;
  onExport: () => void;
  isRefining: boolean;
}

export function PromptEditor({
  prompt,
  onRefine,
  onExport,
  isRefining,
}: PromptEditorProps) {
  const [refinementFeedback, setRefinementFeedback] = useState('');
  const [showRefinement, setShowRefinement] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    toast.success('Prompt copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefine = async () => {
    if (!refinementFeedback.trim()) {
      toast.error('Please provide refinement feedback');
      return;
    }
    await onRefine(refinementFeedback);
    setRefinementFeedback('');
    setShowRefinement(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Generated Prompt</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRefinement(!showRefinement)}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refine
              </Button>
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{prompt}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {showRefinement && (
        <Card>
          <CardHeader>
            <CardTitle>Refine Prompt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Describe how you'd like to improve this prompt... (e.g., 'Make it more specific about error handling', 'Add examples', 'Simplify the language')"
              value={refinementFeedback}
              onChange={(e) => setRefinementFeedback(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <div className="flex gap-2">
              <Button onClick={handleRefine} disabled={isRefining}>
                {isRefining ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Refining...
                  </>
                ) : (
                  'Apply Refinement'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRefinement(false);
                  setRefinementFeedback('');
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
