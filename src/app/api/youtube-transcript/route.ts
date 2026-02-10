import { NextRequest, NextResponse } from 'next/server';
import { extractTranscriptFromYouTube, getVideoInfo } from '@/lib/youtubeExtractor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'No YouTube URL provided' },
        { status: 400 }
      );
    }

    console.log('Processing YouTube URL:', url);

    // Extract transcript
    const result = await extractTranscriptFromYouTube(url);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    // Get video info
    const videoInfo = await getVideoInfo(url);

    return NextResponse.json({
      success: true,
      text: result.text,
      videoTitle: videoInfo.title || 'YouTube Video',
      duration: result.duration,
      thumbnail: videoInfo.thumbnail,
      textLength: result.text?.length || 0,
    });
  } catch (error) {
    console.error('YouTube transcript API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process YouTube video. Please try again.',
      },
      { status: 500 }
    );
  }
}
