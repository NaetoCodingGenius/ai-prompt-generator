'use client';

import { useState } from 'react';
import { TemplateSelector } from '@/components/TemplateSelector';
import { PromptGenerator } from '@/components/PromptGenerator';
import { PromptEditor } from '@/components/PromptEditor';
import { PromptHistory } from '@/components/PromptHistory';
import { ExportDialog } from '@/components/ExportDialog';
import { ApiKeySettings } from '@/components/ApiKeySettings';
import { AdBanner } from '@/components/AdBanner';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePromptStore } from '@/store/promptStore';
import { useAppStore } from '@/store/appStore';
import { Template } from '@/types/template';
import { GeneratedPrompt } from '@/types/prompt';
import { getTemplateById } from '@/lib/templates';
import toast from 'react-hot-toast';
import { ArrowLeft, Sparkles, Key } from 'lucide-react';

export default function Home() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<GeneratedPrompt | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [userApiKey, setUserApiKey] = useState<string | null>(null);

  const { prompts, addPrompt, updatePrompt, deletePrompt } = usePromptStore();
  const { isGenerating, setIsGenerating } = useAppStore();

  const handleApiKeyChange = (apiKey: string | null) => {
    setUserApiKey(apiKey);
  };

  const handleGeneratePrompt = async (inputs: Record<string, string>) => {
    if (!selectedTemplate) return;

    // Require API key
    if (!userApiKey) {
      toast.error('Please add your API key to generate prompts. Click the button in the header!');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          userInput: inputs,
          userApiKey: userApiKey,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newPrompt: GeneratedPrompt = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          templateId: selectedTemplate.id,
          templateName: selectedTemplate.name,
          userInput: inputs,
          generatedPrompt: data.prompt,
          refinements: [],
          metadata: {
            model: 'claude-opus-4-20250514',
            tokensUsed: data.tokensUsed,
          },
        };

        addPrompt(newPrompt);
        setCurrentPrompt(newPrompt);
        toast.success('Prompt generated successfully!');
      } else {
        toast.error(data.error || 'Failed to generate prompt');
      }
    } catch (error) {
      toast.error('Failed to generate prompt. Please try again.');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefinePrompt = async (feedback: string) => {
    if (!currentPrompt || !selectedTemplate) return;

    // Require API key
    if (!userApiKey) {
      toast.error('Please add your API key to refine prompts.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          userInput: currentPrompt.userInput,
          previousPrompt: currentPrompt.generatedPrompt,
          refinementFeedback: feedback,
          userApiKey: userApiKey,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const refinement = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          feedback,
          refinedPrompt: data.prompt,
        };

        const updatedPrompt = {
          ...currentPrompt,
          generatedPrompt: data.prompt,
          refinements: [...currentPrompt.refinements, refinement],
        };

        updatePrompt(currentPrompt.id, updatedPrompt);
        setCurrentPrompt(updatedPrompt);
        toast.success('Prompt refined successfully!');
      } else {
        toast.error(data.error || 'Failed to refine prompt');
      }
    } catch (error) {
      toast.error('Failed to refine prompt. Please try again.');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectPromptFromHistory = (prompt: GeneratedPrompt) => {
    setCurrentPrompt(prompt);
    const template = getTemplateById(prompt.templateId);
    if (template) {
      setSelectedTemplate(template);
    }
  };

  const handleBackToTemplates = () => {
    setSelectedTemplate(null);
    setCurrentPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">AI Prompt Generator</h1>
                <p className="text-muted-foreground mt-1">
                  Generate professional-level prompts for AI systems, powered by Claude
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {!userApiKey && (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  <span>Add API key to start</span>
                </div>
              )}
              <ApiKeySettings onApiKeyChange={handleApiKeyChange} />
            </div>
          </div>
        </div>
      </header>

      {/* Top Ad Banner */}
      <div className="container mx-auto px-4 pt-4">
        <AdBanner slot="top-banner" format="horizontal" />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - History */}
          <div className="lg:col-span-1 space-y-6">
            <PromptHistory
              prompts={prompts}
              onSelectPrompt={handleSelectPromptFromHistory}
              onDeletePrompt={deletePrompt}
              selectedPromptId={currentPrompt?.id || null}
            />
            {/* Sidebar Ad */}
            <AdBanner slot="sidebar" format="rectangle" />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {selectedTemplate && (
              <Button
                variant="outline"
                onClick={handleBackToTemplates}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Templates
              </Button>
            )}

            {!selectedTemplate ? (
              <TemplateSelector
                onSelectTemplate={setSelectedTemplate}
                selectedTemplateId={selectedTemplate?.id || null}
              />
            ) : (
              <>
                <PromptGenerator
                  template={selectedTemplate}
                  onGenerate={handleGeneratePrompt}
                  isGenerating={isGenerating}
                />

                {currentPrompt && (
                  <PromptEditor
                    prompt={currentPrompt.generatedPrompt}
                    onRefine={handleRefinePrompt}
                    onExport={() => setExportDialogOpen(true)}
                    isRefining={isGenerating}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Export Dialog */}
      {currentPrompt && (
        <ExportDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          prompt={currentPrompt}
        />
      )}
    </div>
  );
}
