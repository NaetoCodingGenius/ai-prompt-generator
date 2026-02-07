'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Flashcard, QuizResult } from '@/types/studyset';
import { CheckCircle2, XCircle, Trophy, RotateCcw } from 'lucide-react';

interface QuizModeProps {
  flashcards: Flashcard[];
  onExit: () => void;
}

export function QuizMode({ flashcards, onExit }: QuizModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [answers, setAnswers] = useState<QuizResult['answers']>([]);
  const [showResult, setShowResult] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) return;

    const correctAnswer = currentCard.back.toLowerCase().trim();
    const userAnswerNormalized = userAnswer.toLowerCase().trim();

    // Improved fuzzy matching logic
    const isCorrect = checkAnswerCorrectness(userAnswerNormalized, correctAnswer);

    const newAnswer = {
      cardId: currentCard.id,
      userAnswer: userAnswer,
      correctAnswer: currentCard.back,
      isCorrect,
    };

    setAnswers([...answers, newAnswer]);
    setShowResult(true);
  };

  // Smart answer matching function
  const checkAnswerCorrectness = (userAnswer: string, correctAnswer: string): boolean => {
    // Normalize: remove extra spaces, punctuation, and standardize separators
    const normalize = (text: string) => {
      return text
        .toLowerCase()
        .replace(/[.,;:!?()]/g, '') // Remove punctuation
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/\b(and|or|the|a|an|is|are|of|in|on|at|to|for)\b/g, '') // Remove common words
        .trim();
    };

    const normalizedUser = normalize(userAnswer);
    const normalizedCorrect = normalize(correctAnswer);

    // Exact match after normalization
    if (normalizedUser === normalizedCorrect) return true;

    // Extract key terms (words 3+ chars)
    const extractKeyTerms = (text: string): Set<string> => {
      return new Set(
        text
          .split(/[\s,;-]+/)
          .filter(word => word.length >= 3)
          .map(word => word.replace(/s$/, '')) // Remove plural 's'
      );
    };

    const userTerms = extractKeyTerms(normalizedUser);
    const correctTerms = extractKeyTerms(normalizedCorrect);

    // Check if user answer contains all key terms from correct answer
    const hasAllKeyTerms = Array.from(correctTerms).every(term => {
      // Check for exact match or partial match
      return Array.from(userTerms).some(userTerm =>
        userTerm.includes(term) || term.includes(userTerm) ||
        // Check for hyphenated variations (e.g., "non-metals" vs "nonmetals")
        userTerm.replace(/-/g, '') === term.replace(/-/g, '')
      );
    });

    if (hasAllKeyTerms && correctTerms.size > 0) return true;

    // Fallback: substring matching for short answers
    if (correctAnswer.length < 50) {
      return correctAnswer.includes(userAnswer) || userAnswer.includes(correctAnswer);
    }

    return false;
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
      setShowResult(false);
    } else {
      setQuizComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setUserAnswer('');
    setAnswers([]);
    setShowResult(false);
    setQuizComplete(false);
  };

  const getQuizResults = (): QuizResult => {
    const correct = answers.filter((a) => a.isCorrect).length;
    return {
      correct,
      total: answers.length,
      percentage: Math.round((correct / answers.length) * 100),
      answers,
    };
  };

  if (quizComplete) {
    const results = getQuizResults();
    const passed = results.percentage >= 70;

    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <Card className={passed ? 'border-green-500' : 'border-orange-500'}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Trophy className={`h-16 w-16 ${passed ? 'text-green-500' : 'text-orange-500'}`} />
            </div>
            <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
            <CardDescription>
              You scored {results.correct} out of {results.total}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Display */}
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-2">
                {results.percentage}%
              </div>
              <p className="text-muted-foreground">
                {passed ? '🎉 Great job!' : '💪 Keep studying!'}
              </p>
            </div>

            {/* Detailed Results */}
            <div className="space-y-3">
              <h3 className="font-semibold">Review Your Answers:</h3>
              <div className="max-h-[400px] overflow-y-auto space-y-3">
                {results.answers.map((answer, index) => (
                  <Card
                    key={index}
                    className={answer.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        {answer.isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 space-y-2">
                          <p className="font-medium text-sm">
                            {flashcards[index].front}
                          </p>
                          <div className="text-sm space-y-1">
                            <p className={answer.isCorrect ? 'text-green-700' : 'text-red-700'}>
                              Your answer: <span className="font-medium">{answer.userAnswer}</span>
                            </p>
                            {!answer.isCorrect && (
                              <p className="text-green-700">
                                Correct answer: <span className="font-medium">{answer.correctAnswer}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleRestart} variant="outline" className="flex-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Quiz
              </Button>
              <Button onClick={onExit} className="flex-1">
                Back to Study
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Question {currentIndex + 1} of {flashcards.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle>{currentCard.front}</CardTitle>
          <CardDescription>Type your answer below</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Your answer..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !showResult) {
                handleSubmitAnswer();
              } else if (e.key === 'Enter' && showResult) {
                handleNext();
              }
            }}
            disabled={showResult}
            className="text-lg py-6"
            autoFocus
          />

          {showResult && (
            <Card className={answers[answers.length - 1].isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  {answers[answers.length - 1].isCorrect ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className={`font-semibold ${answers[answers.length - 1].isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {answers[answers.length - 1].isCorrect ? 'Correct!' : 'Incorrect'}
                    </p>
                    {!answers[answers.length - 1].isCorrect && (
                      <p className="text-sm mt-1">
                        The correct answer is: <span className="font-medium">{currentCard.back}</span>
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            {!showResult ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={!userAnswer.trim()}
                className="flex-1"
                size="lg"
              >
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNext} className="flex-1" size="lg">
                {currentIndex < flashcards.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </Button>
            )}
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Press Enter to submit your answer
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
