'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, Loader2, AlertCircle } from 'lucide-react';
import { validatePDF } from '@/lib/pdfExtractor';
import toast from 'react-hot-toast';

interface FileUploaderProps {
  onUploadSuccess: (data: {
    text: string;
    fileName: string;
    pageCount: number;
  }) => void;
  isGenerating: boolean;
}

export function FileUploader({ onUploadSuccess, isGenerating }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files[0]) {
        handleFileSelect(files[0]);
      }
    },
    []
  );

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = async (file: File) => {
    // Validate file
    const validation = validatePDF(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    setSelectedFile(file);
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`PDF loaded: ${file.name}`);
        onUploadSuccess({
          text: data.text,
          fileName: data.fileName,
          pageCount: data.pageCount,
        });
      } else {
        toast.error(data.error || 'Failed to process PDF');
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file. Please try again.');
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card
      className={`border-2 border-dashed transition-colors ${
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-primary/50'
      } ${isGenerating ? 'opacity-50 pointer-events-none' : ''}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardContent className="flex flex-col items-center justify-center py-12 px-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading || isGenerating}
        />

        {isUploading ? (
          <>
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-lg font-medium">Processing PDF...</p>
            <p className="text-sm text-muted-foreground mt-1">
              Extracting text from {selectedFile?.name}
            </p>
          </>
        ) : selectedFile && !isUploading ? (
          <>
            <FileText className="h-12 w-12 text-green-600 mb-4" />
            <p className="text-lg font-medium text-green-600">PDF Loaded!</p>
            <p className="text-sm text-muted-foreground mt-1">{selectedFile.name}</p>
            <Button onClick={handleClick} variant="outline" className="mt-4">
              Choose Different File
            </Button>
          </>
        ) : (
          <>
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Upload your study material</p>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Drag and drop a PDF file here, or click to browse
            </p>
            <Button onClick={handleClick} disabled={isGenerating}>
              Choose PDF File
            </Button>
            <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Maximum file size: 10MB
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
