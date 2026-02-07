'use client';

import { useState } from 'react';
import { FileUploader } from '@/components/FileUploader';
import { FlashcardViewer } from '@/components/FlashcardViewer';
import { QuizMode } from '@/components/QuizMode';
import { StudySetList } from '@/components/StudySetList';
import { UpgradeDialog } from '@/components/UpgradeDialog';
import { AdBanner } from '@/components/AdBanner';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStudyStore } from '@/store/studyStore';
import { useAppStore } from '@/store/appStore';
import { StudySet, Flashcard } from '@/types/studyset';
import toast from 'react-hot-toast';
import { BookOpen, Sparkles, Upload, Brain, ArrowLeft, Loader2, Info, FileText, GraduationCap } from 'lucide-react';

export default function Home() {
  const [uploadedText, setUploadedText] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedPageCount, setUploadedPageCount] = useState<number>(0);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<Flashcard[]>([]);
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'study' | 'quiz' | 'summary'>('study');

  const { studySets, addStudySet, usageStats, incrementUsage, canGenerateToday } =
    useStudyStore();
  const { isGenerating, setIsGenerating, isStudying, setIsStudying } = useAppStore();

  const handleUploadSuccess = (data: {
    text: string;
    fileName: string;
    pageCount: number;
  }) => {
    setUploadedText(data.text);
    setUploadedFileName(data.fileName);
    setUploadedPageCount(data.pageCount);
    toast.success(`Ready to generate flashcards from ${data.fileName}`);
  };

  const handleGenerateFlashcards = async () => {
    if (!uploadedText) return;

    // Check daily limit
    if (!canGenerateToday()) {
      setUpgradeDialogOpen(true);
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: uploadedText,
          count: 20,
        }),
      });

      const data = await response.json();

      if (data.limitReached) {
        setUpgradeDialogOpen(true);
        toast.error(data.error || 'Daily limit reached');
        return;
      }

      if (data.success) {
        const flashcards = data.flashcards as Flashcard[];
        const summary = data.summary || null;
        setGeneratedFlashcards(flashcards);
        setGeneratedSummary(summary);

        // Increment usage
        incrementUsage();

        toast.success(
          `Generated ${flashcards.length} flashcards${summary ? ' + summary' : ''}! (${
            data.metadata.remaining
          } generation${data.metadata.remaining === 1 ? '' : 's'} remaining today)`
        );
      } else {
        toast.error(data.error || 'Failed to generate flashcards');
      }
    } catch (error) {
      toast.error('Failed to generate flashcards. Please try again.');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveStudySet = () => {
    if (!generatedFlashcards.length || !uploadedFileName) return;

    const newStudySet: StudySet = {
      id: crypto.randomUUID(),
      title: uploadedFileName.replace('.pdf', ''),
      description: `${generatedFlashcards.length} flashcards from ${uploadedPageCount} pages`,
      summary: generatedSummary || undefined,
      sourceType: 'pdf',
      sourceName: uploadedFileName,
      flashcards: generatedFlashcards,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: {
        model: 'claude-3-haiku-20240307',
        tokensUsed: 0,
        processingTime: 0,
      },
    };

    addStudySet(newStudySet);
    toast.success('Study set saved!');

    // Reset for next upload
    setUploadedText(null);
    setUploadedFileName(null);
    setUploadedPageCount(0);
    setGeneratedFlashcards([]);
    setGeneratedSummary(null);
    setViewMode('study');
  };

  const handleSelectStudySet = (set: StudySet) => {
    setGeneratedFlashcards(set.flashcards);
    setIsStudying(true);
  };

  const handleExitStudyMode = () => {
    setIsStudying(false);
    setGeneratedFlashcards([]);
  };

  const handleStartNewUpload = () => {
    setUploadedText(null);
    setUploadedFileName(null);
    setUploadedPageCount(0);
    setGeneratedFlashcards([]);
    setIsStudying(false);
  };

  const getRemainingGenerations = () => {
    const today = new Date().toISOString().split('T')[0];
    if (usageStats.lastResetDate !== today) {
      return 3;
    }
    return Math.max(0, 3 - usageStats.generationsToday);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">AI Study Assistant</h1>
                <p className="text-muted-foreground mt-1">
                  Upload anything. Study in seconds. Powered by Claude AI.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>
                  {getRemainingGenerations()} generation
                  {getRemainingGenerations() === 1 ? '' : 's'} left today
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUpgradeDialogOpen(true)}
              >
                Upgrade to Premium
              </Button>
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
          {/* Sidebar - Study Sets */}
          <div className="lg:col-span-1 space-y-6">
            <div className="border rounded-lg bg-card">
              <StudySetList
                onSelectSet={handleSelectStudySet}
                selectedSetId={null}
              />
            </div>
            {/* Sidebar Ad */}
            <AdBanner slot="sidebar" format="rectangle" />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {isStudying && generatedFlashcards.length > 0 ? (
              /* Study Mode */
              <>
                <Button variant="outline" onClick={handleExitStudyMode}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Exit Study Mode
                </Button>
                <FlashcardViewer
                  flashcards={generatedFlashcards}
                  onExit={handleExitStudyMode}
                />
              </>
            ) : generatedFlashcards.length > 0 ? (
              /* Flashcards Generated - Preview & Save */
              <>
                <Button variant="outline" onClick={handleStartNewUpload}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Upload Another PDF
                </Button>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Generated {generatedFlashcards.length} flashcards! Review them
                    below, then save your study set.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-3">
                  <Button onClick={handleSaveStudySet} className="flex-1">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Save Study Set
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsStudying(true)}
                    className="flex-1"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Start Studying
                  </Button>
                </div>

                {/* View Mode Switcher */}
                <div className="flex gap-2 border-b">
                  <Button
                    variant={viewMode === 'study' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('study')}
                    size="sm"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Flashcards
                  </Button>
                  {generatedSummary && (
                    <Button
                      variant={viewMode === 'summary' ? 'default' : 'ghost'}
                      onClick={() => setViewMode('summary')}
                      size="sm"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Summary
                    </Button>
                  )}
                  <Button
                    variant={viewMode === 'quiz' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('quiz')}
                    size="sm"
                  >
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Take Quiz
                  </Button>
                </div>

                {/* Quiz Mode */}
                {viewMode === 'quiz' && (
                  <QuizMode
                    flashcards={generatedFlashcards}
                    onExit={() => setViewMode('study')}
                  />
                )}

                {/* Summary View */}
                {viewMode === 'summary' && generatedSummary && (
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Summary</CardTitle>
                      <CardDescription>
                        Key points from {uploadedFileName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap">{generatedSummary}</div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Preview Flashcards */}
                {viewMode === 'study' && (
                  <Card>
                  <CardHeader>
                    <CardTitle>Preview Flashcards</CardTitle>
                    <CardDescription>
                      {generatedFlashcards.length} flashcards from {uploadedFileName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                    {generatedFlashcards.map((card, index) => (
                      <div
                        key={card.id}
                        className="border rounded-lg p-4 space-y-2 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                            {index + 1}
                          </span>
                          <div className="flex-1 space-y-2">
                            <p className="font-medium">{card.front}</p>
                            <p className="text-sm text-muted-foreground border-t pt-2">
                              {card.back}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                )}
              </>
            ) : uploadedText ? (
              /* PDF Uploaded - Ready to Generate */
              <>
                <Button variant="outline" onClick={handleStartNewUpload}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Upload Different PDF
                </Button>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    PDF loaded: <strong>{uploadedFileName}</strong> ({uploadedPageCount}{' '}
                    pages). Ready to generate flashcards!
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle>Generate Flashcards</CardTitle>
                    <CardDescription>
                      AI will analyze your PDF and create study flashcards automatically
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted rounded-lg p-4 space-y-2">
                      <p className="text-sm font-medium">What happens next:</p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>AI extracts key concepts and definitions</li>
                        <li>Creates 20 high-quality flashcards</li>
                        <li>Ready to study in seconds</li>
                        <li>
                          Uses 1 of your {getRemainingGenerations()} daily generations
                        </li>
                      </ul>
                    </div>

                    <Button
                      onClick={handleGenerateFlashcards}
                      disabled={isGenerating}
                      className="w-full"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Generating Flashcards...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5 mr-2" />
                          Generate Flashcards
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </>
            ) : (
              /* Initial State - Upload PDF */
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Upload Study Material
                    </CardTitle>
                    <CardDescription>
                      Upload a PDF and we&apos;ll create flashcards automatically using AI
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FileUploader
                      onUploadSuccess={handleUploadSuccess}
                      isGenerating={isGenerating}
                    />
                  </CardContent>
                </Card>

                {/* How It Works */}
                <Card>
                  <CardHeader>
                    <CardTitle>How It Works</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Upload className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-medium">1. Upload</h3>
                        <p className="text-sm text-muted-foreground">
                          Upload your study material (PDF, images, videos coming soon)
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Sparkles className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-medium">2. Generate</h3>
                        <p className="text-sm text-muted-foreground">
                          AI extracts key concepts and creates flashcards automatically
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Brain className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-medium">3. Study</h3>
                        <p className="text-sm text-muted-foreground">
                          Review flashcards with our beautiful study interface
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Upgrade Dialog */}
      <UpgradeDialog
        isOpen={upgradeDialogOpen}
        onClose={() => setUpgradeDialogOpen(false)}
        remainingGenerations={getRemainingGenerations()}
      />
    </div>
  );
}
