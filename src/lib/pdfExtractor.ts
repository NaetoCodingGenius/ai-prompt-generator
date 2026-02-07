export interface PDFExtractionResult {
  text: string;
  pageCount: number;
  metadata: any;
}

/**
 * Extract text content from a PDF buffer
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<PDFExtractionResult> {
  try {
    console.log('Starting PDF extraction, buffer size:', buffer.length);

    // Use require for better CommonJS compatibility in serverless
    const pdf = require('pdf-parse');
    console.log('pdf-parse loaded successfully');

    const data = await pdf(buffer);
    console.log('PDF parsed successfully, pages:', data.numpages, 'text length:', data.text?.length);

    if (!data.text) {
      throw new Error('No text content extracted from PDF');
    }

    return {
      text: data.text,
      pageCount: data.numpages,
      metadata: data.info || {},
    };
  } catch (error) {
    console.error('PDF extraction error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error,
    });

    if (error instanceof Error) {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Validate PDF file before processing
 */
export function validatePDF(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File too large. Maximum size is 10MB.' };
  }

  if (file.type !== 'application/pdf') {
    return {
      valid: false,
      error: 'Invalid file type. Only PDF files are supported.',
    };
  }

  return { valid: true };
}

/**
 * Validate extracted text content
 */
export function validateExtractedText(text: string): { valid: boolean; error?: string } {
  const MIN_TEXT_LENGTH = 100;

  if (!text || text.trim().length < MIN_TEXT_LENGTH) {
    return {
      valid: false,
      error: 'No readable text found in PDF. Please ensure the PDF contains text content.',
    };
  }

  return { valid: true };
}
