'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Youtube, Loader2, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface YouTubeInputProps {
  onSuccess: (data: { text: string; title: string; duration?: number }) => void;
  isProcessing: boolean;
}

export function YouTubeInput({ onSuccess, isProcessing }: YouTubeInputProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualTranscript, setManualTranscript] = useState('');

  const handleManualSubmit = () => {
    if (!manualTranscript.trim()) {
      toast.error('Please paste the transcript text');
      return;
    }

    if (manualTranscript.length < 100) {
      toast.error('Transcript is too short (minimum 100 characters)');
      return;
    }

    // Clean the transcript text to avoid JSON parsing issues
    const cleanedText = manualTranscript
      .replace(/\r\n/g, ' ') // Replace Windows line breaks
      .replace(/\n/g, ' ')   // Replace Unix line breaks
      .replace(/\r/g, ' ')   // Replace Mac line breaks
      .replace(/\t/g, ' ')   // Replace tabs
      .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
      .trim();

    toast.success('Manual transcript loaded!');
    onSuccess({
      text: cleanedText,
      title: url.trim() || 'YouTube Video (Manual Transcript)',
    });

    // Reset
    setManualTranscript('');
    setShowManualInput(false);
    setUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/youtube-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to extract transcript');
        toast.error(data.error || 'Failed to extract transcript');
        return;
      }

      // Success!
      toast.success(`Extracted transcript from ${data.videoTitle || 'video'}!`);
      onSuccess({
        text: data.text,
        title: data.videoTitle || 'YouTube Video',
        duration: data.duration,
      });

      // Reset form
      setUrl('');
      setError(null);
    } catch (error) {
      console.error('YouTube transcript error:', error);
      const errorMsg = 'Failed to process YouTube video. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="youtube-url" className="flex items-center gap-2">
          <Youtube className="h-4 w-4 text-red-600" />
          YouTube Video URL
        </Label>
        <Input
          id="youtube-url"
          type="text"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
          }}
          disabled={isLoading || isProcessing}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Paste a link to any educational YouTube video with captions
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {error}
            <div className="mt-2 text-xs">
              <strong>Common causes:</strong>
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                <li>Creator disabled captions</li>
                <li>Video is age-restricted</li>
                <li>Video is private or deleted</li>
                <li>YouTube API restrictions</li>
              </ul>
              <Button
                variant="link"
                size="sm"
                onClick={() => setShowManualInput(true)}
                className="mt-2 p-0 h-auto text-xs"
              >
                → Try manual transcript paste instead
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={!url.trim() || isLoading || isProcessing}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Extracting Transcript...
          </>
        ) : (
          <>
            <Youtube className="h-4 w-4 mr-2" />
            Extract Transcript
          </>
        )}
      </Button>

      {/* Manual Transcript Input */}
      {showManualInput && (
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Manual Transcript Paste
            </Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowManualInput(false)}
              className="h-auto p-1"
            >
              Cancel
            </Button>
          </div>
          <Textarea
            placeholder="Paste the full video transcript here... (You can get this from YouTube by clicking 'Show transcript' below the video)"
            value={manualTranscript}
            onChange={(e) => setManualTranscript(e.target.value)}
            rows={8}
            className="font-mono text-xs"
          />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              How to get: YouTube → "..." → Show transcript → Copy all
            </span>
            <span className={manualTranscript.length < 100 ? 'text-amber-600 font-medium' : 'text-green-600 font-medium'}>
              {manualTranscript.length} chars {manualTranscript.length < 100 ? '(need 100+)' : '✓'}
            </span>
          </div>
          <Button
            onClick={handleManualSubmit}
            disabled={!manualTranscript.trim()}
            className="w-full"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Use This Transcript
          </Button>
        </div>
      )}

      {/* Alternative: Manual Input Button */}
      {!showManualInput && !error && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowManualInput(true)}
              className="bg-background px-2 text-muted-foreground hover:text-foreground"
            >
              Or paste transcript manually
            </Button>
          </div>
        </div>
      )}

      {/* Example Videos */}
      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
        <p className="text-xs font-medium">Auto-extraction works best with:</p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Khan Academy lectures</li>
          <li>• CrashCourse videos</li>
          <li>• Professor recorded lectures</li>
          <li>• Educational tutorials with captions</li>
        </ul>
        <p className="text-xs text-amber-600 mt-2">
          <strong>Note:</strong> If auto-extract fails, you can always paste the transcript manually!
        </p>
      </div>
    </form>
  );
}
