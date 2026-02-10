import { YoutubeTranscript } from 'youtube-transcript';

export interface TranscriptResult {
  success: boolean;
  text?: string;
  error?: string;
  videoTitle?: string;
  duration?: number;
}

/**
 * Extract video ID from various YouTube URL formats
 */
export function extractVideoId(url: string): string | null {
  // Clean the URL
  url = url.trim();

  // Handle different YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Validate YouTube URL
 */
export function validateYouTubeUrl(url: string): { valid: boolean; error?: string } {
  if (!url || url.trim().length === 0) {
    return { valid: false, error: 'Please enter a YouTube URL' };
  }

  const videoId = extractVideoId(url);

  if (!videoId) {
    return {
      valid: false,
      error: 'Invalid YouTube URL. Use format: youtube.com/watch?v=VIDEO_ID or youtu.be/VIDEO_ID'
    };
  }

  if (videoId.length !== 11) {
    return {
      valid: false,
      error: 'Invalid video ID length'
    };
  }

  return { valid: true };
}

/**
 * Extract transcript from YouTube video using youtube-transcript package
 */
export async function extractTranscriptFromYouTube(
  url: string
): Promise<TranscriptResult> {
  try {
    // Validate URL
    const validation = validateYouTubeUrl(url);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return {
        success: false,
        error: 'Could not extract video ID from URL',
      };
    }

    console.log(`Fetching transcript for video ID: ${videoId}`);

    // Try to fetch transcript with multiple fallback options
    let transcriptItems;

    try {
      // First try: English language
      transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: 'en',
      });
    } catch (firstError: any) {
      console.log('First attempt failed, trying any available language...', firstError.message);

      try {
        // Second try: Any available transcript
        transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
      } catch (secondError: any) {
        console.log('All transcript fetch attempts failed:', secondError.message);
        throw secondError;
      }
    }

    if (!transcriptItems || transcriptItems.length === 0) {
      return {
        success: false,
        error: 'No transcript found. This video may not have captions enabled.',
      };
    }

    // Combine all transcript text
    const fullText = transcriptItems
      .map((item: any) => item.text)
      .join(' ')
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    if (fullText.length < 100) {
      return {
        success: false,
        error: 'Transcript too short (less than 100 characters). This may not be a valid educational video.',
      };
    }

    // Get video duration (approximate from last timestamp)
    const lastItem = transcriptItems[transcriptItems.length - 1];
    const duration = lastItem?.offset ? Math.floor(lastItem.offset / 1000) : undefined;

    console.log(`Successfully extracted transcript: ${fullText.length} characters`);

    return {
      success: true,
      text: fullText,
      duration,
    };
  } catch (error: any) {
    console.error('YouTube transcript extraction error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      videoId: videoId,
    });

    // Parse specific error types
    if (error.message?.includes('Transcript is disabled')) {
      return {
        success: false,
        error: 'This video has captions disabled by the creator. Try the manual transcript option below.',
      };
    }

    if (error.message?.includes('No transcripts available') || error.message?.includes('Could not find captions')) {
      return {
        success: false,
        error: 'No captions available for this video. Try the manual transcript option - click "..." below the YouTube video → "Show transcript" → copy and paste.',
      };
    }

    if (error.message?.includes('Video unavailable')) {
      return {
        success: false,
        error: 'Video is unavailable. It may be private, deleted, or region-restricted.',
      };
    }

    if (error.message?.includes('age')) {
      return {
        success: false,
        error: 'This video is age-restricted. Use the manual transcript option instead.',
      };
    }

    // Generic error with debug info
    return {
      success: false,
      error: `Failed to extract transcript automatically. Error: ${error.message || 'Unknown error'}. Try using the manual transcript option below.`,
    };
  }
}

/**
 * Get video info from URL (title, duration, etc.)
 */
export async function getVideoInfo(url: string): Promise<{
  title?: string;
  duration?: number;
  thumbnail?: string;
}> {
  try {
    const videoId = extractVideoId(url);
    if (!videoId) return {};

    // Use oembed API to get basic info (no API key needed)
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );

    if (!response.ok) return {};

    const data = await response.json();

    return {
      title: data.title,
      thumbnail: data.thumbnail_url,
    };
  } catch (error) {
    console.error('Failed to fetch video info:', error);
    return {};
  }
}
