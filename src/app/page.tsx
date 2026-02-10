'use client';

import { useState } from 'react';
import { FileUploader } from '@/components/FileUploader';
import { FlashcardViewer } from '@/components/FlashcardViewer';
import { FlashcardEditor } from '@/components/FlashcardEditor';
import { QuizMode } from '@/components/QuizMode';
import { StudySetList } from '@/components/StudySetList';
import { UpgradeDialog } from '@/components/UpgradeDialog';
import { GenerationSettings } from '@/components/GenerationSettings';
import { AdBanner } from '@/components/AdBanner';
import { ProgressDashboard } from '@/components/ProgressDashboard';
import { AITutorChat } from '@/components/AITutorChat';
import { ImageOcclusionEditor } from '@/components/ImageOcclusionEditor';
import { ClozeEditor } from '@/components/ClozeEditor';
import { InstallPrompt } from '@/components/InstallPrompt';
import { StudyTimer } from '@/components/StudyTimer';
import { BulkImport } from '@/components/BulkImport';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStudyStore } from '@/store/studyStore';
import { useAppStore } from '@/store/appStore';
import { StudySet, Flashcard } from '@/types/studyset';
import toast from 'react-hot-toast';
import { BookOpen, Sparkles, Upload, Brain, ArrowLeft, Loader2, Info, FileText, GraduationCap, MessageCircle, TrendingUp, Image, Type, Download, Clock, RotateCcw, Youtube } from 'lucide-react';
import { YouTubeInput } from '@/components/YouTubeInput';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  const [uploadedText, setUploadedText] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedPageCount, setUploadedPageCount] = useState<number>(0);
  const [uploadSource, setUploadSource] = useState<'pdf' | 'youtube'>('pdf');
  const [generatedFlashcards, setGeneratedFlashcards] = useState<Flashcard[]>([]);
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [viewMode, setViewMode] = useState<'study' | 'quiz' | 'summary' | 'tutor' | 'progress' | 'timer'>('study');
  const [currentStudySetId, setCurrentStudySetId] = useState<string | null>(null);
  const [showImageOcclusionEditor, setShowImageOcclusionEditor] = useState(false);
  const [showClozeEditor, setShowClozeEditor] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showStudyTimer, setShowStudyTimer] = useState(false);

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
    setUploadSource('pdf');
    toast.success(`Ready to generate flashcards from ${data.fileName}`);
  };

  const handleYouTubeSuccess = (data: {
    text: string;
    title: string;
    duration?: number;
  }) => {
    setUploadedText(data.text);
    setUploadedFileName(data.title);
    setUploadedPageCount(0); // No pages for YouTube
    setUploadSource('youtube');
    toast.success(`Ready to generate flashcards from ${data.title}`);
  };

  const handleGenerateFlashcards = async (settings: { count: number; mode: 'ai' | 'manual' }) => {
    if (!uploadedText) return;

    // Close settings dialog
    setSettingsOpen(false);

    // Check daily limit for BOTH modes
    if (!canGenerateToday()) {
      setUpgradeDialogOpen(true);
      return;
    }

    // Handle manual mode
    if (settings.mode === 'manual') {
      // Create empty flashcards for manual entry
      const emptyFlashcards: Flashcard[] = Array.from({ length: settings.count }, (_, i) => ({
        id: crypto.randomUUID(),
        type: 'normal',
        front: '',
        back: '',
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReviewDate: Date.now(),
        lastReviewed: null,
        totalReviews: 0,
        correctCount: 0,
        incorrectCount: 0,
        consecutiveFails: 0,
        isLeech: false,
      }));

      setGeneratedFlashcards(emptyFlashcards);
      setIsManualMode(true);
      // Increment usage for manual mode too
      incrementUsage();
      toast.success(`Created ${settings.count} blank flashcards - fill them in below! (${getRemainingGenerations()} generations remaining today)`);
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: uploadedText,
          count: settings.count,
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

        // Auto-save study set immediately after generation
        // Use uploadSource state for accurate source type
        const sourceType = uploadSource === 'youtube' ? 'youtube' : uploadedFileName?.match(/\.(png|jpg|jpeg|webp)$/i) ? 'screenshot' : 'pdf';

        const newStudySet: StudySet = {
          id: crypto.randomUUID(),
          title: uploadedFileName?.replace(/\.(pdf|png|jpg|jpeg|webp)$/i, '') || 'Untitled Study Set',
          description: `${flashcards.length} flashcards from ${sourceType === 'youtube' ? 'YouTube video' : `${uploadedPageCount} ${uploadedPageCount === 1 ? 'page' : 'pages'}`}`,
          summary: summary || undefined,
          sourceType,
          sourceName: uploadedFileName || 'unknown',
          flashcards: flashcards,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          metadata: {
            model: 'claude-3-haiku-20240307',
            tokensUsed: data.metadata?.tokensUsed || 0,
            processingTime: data.metadata?.processingTime || 0,
          },
        };

        addStudySet(newStudySet);
        setCurrentStudySetId(newStudySet.id); // Track the current study set

        toast.success(
          `Generated ${flashcards.length} flashcards${summary ? ' + summary' : ''} and saved! (${
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
    setGeneratedSummary(set.summary || null);
    setUploadedText(null); // Clear uploaded text when loading saved set
    setUploadedFileName(set.sourceName);
    setCurrentStudySetId(set.id); // Track which set is being studied
    setIsStudying(true);
  };

  const handleExitStudyMode = () => {
    setIsStudying(false);
    // DON'T clear flashcards - user should return to options view
    // setCurrentStudySetId stays - we still want to track the active set
  };

  const handleStartNewUpload = () => {
    setUploadedText(null);
    setUploadedFileName(null);
    setUploadedPageCount(0);
    setGeneratedFlashcards([]);
    setIsStudying(false);
    setIsManualMode(false);
  };

  const handleSaveManualCards = () => {
    // Filter out empty cards
    const validCards = generatedFlashcards.filter(card => card.front.trim() && card.back.trim());

    if (validCards.length === 0) {
      toast.error('Please fill in at least one flashcard');
      return;
    }

    // Auto-save the study set
    const newStudySet: StudySet = {
      id: crypto.randomUUID(),
      title: uploadedFileName?.replace(/\.(pdf|png|jpg|jpeg|webp)$/i, '') || 'Manual Study Set',
      description: `${validCards.length} manually created flashcards`,
      sourceType: 'manual',
      sourceName: uploadedFileName || 'Manual Entry',
      flashcards: validCards,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: {
        model: 'manual',
        tokensUsed: 0,
        processingTime: 0,
      },
    };

    addStudySet(newStudySet);
    setCurrentStudySetId(newStudySet.id);
    setGeneratedFlashcards(validCards);
    setIsManualMode(false);
    toast.success(`Saved ${validCards.length} flashcards!`);
  };

  const getRemainingGenerations = () => {
    const today = new Date().toISOString().split('T')[0];
    if (usageStats.lastResetDate !== today) {
      return 3;
    }
    return Math.max(0, 3 - usageStats.generationsToday);
  };

  const handleSaveImageOcclusion = (flashcards: Flashcard[]) => {
    // Check daily limit
    if (!canGenerateToday()) {
      setUpgradeDialogOpen(true);
      return;
    }

    // Create study set
    const newStudySet: StudySet = {
      id: crypto.randomUUID(),
      title: 'Image Occlusion Study Set',
      description: `${flashcards.length} image occlusion flashcards`,
      sourceType: 'screenshot',
      sourceName: 'Image Occlusion',
      flashcards,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: {
        model: 'manual',
        tokensUsed: 0,
        processingTime: 0,
      },
    };

    addStudySet(newStudySet);
    setCurrentStudySetId(newStudySet.id);
    setGeneratedFlashcards(flashcards);
    setShowImageOcclusionEditor(false);
    incrementUsage();
    toast.success(`Created ${flashcards.length} image occlusion flashcards! (${getRemainingGenerations()} generations remaining today)`);
  };

  const handleSaveClozeCards = (flashcards: Flashcard[]) => {
    // Check daily limit
    if (!canGenerateToday()) {
      setUpgradeDialogOpen(true);
      return;
    }

    // Create study set
    const newStudySet: StudySet = {
      id: crypto.randomUUID(),
      title: 'Cloze Deletion Study Set',
      description: `${flashcards.length} cloze deletion flashcards`,
      sourceType: 'manual',
      sourceName: 'Cloze Deletion',
      flashcards,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: {
        model: 'manual',
        tokensUsed: 0,
        processingTime: 0,
      },
    };

    addStudySet(newStudySet);
    setCurrentStudySetId(newStudySet.id);
    setGeneratedFlashcards(flashcards);
    setShowClozeEditor(false);
    incrementUsage();
    toast.success(`Created ${flashcards.length} cloze deletion flashcards! (${getRemainingGenerations()} generations remaining today)`);
  };

  const handleBulkImport = (studySet: StudySet) => {
    addStudySet(studySet);
    setCurrentStudySetId(studySet.id);
    setGeneratedFlashcards(studySet.flashcards);
    setShowBulkImport(false);
    toast.success(`Imported ${studySet.flashcards.length} flashcards!`);
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
                  studySetId={currentStudySetId || undefined}
                  onExit={handleExitStudyMode}
                />
              </>
            ) : generatedFlashcards.length > 0 ? (
              /* Flashcards Generated - Preview & Save */
              <>
                <Button variant="outline" onClick={handleStartNewUpload}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Upload New Material
                </Button>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Generated {generatedFlashcards.length} flashcards and auto-saved to your study sets!
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={() => setIsStudying(true)}
                  className="w-full"
                  size="lg"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start Studying Now
                </Button>

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
                  <Button
                    variant={viewMode === 'tutor' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('tutor')}
                    size="sm"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    AI Tutor
                  </Button>
                  <Button
                    variant={viewMode === 'progress' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('progress')}
                    size="sm"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Progress
                  </Button>
                  <Button
                    variant={viewMode === 'timer' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('timer')}
                    size="sm"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Timer
                  </Button>
                </div>

                {/* Quiz Mode - Keep mounted to preserve state */}
                <div style={{ display: viewMode === 'quiz' ? 'block' : 'none' }}>
                  {generatedFlashcards.length > 0 && (
                    <QuizMode
                      flashcards={generatedFlashcards}
                      onExit={() => setViewMode('study')}
                    />
                  )}
                </div>

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

                {/* AI Tutor View */}
                {viewMode === 'tutor' && (
                  <AITutorChat
                    context={uploadedText || generatedFlashcards.map(c => `Q: ${c.front}\nA: ${c.back}`).join('\n\n')}
                    title={uploadedFileName || 'your flashcards'}
                  />
                )}

                {/* Progress Dashboard View */}
                {viewMode === 'progress' && (
                  <ProgressDashboard />
                )}

                {/* Study Timer View */}
                {viewMode === 'timer' && (
                  <StudyTimer />
                )}

                {/* Preview/Edit Flashcards */}
                {viewMode === 'study' && (
                  isManualMode ? (
                    <FlashcardEditor
                      flashcards={generatedFlashcards}
                      onUpdate={setGeneratedFlashcards}
                      onSave={handleSaveManualCards}
                    />
                  ) : (
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
                  )
                )}
              </>
            ) : uploadedText ? (
              /* PDF Uploaded - Ready to Generate */
              <>
                <Button variant="outline" onClick={handleStartNewUpload}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Upload Different Material
                </Button>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {uploadSource === 'youtube' ? (
                      <>
                        <Youtube className="inline h-3 w-3 mr-1" />
                        YouTube transcript loaded: <strong>{uploadedFileName}</strong>. Ready to generate flashcards!
                      </>
                    ) : (
                      <>
                        PDF loaded: <strong>{uploadedFileName}</strong> ({uploadedPageCount} pages). Ready to generate flashcards!
                      </>
                    )}
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
                        <li>Choose between AI-generated or manual creation</li>
                        <li>Customize the number of flashcards (5-50)</li>
                        <li>AI extracts key concepts and definitions</li>
                        <li>Ready to study in seconds</li>
                        <li>
                          AI mode uses 1 of your {getRemainingGenerations()} daily generations
                        </li>
                      </ul>
                    </div>

                    <Button
                      onClick={() => setSettingsOpen(true)}
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
              /* Initial State - Upload Material */
              <>
                {showImageOcclusionEditor ? (
                  <ImageOcclusionEditor
                    onSave={handleSaveImageOcclusion}
                    onCancel={() => setShowImageOcclusionEditor(false)}
                  />
                ) : showClozeEditor ? (
                  <ClozeEditor
                    onSave={handleSaveClozeCards}
                    onCancel={() => setShowClozeEditor(false)}
                  />
                ) : showBulkImport ? (
                  <BulkImport
                    onImport={handleBulkImport}
                    onCancel={() => setShowBulkImport(false)}
                  />
                ) : (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Upload className="h-5 w-5" />
                          Upload Study Material
                        </CardTitle>
                        <CardDescription>
                          Upload PDFs or paste YouTube links to create flashcards with AI
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* File Upload & YouTube Tabs */}
                        <Tabs defaultValue="pdf" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="pdf" className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              PDF Upload
                            </TabsTrigger>
                            <TabsTrigger value="youtube" className="flex items-center gap-2">
                              <Youtube className="h-4 w-4" />
                              YouTube URL
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent value="pdf" className="space-y-4">
                            <FileUploader
                              onUploadSuccess={handleUploadSuccess}
                              isGenerating={isGenerating}
                            />
                          </TabsContent>
                          <TabsContent value="youtube" className="space-y-4">
                            <YouTubeInput
                              onSuccess={handleYouTubeSuccess}
                              isProcessing={isGenerating}
                            />
                          </TabsContent>
                        </Tabs>

                        {/* Feature Selection Guide */}
                        <Alert className="bg-blue-50 border-blue-200">
                          <Info className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-sm">
                            <strong className="text-blue-900">Which feature should I use?</strong>
                            <ul className="mt-2 space-y-1.5 text-blue-800">
                              <li>
                                <strong>📄 Upload PDF (above)</strong> → For tests, quizzes, worksheets with answer keys
                                <br />
                                <span className="text-xs">AI matches each question to its answer automatically</span>
                              </li>
                              <li>
                                <strong>📝 Cloze Deletion (below)</strong> → For study notes, textbook content
                                <br />
                                <span className="text-xs">Fill-in-the-blank style cards for memorizing terms</span>
                              </li>
                            </ul>
                          </AlertDescription>
                        </Alert>

                        {/* Alternative Creation Methods */}
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                              Or create manually
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <Button
                            variant="outline"
                            className="h-auto py-6 flex-col"
                            onClick={() => setShowImageOcclusionEditor(true)}
                          >
                            <Image className="h-8 w-8 mb-2 text-primary" />
                            <span className="font-medium">Image Occlusion</span>
                            <span className="text-xs text-muted-foreground mt-1">
                              Cover parts of images
                            </span>
                          </Button>

                          <Button
                            variant="outline"
                            className="h-auto py-6 flex-col"
                            onClick={() => setShowClozeEditor(true)}
                          >
                            <Type className="h-8 w-8 mb-2 text-primary" />
                            <span className="font-medium">Cloze Deletion</span>
                            <span className="text-xs text-muted-foreground mt-1">
                              Fill-in-the-blank cards
                            </span>
                          </Button>

                          <Button
                            variant="outline"
                            className="h-auto py-6 flex-col"
                            onClick={() => setShowBulkImport(true)}
                          >
                            <Download className="h-8 w-8 mb-2 text-primary" />
                            <span className="font-medium">Bulk Import</span>
                            <span className="text-xs text-muted-foreground mt-1">
                              From Quizlet/Anki
                            </span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

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
                          Upload PDFs or paste YouTube links to your study material
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

      {/* Generation Settings Dialog */}
      <GenerationSettings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onGenerate={handleGenerateFlashcards}
        isGenerating={isGenerating}
      />

      {/* Upgrade Dialog */}
      <UpgradeDialog
        isOpen={upgradeDialogOpen}
        onClose={() => setUpgradeDialogOpen(false)}
        remainingGenerations={getRemainingGenerations()}
      />

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  );
}
