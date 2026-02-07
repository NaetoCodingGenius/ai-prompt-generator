'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { Flashcard } from '@/types/studyset';
import { useAppStore } from '@/store/appStore';

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  onExit: () => void;
}

export function FlashcardViewer({ flashcards, onExit }: FlashcardViewerProps) {
  const {
    currentCardIndex,
    showAnswer,
    toggleAnswer,
    nextCard,
    previousCard,
    resetStudyMode,
  } = useAppStore();

  const currentCard = flashcards[currentCardIndex];
  const isLastCard = currentCardIndex === flashcards.length - 1;
  const isFirstCard = currentCardIndex === 0;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
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
  }, [currentCardIndex, flashcards.length, isLastCard, isFirstCard, nextCard, previousCard, toggleAnswer]);

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
    resetStudyMode();
    onExit();
  };

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

      {/* Flashcard */}
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
        <p>Space/Enter = Flip • Left/Right Arrows = Navigate • Escape = Exit</p>
      </div>
    </div>
  );
}
