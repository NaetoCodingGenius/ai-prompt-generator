'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { X, Save, Sparkles, Upload, Loader2, FileText, PenTool } from 'lucide-react';
import { Flashcard } from '@/types/studyset';
import toast from 'react-hot-toast';

interface ClozeEditorProps {
  onSave: (flashcards: Flashcard[]) => void;
  onCancel: () => void;
}

export function ClozeEditor({ onSave, onCancel }: ClozeEditorProps) {
  const [text, setText] = useState('');
  const [previewCards, setPreviewCards] = useState<Flashcard[]>([]);
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [clozeCount, setClozeCount] = useState(10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (value: string) => {
    setText(value);
    generatePreview(value);
  };

  const generatePreview = (inputText: string) => {
    // Find all {{...}} patterns
    const clozeRegex = /\{\{([^}]+)\}\}/g;
    const matches = [...inputText.matchAll(clozeRegex)];

    if (matches.length === 0) {
      setPreviewCards([]);
      return;
    }

    // Create one card per cloze
    const cards: Flashcard[] = matches.map((match, index) => {
      const clozedWord = match[1];
      const clozeText = inputText;

      // Create question by replacing THIS cloze with blank
      const question = inputText.replace(
        match[0],
        '___________'
      );

      return {
        id: crypto.randomUUID(),
        type: 'cloze',
        front: question,
        back: clozedWord,
        clozeText,
        clozeIndex: index,
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
      };
    });

    setPreviewCards(cards);
  };

  const handleAddExample = () => {
    const example = `The {{mitochondria}} is the {{powerhouse}} of the cell.

Water ({{H2O}}) is composed of {{hydrogen}} and {{oxygen}}.

The capital of {{France}} is {{Paris}}.`;
    setText(example);
    generatePreview(example);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsGenerating(true);
    setUploadedFile(file.name);

    try {
      // Upload file to extract text
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadData.success) {
        toast.error(uploadData.error || 'Failed to upload file');
        setIsGenerating(false);
        return;
      }

      // Generate cloze cards with AI
      const generateResponse = await fetch('/api/generate-cloze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: uploadData.text,
          count: clozeCount,
        }),
      });

      const generateData = await generateResponse.json();

      if (!generateData.success) {
        toast.error(generateData.error || 'Failed to generate cloze cards');
        setIsGenerating(false);
        return;
      }

      // The API returns text with {{cloze}} markers
      setText(generateData.clozeText);
      generatePreview(generateData.clozeText);
      toast.success(`Generated ${generateData.clozeText.match(/\{\{[^}]+\}\}/g)?.length || 0} cloze deletions!`);
    } catch (error) {
      console.error('Error generating cloze cards:', error);
      toast.error('Failed to generate cloze cards');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (previewCards.length === 0) {
      toast.error('Add at least one cloze deletion using {{double braces}}');
      return;
    }

    onSave(previewCards);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Cloze Deletion Cards</h2>
          <p className="text-sm text-muted-foreground">
            Fill-in-the-blank style flashcards
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Important Usage Warning */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
        <h3 className="font-bold text-amber-900 mb-2">⚠️ When to Use Cloze Deletion</h3>
        <div className="space-y-2 text-sm text-amber-900">
          <div>
            <strong className="text-green-700">✓ USE FOR:</strong> Study notes, textbook content, definitions
            <p className="text-xs text-amber-800 ml-4">Example: "The mitochondria is the powerhouse of the cell"</p>
          </div>
          <div>
            <strong className="text-red-700">✗ DON'T USE FOR:</strong> Tests/quizzes with numbered questions (1, 2, 3...) and answer keys
            <p className="text-xs text-amber-800 ml-4">For tests, use the regular "Upload PDF" feature instead!</p>
          </div>
        </div>
      </div>

      {/* Mode Selection */}
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
            <h4 className="font-medium mb-1">AI Generate from PDF</h4>
            <p className="text-xs text-muted-foreground text-center">
              Upload PDF and AI creates cloze deletions automatically
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
            <h4 className="font-medium mb-1">Create Manually</h4>
            <p className="text-xs text-muted-foreground text-center">
              Type your own text and add cloze deletions yourself
            </p>
          </CardContent>
        </Card>
      </div>

      {mode === 'ai' ? (
        /* AI Mode - PDF Upload */
        <>
          <Card>
            <CardContent className="p-6 space-y-4">
              {!text ? (
                <div className="text-center space-y-4">
                  <FileText className="h-12 w-12 text-primary mx-auto" />
                  <div>
                    <h3 className="font-medium mb-2">Upload Your Study Material</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      AI will identify key concepts and create cloze deletions
                    </p>
                  </div>

                  {/* Number of Cloze Deletions Slider */}
                  <div className="max-w-md mx-auto space-y-2">
                    <label className="text-sm font-medium">Number of Cloze Deletions</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        min={3}
                        max={30}
                        value={clozeCount}
                        onChange={(e) => setClozeCount(Math.max(3, Math.min(30, parseInt(e.target.value) || 10)))}
                        className="w-16 px-2 py-1 border rounded text-center"
                      />
                      <input
                        type="range"
                        min={3}
                        max={30}
                        value={clozeCount}
                        onChange={(e) => setClozeCount(parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground w-16">{clozeCount} clozes</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Fewer = Only the most important terms • More = Include additional concepts
                    </p>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf,image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isGenerating}
                    size="lg"
                    className="w-full max-w-md"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        AI Analyzing... ({clozeCount} clozes)
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 mr-2" />
                        Upload PDF or Image
                      </>
                    )}
                  </Button>

                  {uploadedFile && (
                    <p className="text-sm text-muted-foreground">
                      📄 {uploadedFile}
                    </p>
                  )}

                  <div className="bg-muted/50 rounded-lg p-4 text-left max-w-md mx-auto">
                    <p className="text-sm font-medium mb-2">How it works:</p>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Upload your study material (PDF or image)</li>
                      <li>AI identifies {clozeCount} key concepts</li>
                      <li>AI marks important terms with {'{{cloze deletions}}'}</li>
                      <li>You can edit the result before creating cards</li>
                      <li>Each {'{{word}}'} becomes one flashcard</li>
                    </ol>
                  </div>
                </div>
              ) : (
                /* Show editable result after AI generation */
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-medium text-green-900 mb-2">✓ AI Generated Cloze Deletions</h3>
                    <p className="text-sm text-green-800">
                      Review the text below. The AI marked {(text.match(/\{\{[^}]+\}\}/g) || []).length} key concepts with {'{{cloze deletions}}'}.
                      <br />
                      <strong>You can edit this text!</strong> Add or remove {'{{braces}}'} as needed.
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Review & Edit AI Output</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setText('');
                        setUploadedFile(null);
                        setPreviewCards([]);
                      }}
                    >
                      Start Over
                    </Button>
                  </div>

                  <Textarea
                    value={text}
                    onChange={(e) => handleTextChange(e.target.value)}
                    className="min-h-[300px] font-mono text-sm"
                  />

                  <div className="text-xs text-muted-foreground bg-blue-50 border border-blue-200 p-3 rounded">
                    <strong>💡 Tips:</strong> Add {'{{braces}}'} around words you want to test. Remove them if AI wrapped too many.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        /* Manual Mode - Text Entry */
        <>
          <Card className="border-2 border-primary/20">
            <CardContent className="p-4 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <h3 className="font-medium text-blue-900 flex items-center gap-2">
                  📝 How to Create Cloze Deletions
                </h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p className="font-medium">Step 1: Write your sentence normally</p>
                  <div className="bg-white rounded p-2 font-mono text-xs">
                    The mitochondria is the powerhouse of the cell.
                  </div>

                  <p className="font-medium mt-3">Step 2: Wrap important words with {'{{'}double braces{'}}'}</p>
                  <div className="bg-white rounded p-2 font-mono text-xs">
                    The {'{{'}<span className="text-red-600 font-bold">mitochondria</span>{'}}'}  is the {'{{'}<span className="text-red-600 font-bold">powerhouse</span>{'}}'}  of the cell.
                  </div>

                  <p className="font-medium mt-3">Step 3: This creates 2 flashcards automatically:</p>
                  <div className="space-y-2">
                    <div className="bg-white rounded p-2 text-xs">
                      <div className="font-medium">Card 1:</div>
                      <div>Question: The <span className="border-b-2 border-blue-500 px-2">___________</span> is the powerhouse of the cell.</div>
                      <div className="text-primary font-medium">Answer: mitochondria</div>
                    </div>
                    <div className="bg-white rounded p-2 text-xs">
                      <div className="font-medium">Card 2:</div>
                      <div>Question: The mitochondria is the <span className="border-b-2 border-blue-500 px-2">___________</span> of the cell.</div>
                      <div className="text-primary font-medium">Answer: powerhouse</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Enter Your Text Below</label>
                <Button variant="outline" size="sm" onClick={handleAddExample}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Load Example
                </Button>
              </div>

              <Textarea
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Type here... Example: The {{mitochondria}} is the {{powerhouse}} of the cell."
                className="min-h-[200px] font-mono text-base"
              />

              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded">
                <span>💡</span>
                <div>
                  <strong>Pro Tips:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Each {'{{word}}'} creates one flashcard</li>
                    <li>You can have multiple clozes in one sentence</li>
                    <li>Use clozes for key terms, definitions, dates, formulas, etc.</li>
                    <li>The more clozes you add, the more flashcards you get!</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Preview */}
      {previewCards.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-medium">
              Preview ({previewCards.length} {previewCards.length === 1 ? 'card' : 'cards'})
            </h3>
            <div className="space-y-3">
              {previewCards.map((card, index) => (
                <div key={card.id} className="p-3 bg-muted rounded-lg space-y-2">
                  <div className="text-xs text-muted-foreground">Card {index + 1}</div>
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="font-medium">Question: </span>
                      {card.front}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Answer: </span>
                      <span className="text-primary">{card.back}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={previewCards.length === 0}>
          <Save className="h-4 w-4 mr-2" />
          Create {previewCards.length} {previewCards.length === 1 ? 'Card' : 'Cards'}
        </Button>
      </div>
    </div>
  );
}
