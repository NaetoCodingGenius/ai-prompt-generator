'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, X } from 'lucide-react';
import { Flashcard, StudySet } from '@/types/studyset';
import { initializeCard } from '@/lib/spacedRepetition';
import toast from 'react-hot-toast';

interface BulkImportProps {
  onImport: (studySet: StudySet) => void;
  onCancel: () => void;
}

type ImportFormat = 'quizlet' | 'anki' | 'csv';

export function BulkImport({ onImport, onCancel }: BulkImportProps) {
  const [format, setFormat] = useState<ImportFormat>('quizlet');
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<Flashcard[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextImport = () => {
    if (!text.trim()) {
      toast.error('Please paste some content to import');
      return;
    }

    const cards = parseImportText(text, format);

    if (cards.length === 0) {
      toast.error('No valid flashcards found. Check the format.');
      return;
    }

    setPreview(cards);
    toast.success(`Found ${cards.length} flashcards!`);
  };

  const parseImportText = (content: string, importFormat: ImportFormat): Flashcard[] => {
    const lines = content.trim().split('\n').filter(line => line.trim());
    const cards: Flashcard[] = [];

    if (importFormat === 'quizlet') {
      // Quizlet format: "term\tdefinition" or "term | definition"
      for (const line of lines) {
        const parts = line.includes('\t') ? line.split('\t') : line.split('|');
        if (parts.length >= 2) {
          cards.push(
            initializeCard({
              id: crypto.randomUUID(),
              front: parts[0].trim(),
              back: parts[1].trim(),
            })
          );
        }
      }
    } else if (importFormat === 'csv') {
      // CSV format: "front","back"
      for (const line of lines) {
        // Simple CSV parsing (handle quoted fields)
        const match = line.match(/"([^"]*)"\s*,\s*"([^"]*)"/);
        if (match) {
          cards.push(
            initializeCard({
              id: crypto.randomUUID(),
              front: match[1].trim(),
              back: match[2].trim(),
            })
          );
        }
      }
    } else if (importFormat === 'anki') {
      // Anki export format: front;back
      for (const line of lines) {
        const parts = line.split(';');
        if (parts.length >= 2) {
          cards.push(
            initializeCard({
              id: crypto.randomUUID(),
              front: parts[0].trim(),
              back: parts[1].trim(),
            })
          );
        }
      }
    }

    return cards;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setText(content);

      // Auto-detect format from file extension
      if (file.name.endsWith('.txt')) {
        setFormat('anki');
      } else if (file.name.endsWith('.csv')) {
        setFormat('csv');
      }

      toast.success(`Loaded ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (preview.length === 0) {
      toast.error('No flashcards to import');
      return;
    }

    const studySet: StudySet = {
      id: crypto.randomUUID(),
      title: `Imported Study Set (${preview.length} cards)`,
      description: `Imported from ${format.toUpperCase()}`,
      sourceType: 'manual',
      sourceName: `Bulk Import (${format})`,
      flashcards: preview,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: {
        model: 'import',
        tokensUsed: 0,
        processingTime: 0,
      },
    };

    onImport(studySet);
    toast.success(`Imported ${preview.length} flashcards!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Bulk Import</h2>
          <p className="text-sm text-muted-foreground">
            Import existing flashcards from Quizlet, Anki, or CSV
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Format Selection */}
      <div className="grid grid-cols-3 gap-3">
        <Button
          variant={format === 'quizlet' ? 'default' : 'outline'}
          onClick={() => setFormat('quizlet')}
          className="h-auto py-4 flex-col"
        >
          <FileText className="h-6 w-6 mb-2" />
          <span className="font-medium">Quizlet</span>
          <span className="text-xs text-muted-foreground mt-1">Tab or | separated</span>
        </Button>

        <Button
          variant={format === 'anki' ? 'default' : 'outline'}
          onClick={() => setFormat('anki')}
          className="h-auto py-4 flex-col"
        >
          <FileText className="h-6 w-6 mb-2" />
          <span className="font-medium">Anki</span>
          <span className="text-xs text-muted-foreground mt-1">Semicolon separated</span>
        </Button>

        <Button
          variant={format === 'csv' ? 'default' : 'outline'}
          onClick={() => setFormat('csv')}
          className="h-auto py-4 flex-col"
        >
          <FileText className="h-6 w-6 mb-2" />
          <span className="font-medium">CSV</span>
          <span className="text-xs text-muted-foreground mt-1">Comma separated</span>
        </Button>
      </div>

      {/* Import Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Import Method</CardTitle>
          <CardDescription>
            Choose how to import your flashcards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".txt,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload File (.txt or .csv)
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or paste text</span>
            </div>
          </div>

          {/* Text Input */}
          <div className="space-y-2">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                format === 'quizlet'
                  ? 'term\tdefinition\nterm2\tdefinition2\n\nOr use:\nterm | definition\nterm2 | definition2'
                  : format === 'anki'
                  ? 'front;back\nfront2;back2'
                  : '"front","back"\n"front2","back2"'
              }
              className="min-h-[200px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {format === 'quizlet' && 'Each line: term[TAB]definition or term | definition'}
              {format === 'anki' && 'Each line: front;back'}
              {format === 'csv' && 'Each line: "front","back"'}
            </p>
          </div>

          <Button onClick={handleTextImport} className="w-full">
            Parse {format.toUpperCase()} Format
          </Button>
        </CardContent>
      </Card>

      {/* Preview */}
      {preview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview ({preview.length} cards)</CardTitle>
            <CardDescription>
              Review your imported flashcards before saving
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
            {preview.slice(0, 10).map((card, index) => (
              <div key={card.id} className="p-3 bg-muted rounded-lg space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded">
                    {index + 1}
                  </span>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-sm">{card.front}</p>
                    <p className="text-xs text-muted-foreground">{card.back}</p>
                  </div>
                </div>
              </div>
            ))}
            {preview.length > 10 && (
              <p className="text-sm text-muted-foreground text-center">
                ...and {preview.length - 10} more cards
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleImport} disabled={preview.length === 0}>
          Import {preview.length} {preview.length === 1 ? 'Card' : 'Cards'}
        </Button>
      </div>
    </div>
  );
}
