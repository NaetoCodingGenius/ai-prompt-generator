'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, Loader2, AlertCircle, Image } from 'lucide-react';
import { validatePDF } from '@/lib/pdfExtractor';
import { validateImage, extractTextFromImage } from '@/lib/imageOCR';
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
    // Check if it's an image or PDF
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';

    if (!isImage && !isPDF) {
      toast.error('Please upload a PDF or image file (PNG, JPG, WebP)');
      return;
    }

    // Validate based on file type
    if (isPDF) {
      const validation = validatePDF(file);
      if (!validation.valid) {
        toast.error(validation.error || 'Invalid PDF file');
        return;
      }
    } else if (isImage) {
      const validation = validateImage(file);
      if (!validation.valid) {
        toast.error(validation.error || 'Invalid image file');
        return;
      }
    }

    setSelectedFile(file);

    // Process file based on type
    if (isPDF) {
      await uploadFile(file);
    } else if (isImage) {
      await processImage(file);
    }
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

  const processImage = async (file: File) => {
    setIsUploading(true);

    try {
      toast.loading('Extracting text from image...', { id: 'ocr-progress' });

      // Extract text using Tesseract OCR
      const { text, confidence } = await extractTextFromImage(file);

      toast.dismiss('ocr-progress');

      if (!text || text.trim().length < 50) {
        toast.error('Could not extract enough text from image. Try a clearer image.');
        setSelectedFile(null);
        return;
      }

      toast.success(`Text extracted from ${file.name} (${Math.round(confidence)}% confidence)`);

      onUploadSuccess({
        text: text,
        fileName: file.name,
        pageCount: 1, // Images are treated as 1 page
      });
    } catch (error) {
      console.error('OCR error:', error);
      toast.error('Failed to extract text from image. Please try again.');
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
          accept="application/pdf,image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading || isGenerating}
        />

        {isUploading ? (
          <>
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-lg font-medium">
              {selectedFile?.type.startsWith('image/') ? 'Extracting text from image...' : 'Processing PDF...'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedFile?.name}
            </p>
          </>
        ) : selectedFile && !isUploading ? (
          <>
            {selectedFile.type.startsWith('image/') ? (
              <Image className="h-12 w-12 text-green-600 mb-4" />
            ) : (
              <FileText className="h-12 w-12 text-green-600 mb-4" />
            )}
            <p className="text-lg font-medium text-green-600">File Loaded!</p>
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
              Drag and drop a PDF or image file here, or click to browse
            </p>
            <Button onClick={handleClick} disabled={isGenerating}>
              Choose File
            </Button>
            <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Supports: PDF, PNG, JPG, WebP • Max 10MB
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
