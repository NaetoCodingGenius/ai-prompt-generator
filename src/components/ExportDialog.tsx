'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Download, FileText, FileSpreadsheet, FileJson } from 'lucide-react';
import { StudySet } from '@/types/studyset';
import { downloadAnkiExport, downloadCSVExport, downloadJSONExport } from '@/lib/ankiExport';
import toast from 'react-hot-toast';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  studySet: StudySet | null;
}

export function ExportDialog({ isOpen, onClose, studySet }: ExportDialogProps) {
  if (!studySet) return null;

  const handleExport = (format: 'anki' | 'csv' | 'json') => {
    try {
      switch (format) {
        case 'anki':
          downloadAnkiExport(studySet);
          toast.success('Anki file downloaded! Import it into Anki to use.');
          break;
        case 'csv':
          downloadCSVExport(studySet);
          toast.success('CSV file downloaded!');
          break;
        case 'json':
          downloadJSONExport(studySet);
          toast.success('JSON backup downloaded!');
          break;
      }
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export. Please try again.');
    }
  };

  const exportOptions = [
    {
      id: 'anki',
      icon: FileText,
      title: 'Anki Format (.txt)',
      description: 'Import into Anki desktop or AnkiDroid',
      recommended: true,
    },
    {
      id: 'csv',
      icon: FileSpreadsheet,
      title: 'CSV Spreadsheet',
      description: 'Use with Excel, Google Sheets, or other apps',
      recommended: false,
    },
    {
      id: 'json',
      icon: FileJson,
      title: 'JSON Backup',
      description: 'Full backup with all metadata and progress',
      recommended: false,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Study Set
          </DialogTitle>
          <DialogDescription>
            Export "{studySet.title}" ({studySet.flashcards.length} cards) to various formats
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {exportOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Card
                key={option.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleExport(option.id as 'anki' | 'csv' | 'json')}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{option.title}</h3>
                      {option.recommended && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                          Recommended
                        </span>
                      )}
                    </div>
                    <CardDescription className="text-sm mt-1">
                      {option.description}
                    </CardDescription>
                  </div>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="bg-muted/50 rounded-lg p-4 mt-4">
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong> For Anki import, go to File → Import in Anki and select the
            downloaded .txt file. Make sure "Fields separated by: Tab" is selected.
          </p>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
