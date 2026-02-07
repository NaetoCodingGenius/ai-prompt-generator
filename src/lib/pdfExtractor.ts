export interface PDFExtractionResult {
  text: string;
  pageCount: number;
  metadata: any;
}

/**
 * Extract text content from a PDF buffer using pdf2json
 * Works reliably in serverless environments like Vercel
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<PDFExtractionResult> {
  return new Promise((resolve, reject) => {
    try {
      console.log('Starting PDF extraction with pdf2json, buffer size:', buffer.length);

      // Dynamically import pdf2json
      const PDFParser = require('pdf2json');
      const pdfParser = new PDFParser();

      let pageCount = 0;
      const textParts: string[] = [];

      pdfParser.on('pdfParser_dataError', (errData: any) => {
        console.error('PDF parsing error:', errData);
        reject(new Error(`Failed to parse PDF: ${errData.parserError}`));
      });

      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        try {
          console.log('PDF data ready, processing pages...');

          // Extract text from each page
          if (pdfData.Pages && Array.isArray(pdfData.Pages)) {
            pageCount = pdfData.Pages.length;

            pdfData.Pages.forEach((page: any, pageIndex: number) => {
              const pageTexts: string[] = [];

              if (page.Texts && Array.isArray(page.Texts)) {
                page.Texts.forEach((textItem: any) => {
                  if (textItem.R && Array.isArray(textItem.R)) {
                    textItem.R.forEach((run: any) => {
                      if (run.T) {
                        // Decode URI-encoded text
                        const decodedText = decodeURIComponent(run.T);
                        pageTexts.push(decodedText);
                      }
                    });
                  }
                });
              }

              if (pageTexts.length > 0) {
                textParts.push(pageTexts.join(' '));
              }
            });
          }

          const text = textParts.join('\n\n');
          console.log('Text extraction complete, pages:', pageCount, 'text length:', text.length);

          if (!text || text.trim().length === 0) {
            reject(new Error('No text content extracted from PDF'));
            return;
          }

          resolve({
            text,
            pageCount,
            metadata: pdfData.Meta || {},
          });
        } catch (error) {
          console.error('Error processing PDF data:', error);
          reject(new Error(`Failed to process PDF data: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      });

      // Parse the PDF buffer
      pdfParser.parseBuffer(buffer);
    } catch (error) {
      console.error('PDF extraction error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error,
      });

      if (error instanceof Error) {
        reject(new Error(`Failed to extract text from PDF: ${error.message}`));
      } else {
        reject(new Error('Failed to extract text from PDF'));
      }
    }
  });
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
