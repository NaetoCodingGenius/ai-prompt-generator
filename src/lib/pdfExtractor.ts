import pdf from 'pdf-parse';

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
    const data = await pdf(buffer);

    return {
      text: data.text,
      pageCount: data.numpages,
      metadata: data.info || {},
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
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
