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
    const { text, pageCount } = await extractTextFromPDF(buffer);

    // Validate extracted text
    const validation = validateExtractedText(text);
    if (!validation.valid) {
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
    console.error('PDF upload error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to process PDF';

    return NextResponse.json(
      { success: false, error: errorMessage } as UploadResponse,
      { status: 500 }
    );
  }
}

// Configure route to handle larger file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
