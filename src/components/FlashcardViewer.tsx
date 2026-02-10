'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, RotateCcw, Eye, EyeOff, Frown, Meh, Smile, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { Flashcard } from '@/types/studyset';
import { useAppStore } from '@/store/appStore';
import { useStudyStore } from '@/store/studyStore';
import { ImageOcclusionCard } from '@/components/ImageOcclusionCard';
import { ClozeCard } from '@/components/ClozeCard';
import toast from 'react-hot-toast';

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  studySetId?: string; // Optional: for SRS tracking
  onExit: () => void;
}

export function FlashcardViewer({ flashcards, studySetId, onExit }: FlashcardViewerProps) {
  const {
    currentCardIndex,
    showAnswer,
    toggleAnswer,
    nextCard,
    previousCard,
    resetStudyMode,
  } = useAppStore();

  const { reviewCard, recordStudySession } = useStudyStore();

  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const currentCard = flashcards[currentCardIndex];
  const isLastCard = currentCardIndex === flashcards.length - 1;
  const isFirstCard = currentCardIndex === 0;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Rating shortcuts (0-5) when answer is shown
      if (showAnswer && studySetId && ['0', '1', '2', '3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        const quality = parseInt(e.key) as 0 | 1 | 2 | 3 | 4 | 5;
        handleRating(quality);
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggleAnswer();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (!isLastCard) nextCard(flashcards.length - 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!isFirstCard) previousCard();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentCardIndex, flashcards.length, isLastCard, isFirstCard, nextCard, previousCard, toggleAnswer, showAnswer, studySetId]);

  const handleNext = () => {
    if (!isLastCard) {
      nextCard(flashcards.length - 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstCard) {
      previousCard();
    }
  };

  const handleExitStudy = () => {
    // Record study session before exiting
    if (studySetId && currentCardIndex > 0) {
      recordStudySession(Date.now() - sessionStartTime);
    }
    resetStudyMode();
    onExit();
  };

  const handleRating = (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    if (!studySetId) {
      // If no study set ID, just move to next card
      if (!isLastCard) {
        nextCard(flashcards.length - 1);
      }
      return;
    }

    // Record the review with SRS algorithm
    reviewCard(studySetId, currentCard.id, quality);

    // Move to next card
    if (!isLastCard) {
      nextCard(flashcards.length - 1);
    }
  };

  // Track session start time for study duration
  const sessionStartTime = Date.now();

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Text-to-speech function
  const speakText = (text: string) => {
    if (!synthRef.current || !voiceEnabled) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for better comprehension
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast.error('Voice playback failed');
    };

    synthRef.current.speak(utterance);
  };

  // Stop speech
  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  // Auto-play when voice mode is enabled and card changes
  useEffect(() => {
    if (voiceEnabled && currentCard) {
      // Small delay to ensure state is updated
      const timeout = setTimeout(() => {
        const textToSpeak = showAnswer
          ? `${currentCard.front}. Answer: ${currentCard.back}`
          : currentCard.front;
        speakText(textToSpeak);
      }, 300);

      return () => {
        clearTimeout(timeout);
        stopSpeaking();
      };
    }
  }, [currentCardIndex, showAnswer, voiceEnabled, currentCard]);

  // Toggle voice mode
  const handleToggleVoice = () => {
    if (!synthRef.current) {
      toast.error('Voice mode is not supported in your browser');
      return;
    }

    if (voiceEnabled) {
      stopSpeaking();
      setVoiceEnabled(false);
      toast.success('Voice mode disabled');
    } else {
      setVoiceEnabled(true);
      toast.success('Voice mode enabled - cards will be read aloud');
      // Speak current card
      const textToSpeak = showAnswer
        ? `${currentCard.front}. Answer: ${currentCard.back}`
        : currentCard.front;
      speakText(textToSpeak);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  if (!currentCard) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Card {currentCardIndex + 1} of {flashcards.length}
          </span>
          <span>{Math.round(((currentCardIndex + 1) / flashcards.length) * 100)}% Complete</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentCardIndex + 1) / flashcards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Flashcard - Render based on type */}
      {currentCard.type === 'image-occlusion' ? (
        <div onClick={toggleAnswer}>
          <ImageOcclusionCard flashcard={currentCard} showAnswer={showAnswer} />
        </div>
      ) : currentCard.type === 'cloze' ? (
        <div onClick={toggleAnswer}>
          <ClozeCard flashcard={currentCard} showAnswer={showAnswer} />
        </div>
      ) : (
        <Card
          className="min-h-[400px] cursor-pointer transition-all duration-200 hover:shadow-lg"
          onClick={toggleAnswer}
        >
          <CardContent className="flex flex-col items-center justify-center p-12 min-h-[400px]">
            {/* Front/Back Indicator */}
            <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
              {showAnswer ? (
                <>
                  <Eye className="h-4 w-4" />
                  <span>Answer (click or press Space to flip)</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4" />
                  <span>Question (click or press Space to reveal answer)</span>
                </>
              )}
            </div>

            {/* Card Content */}
            <div className="text-center space-y-6 w-full">
              {!showAnswer ? (
                <div className="space-y-4">
                  <p className="text-2xl font-semibold leading-relaxed">{currentCard.front}</p>
                  <p className="text-sm text-muted-foreground italic">
                    Click anywhere to reveal answer
                  </p>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <p className="text-lg text-muted-foreground mb-2">{currentCard.front}</p>
                  <div className="border-t pt-6">
                    <p className="text-2xl leading-relaxed">{currentCard.back}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SRS Rating Buttons (only show when answer is visible and studySetId is provided) */}
      {showAnswer && studySetId && (
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="space-y-4">
              <p className="text-sm font-medium text-center">How well did you know this?</p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleRating(0)}
                  className="flex-col h-auto py-3 bg-red-50 hover:bg-red-100 border-red-200"
                >
                  <Frown className="h-5 w-5 text-red-500 mb-1" />
                  <span className="text-xs font-medium">Blackout</span>
                  <span className="text-xs text-muted-foreground">0</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleRating(1)}
                  className="flex-col h-auto py-3 bg-red-50 hover:bg-red-100 border-red-200"
                >
                  <Frown className="h-5 w-5 text-red-500 mb-1" />
                  <span className="text-xs font-medium">Wrong</span>
                  <span className="text-xs text-muted-foreground">1</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleRating(2)}
                  className="flex-col h-auto py-3 bg-orange-50 hover:bg-orange-100 border-orange-200"
                >
                  <Meh className="h-5 w-5 text-orange-500 mb-1" />
                  <span className="text-xs font-medium">Hard</span>
                  <span className="text-xs text-muted-foreground">2</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleRating(3)}
                  className="flex-col h-auto py-3 bg-yellow-50 hover:bg-yellow-100 border-yellow-200"
                >
                  <Smile className="h-5 w-5 text-yellow-600 mb-1" />
                  <span className="text-xs font-medium">Good</span>
                  <span className="text-xs text-muted-foreground">3</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleRating(4)}
                  className="flex-col h-auto py-3 bg-green-50 hover:bg-green-100 border-green-200"
                >
                  <Smile className="h-5 w-5 text-green-500 mb-1" />
                  <span className="text-xs font-medium">Easy</span>
                  <span className="text-xs text-muted-foreground">4</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleRating(5)}
                  className="flex-col h-auto py-3 bg-green-50 hover:bg-green-100 border-green-200"
                >
                  <Sparkles className="h-5 w-5 text-green-600 mb-1" />
                  <span className="text-xs font-medium">Perfect</span>
                  <span className="text-xs text-muted-foreground">5</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Your rating helps the app schedule optimal review times
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstCard}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleToggleVoice}
            className={`flex items-center gap-2 ${voiceEnabled ? 'bg-primary text-primary-foreground' : ''}`}
            title={voiceEnabled ? 'Disable voice mode' : 'Enable voice mode'}
          >
            {voiceEnabled ? (
              <>
                <Volume2 className="h-4 w-4" />
                {isSpeaking && <span className="animate-pulse">●</span>}
              </>
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            onClick={toggleAnswer}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Flip Card
          </Button>
          <Button variant="outline" onClick={handleExitStudy}>
            Exit Study Mode
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={isLastCard}
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>Keyboard Shortcuts:</p>
        <p>Space/Enter = Flip • Left/Right Arrows = Navigate{studySetId ? ' • 0-5 = Rate (when answer shown)' : ''}</p>
      </div>
    </div>
  );
}
