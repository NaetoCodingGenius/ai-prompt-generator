'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GeneratedPrompt } from '@/types/prompt';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import { FileText, FileCode, Download } from 'lucide-react';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: GeneratedPrompt;
}

export function ExportDialog({ open, onOpenChange, prompt }: ExportDialogProps) {
  const exportAsText = () => {
    const blob = new Blob([prompt.generatedPrompt], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `prompt-${prompt.templateName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.txt`);
    toast.success('Exported as text file');
    onOpenChange(false);
  };

  const exportAsMarkdown = () => {
    const markdown = `# ${prompt.templateName}

**Generated:** ${new Date(prompt.timestamp).toLocaleString()}
**Model:** ${prompt.metadata.model}
${prompt.metadata.tokensUsed ? `**Tokens Used:** ${prompt.metadata.tokensUsed}` : ''}

## Generated Prompt

${prompt.generatedPrompt}

${prompt.refinements.length > 0 ? `## Refinement History

${prompt.refinements.map((r, i) => `### Refinement ${i + 1}
**Timestamp:** ${new Date(r.timestamp).toLocaleString()}
**Feedback:** ${r.feedback}

**Result:**
${r.refinedPrompt}

`).join('\n')}` : ''}

---
*Generated with AI Prompt Generator*
`;
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, `prompt-${prompt.templateName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.md`);
    toast.success('Exported as markdown file');
    onOpenChange(false);
  };

  const exportAsJSON = () => {
    const json = JSON.stringify(prompt, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    saveAs(blob, `prompt-${prompt.templateName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`);
    toast.success('Exported as JSON file');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Prompt</DialogTitle>
          <DialogDescription>
            Choose a format to export your prompt and refinement history
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 pt-4">
          <Button onClick={exportAsText} className="w-full justify-start" variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Export as Text (.txt)
            <span className="ml-auto text-xs text-muted-foreground">Plain text</span>
          </Button>
          <Button onClick={exportAsMarkdown} className="w-full justify-start" variant="outline">
            <FileCode className="h-4 w-4 mr-2" />
            Export as Markdown (.md)
            <span className="ml-auto text-xs text-muted-foreground">With metadata</span>
          </Button>
          <Button onClick={exportAsJSON} className="w-full justify-start" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export as JSON (.json)
            <span className="ml-auto text-xs text-muted-foreground">Complete data</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
