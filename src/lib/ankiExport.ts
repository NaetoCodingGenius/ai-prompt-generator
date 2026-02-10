import { StudySet, Flashcard } from '@/types/studyset';

/**
 * Export study set to Anki-compatible format
 * Anki can import tab-separated text files with front/back on each line
 */
export function exportToAnkiText(studySet: StudySet): string {
  const cards = studySet.flashcards;

  // Anki import format: Front [TAB] Back
  // One card per line
  const ankiText = cards
    .map((card) => {
      // Clean and escape text
      const front = cleanTextForAnki(card.front);
      const back = cleanTextForAnki(card.back);

      return `${front}\t${back}`;
    })
    .join('\n');

  return ankiText;
}

/**
 * Export study set to CSV format (alternative to .apkg)
 * Can be imported into Anki and other spaced repetition apps
 */
export function exportToCSV(studySet: StudySet): string {
  const cards = studySet.flashcards;

  // CSV with headers
  const header = 'Front,Back,Tags';
  const rows = cards.map((card) => {
    const front = escapeCSV(card.front);
    const back = escapeCSV(card.back);
    const tags = escapeCSV(studySet.title);

    return `${front},${back},${tags}`;
  });

  return [header, ...rows].join('\n');
}

/**
 * Clean text for Anki import
 * - Remove excessive whitespace
 * - Preserve line breaks as <br>
 * - Escape special characters
 */
function cleanTextForAnki(text: string): string {
  return text
    .trim()
    .replace(/\n/g, '<br>') // Preserve line breaks
    .replace(/\t/g, ' ')    // Replace tabs with spaces (tabs are delimiters)
    .replace(/"/g, '""');   // Escape quotes
}

/**
 * Escape text for CSV format
 */
function escapeCSV(text: string): string {
  // If text contains comma, quote, or newline, wrap in quotes
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/**
 * Download file helper
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export study set to Anki text file
 */
export function downloadAnkiExport(studySet: StudySet) {
  const ankiText = exportToAnkiText(studySet);
  const filename = `${studySet.title.replace(/[^a-z0-9]/gi, '_')}_anki.txt`;
  downloadFile(ankiText, filename, 'text/plain');
}

/**
 * Export study set to CSV file
 */
export function downloadCSVExport(studySet: StudySet) {
  const csv = exportToCSV(studySet);
  const filename = `${studySet.title.replace(/[^a-z0-9]/gi, '_')}_flashcards.csv`;
  downloadFile(csv, filename, 'text/csv');
}

/**
 * Export to JSON (for backup/import into this app later)
 */
export function downloadJSONExport(studySet: StudySet) {
  const json = JSON.stringify(studySet, null, 2);
  const filename = `${studySet.title.replace(/[^a-z0-9]/gi, '_')}_backup.json`;
  downloadFile(json, filename, 'application/json');
}
