'use client';

import { Flashcard } from '@/types/studyset';
import { Card, CardContent } from '@/components/ui/card';

interface ClozeCardProps {
  flashcard: Flashcard;
  showAnswer: boolean;
}

export function ClozeCard({ flashcard, showAnswer }: ClozeCardProps) {
  if (flashcard.type !== 'cloze') {
    return null;
  }

  return (
    <Card className="w-full">
      <CardContent className="p-8">
        <div className="space-y-6 text-center">
          {/* Question with blank */}
          <div className="text-xl leading-relaxed">
            {flashcard.front.split('___________').map((part, index, arr) => (
              <span key={index}>
                {part}
                {index < arr.length - 1 && (
                  <span className="inline-block min-w-[120px] border-b-2 border-primary mx-2 px-3">
                    {showAnswer ? (
                      <span className="text-primary font-semibold">
                        {flashcard.back}
                      </span>
                    ) : (
                      <span className="text-transparent select-none">blank</span>
                    )}
                  </span>
                )}
              </span>
            ))}
          </div>

          {/* Answer */}
          {showAnswer && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Answer:</p>
              <p className="text-2xl font-bold text-primary">{flashcard.back}</p>
            </div>
          )}

          {/* Hint */}
          {!showAnswer && (
            <p className="text-sm text-muted-foreground italic">
              Click "Show Answer" to reveal
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
