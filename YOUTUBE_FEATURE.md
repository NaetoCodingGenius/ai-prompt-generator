# YouTube Transcript Feature

## Overview
Added YouTube video support - users can now paste YouTube URLs to extract transcripts and generate flashcards automatically.

## How It Works

### 1. User Flow
1. User clicks "YouTube URL" tab on upload page
2. Pastes a YouTube video link (e.g., `https://www.youtube.com/watch?v=VIDEO_ID`)
3. Clicks "Extract Transcript"
4. System fetches transcript using `youtube-transcript` package
5. Transcript is processed same as PDF text → generates flashcards

### 2. What Videos Work

**✅ WILL WORK:**
- Educational videos with auto-generated captions
- Videos with manual captions added by creator
- Khan Academy, CrashCourse, MIT OpenCourseWare
- Most professor lectures and tutorials

**❌ WON'T WORK:**
- Videos with captions disabled by creator
- Age-restricted videos
- Private or unlisted videos (without permission)
- Live streams
- Videos without any captions

### 3. Error Handling

The system provides specific error messages:
- "This video has captions disabled" - Creator turned off captions
- "No captions available" - Video doesn't have captions
- "Video is unavailable" - Private, deleted, or region-restricted
- "This video is age-restricted" - Can't be processed automatically

## Technical Implementation

### New Files Created

**1. `src/lib/youtubeExtractor.ts`**
- Validates YouTube URLs (handles youtube.com/watch?v=, youtu.be/, and video IDs)
- Extracts transcript using youtube-transcript package
- Gets video metadata (title, duration) via YouTube oEmbed API
- Robust error handling with specific error messages

**2. `src/app/api/youtube-transcript/route.ts`**
- API endpoint for YouTube transcript extraction
- Returns: transcript text, video title, duration, thumbnail
- Error handling and validation

**3. `src/components/YouTubeInput.tsx`**
- UI component for YouTube URL input
- Loading states, error display
- Examples of compatible videos

### Modified Files

**1. `src/app/page.tsx`**
- Added tabs for PDF vs YouTube input
- Added `uploadSource` state to track whether content is from PDF or YouTube
- Updated UI text to be generic ("Upload Material" instead of "Upload PDF")
- Updated study set source type detection to use `uploadSource` state

**2. `src/components/ui/tabs.tsx`**
- Already existed (using radix-ui package)

## Testing Checklist

- [ ] Test with Khan Academy video
- [ ] Test with CrashCourse video
- [ ] Test with video that has captions disabled (should show clear error)
- [ ] Test with invalid URL (should show error)
- [ ] Test with age-restricted video (should show error)
- [ ] Verify flashcards generate correctly from YouTube transcript
- [ ] Verify study set shows YouTube icon in list
- [ ] Verify "3 generations left" decrements for YouTube too

## Example URLs to Test

**Should Work:**
- https://www.youtube.com/watch?v=aircAruvnKk (3Blue1Brown)
- https://www.youtube.com/watch?v=fNk_zzaMoSs (CrashCourse)
- https://www.youtube.com/watch?v=d0Z8wLLPNE0 (Khan Academy)

**Should Fail Gracefully:**
- Private video
- Video with captions disabled
- Invalid URL

## Cost Impact

**YouTube transcript extraction:**
- FREE (uses youtube-transcript package, no API key needed)
- Only costs are Claude API for flashcard generation (same as PDF)

**Expected cost per YouTube video:**
- Transcript extraction: $0.00
- Flashcard generation: ~$0.004 (same as PDF)
- **Total: ~$0.004 per video**

## Value Add

This feature dramatically increases the app's value:
- **Before:** Limited to students with PDF notes
- **After:** Any student watching YouTube lectures can use it
- **Market expansion:** 10x larger audience (most students watch video lectures)
- **Viral potential:** "I turned a 40-min lecture into flashcards!" posts
