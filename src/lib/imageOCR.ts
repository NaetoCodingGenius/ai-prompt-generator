import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
}

/**
 * Extract text from an image using Tesseract OCR
 * @param file - Image file (PNG, JPG, etc.)
 * @returns Extracted text and confidence score
 */
export async function extractTextFromImage(file: File): Promise<OCRResult> {
  try {
    const { data } = await Tesseract.recognize(file, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    return {
      text: data.text,
      confidence: data.confidence,
    };
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
}

/**
 * Validate image file
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'Image too large. Max 10MB.' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid image format. Use PNG, JPG, or WebP.',
    };
  }

  return { valid: true };
}
