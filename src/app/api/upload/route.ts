import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF, validateExtractedText } from '@/lib/pdfExtractor';
import { UploadResponse } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' } as UploadResponse,
        { status: 400 }
      );
    }

    // Validate file type and size (done client-side too, but double-check)
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only PDF files are supported.' } as UploadResponse,
        { status: 400 }
      );
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 10MB.' } as UploadResponse,
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text from PDF
    console.log('Attempting to extract text from PDF:', file.name, 'size:', buffer.length);
    const { text, pageCount } = await extractTextFromPDF(buffer);
    console.log('Extraction successful, text length:', text.length, 'pages:', pageCount);

    // Validate extracted text
    const validation = validateExtractedText(text);
    if (!validation.valid) {
      console.log('Text validation failed:', validation.error);
      return NextResponse.json(
        { success: false, error: validation.error } as UploadResponse,
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      text,
      pageCount,
      fileName: file.name,
    } as UploadResponse);
  } catch (error) {
    console.error('PDF upload error - Full details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    let errorMessage = 'Failed to process PDF';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { success: false, error: errorMessage } as UploadResponse,
      { status: 500 }
    );
  }
}

// Note: Next.js App Router handles file uploads automatically
// No body parser config needed - file size limits are managed by the server
