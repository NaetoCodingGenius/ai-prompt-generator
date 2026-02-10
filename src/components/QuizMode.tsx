'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Flashcard, QuizResult } from '@/types/studyset';
import { CheckCircle2, XCircle, Trophy, RotateCcw, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';

interface AIGradingResult {
  score: number;
  status: 'correct' | 'partial' | 'incorrect';
  feedback: string;
  reasoning_analysis: string;
  suggestions: string;
}

interface EnhancedQuizAnswer {
  cardId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  aiGrading?: AIGradingResult;
}

interface QuizModeProps {
  flashcards: Flashcard[];
  onExit: () => void;
  onRestart?: () => void;
}

export function QuizMode({ flashcards, onExit }: QuizModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [answers, setAnswers] = useState<EnhancedQuizAnswer[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [useAIGrading, setUseAIGrading] = useState(false);
  const [isGrading, setIsGrading] = useState(false);

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return;

    if (useAIGrading) {
      // Use AI grading
      setIsGrading(true);
      try {
        const response = await fetch('/api/grade-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: currentCard.front,
            correctAnswer: currentCard.back,
            studentAnswer: userAnswer,
          }),
        });

        const data = await response.json();

        if (!data.success) {
          toast.error('AI grading failed. Using standard grading.');
          // Fallback to standard grading
          const isCorrect = checkAnswerCorrectness(
            userAnswer.toLowerCase().trim(),
            currentCard.back.toLowerCase().trim(),
            currentCard.front.toLowerCase().trim()
          );

          const newAnswer: EnhancedQuizAnswer = {
            cardId: currentCard.id,
            userAnswer: userAnswer,
            correctAnswer: currentCard.back,
            isCorrect,
          };

          setAnswers([...answers, newAnswer]);
        } else {
          const aiGrading: AIGradingResult = data.grading;
          const isCorrect = aiGrading.status === 'correct';

          const newAnswer: EnhancedQuizAnswer = {
            cardId: currentCard.id,
            userAnswer: userAnswer,
            correctAnswer: currentCard.back,
            isCorrect,
            aiGrading,
          };

          setAnswers([...answers, newAnswer]);
        }
      } catch (error) {
        console.error('AI grading error:', error);
        toast.error('AI grading failed. Using standard grading.');

        // Fallback to standard grading
        const isCorrect = checkAnswerCorrectness(
          userAnswer.toLowerCase().trim(),
          currentCard.back.toLowerCase().trim(),
          currentCard.front.toLowerCase().trim()
        );

        const newAnswer: EnhancedQuizAnswer = {
          cardId: currentCard.id,
          userAnswer: userAnswer,
          correctAnswer: currentCard.back,
          isCorrect,
        };

        setAnswers([...answers, newAnswer]);
      } finally {
        setIsGrading(false);
        setShowResult(true);
      }
    } else {
      // Use standard fuzzy matching
      const question = currentCard.front.toLowerCase().trim();
      const correctAnswer = currentCard.back.toLowerCase().trim();
      const userAnswerNormalized = userAnswer.toLowerCase().trim();

      const isCorrect = checkAnswerCorrectness(userAnswerNormalized, correctAnswer, question);

      const newAnswer: EnhancedQuizAnswer = {
        cardId: currentCard.id,
        userAnswer: userAnswer,
        correctAnswer: currentCard.back,
        isCorrect,
      };

      setAnswers([...answers, newAnswer]);
      setShowResult(true);
    }
  };

  // Smart answer matching function - VERY LENIENT but filters question terms
  const checkAnswerCorrectness = (userAnswer: string, correctAnswer: string, question: string): boolean => {
    // Normalize: remove extra spaces, punctuation, and standardize separators
    const normalize = (text: string) => {
      return text
        .toLowerCase()
        .replace(/[.,;:!?()]/g, '') // Remove punctuation
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/\b(and|or|the|a|an|is|are|of|in|on|at|to|for|with|that|which|who|by)\b/g, '') // Remove common filler words
        .trim();
    };

    const normalizedUser = normalize(userAnswer);
    const normalizedCorrect = normalize(correctAnswer);
    const normalizedQuestion = normalize(question);

    // Exact match after normalization
    if (normalizedUser === normalizedCorrect) return true;

    // Extract key terms (words 3+ chars) and rank by importance
    const extractKeyTerms = (text: string): string[] => {
      return text
        .split(/[\s,;-]+/)
        .filter(word => word.length >= 3)
        .map(word => word.replace(/s$/, '')) // Remove plural 's'
        .filter(word => word.length >= 3); // Re-filter after removing 's'
    };

    // Extract terms from question to filter them out
    const questionTerms = new Set(extractKeyTerms(normalizedQuestion));

    // Filter out question terms from both user and correct answers
    const filterQuestionTerms = (terms: string[]): string[] => {
      return terms.filter(term => {
        // Don't filter if term doesn't appear in question
        const isInQuestion = Array.from(questionTerms).some(qTerm => {
          if (qTerm === term) return true;
          if (qTerm.includes(term) || term.includes(qTerm)) return true;
          // Check with typo tolerance
          return levenshteinDistance(qTerm, term) <= 1;
        });
        return !isInQuestion; // Keep terms NOT in question
      });
    };

    const userTermsRaw = extractKeyTerms(normalizedUser);
    const correctTermsRaw = extractKeyTerms(normalizedCorrect);

    // Filter out question terms - only match on answer-specific terms
    const userTerms = new Set(filterQuestionTerms(userTermsRaw));
    const correctTerms = filterQuestionTerms(correctTermsRaw);

    // Minimum quality check: answer must have at least some unique terms
    if (userTerms.size === 0) {
      return false; // User just repeated the question with no actual answer
    }

    // Count how many key terms from correct answer appear in user answer
    let matchedTerms = 0;
    const totalTerms = correctTerms.length;

    for (const correctTerm of correctTerms) {
      const isMatched = Array.from(userTerms).some(userTerm => {
        // Exact match
        if (userTerm === correctTerm) return true;
        // Partial match (one contains the other)
        if (userTerm.includes(correctTerm) || correctTerm.includes(userTerm)) return true;
        // Hyphenated variations (e.g., "non-metals" vs "nonmetals")
        if (userTerm.replace(/-/g, '') === correctTerm.replace(/-/g, '')) return true;
        // Very close match (edit distance 1-2 for typos)
        return levenshteinDistance(userTerm, correctTerm) <= 2;
      });

      if (isMatched) matchedTerms++;
    }

    // VERY LENIENT: Accept if user got 40% or more of the key terms
    // This means students don't need perfect wording, just the main concepts
    const matchPercentage = totalTerms > 0 ? matchedTerms / totalTerms : 0;
    if (matchPercentage >= 0.4) return true;

    // Also accept if user has at least 2 matching key terms (for any answer)
    // This catches cases where the user got the core concepts right
    if (matchedTerms >= 2) return true;

    // Fallback: substring matching for very short answers
    if (correctAnswer.length < 30) {
      return correctAnswer.includes(userAnswer) || userAnswer.includes(correctAnswer);
    }

    return false;
  };

  // Simple Levenshtein distance for typo tolerance
  const levenshteinDistance = (str1: string, str2: string): number => {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[len1][len2];
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

  const getQuizResults = () => {
    if (useAIGrading && answers.some(a => a.aiGrading)) {
      // Calculate score from AI grading
      const totalScore = answers.reduce((sum, a) => sum + (a.aiGrading?.score || 0), 0);
      const averageScore = totalScore / answers.length;
      const correct = answers.filter((a) => a.aiGrading?.status === 'correct').length;

      return {
        correct,
        total: answers.length,
        percentage: Math.round(averageScore),
        answers,
      };
    } else {
      // Standard grading
      const correct = answers.filter((a) => a.isCorrect).length;
      return {
        correct,
        total: answers.length,
        percentage: Math.round((correct / answers.length) * 100),
        answers,
      };
    }
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
                {results.answers.map((answer, index) => {
                  const hasAIGrading = answer.aiGrading;
                  const borderColor = hasAIGrading
                    ? answer.aiGrading!.status === 'correct'
                      ? 'border-green-200 bg-green-50'
                      : answer.aiGrading!.status === 'partial'
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-red-200 bg-red-50'
                    : answer.isCorrect
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50';

                  return (
                    <Card key={index} className={borderColor}>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          {hasAIGrading ? (
                            answer.aiGrading!.status === 'correct' ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            ) : answer.aiGrading!.status === 'partial' ? (
                              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            )
                          ) : answer.isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 space-y-2">
                            <p className="font-medium text-sm">
                              {flashcards[index].front}
                            </p>

                            {hasAIGrading ? (
                              <div className="text-sm space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">Score: {answer.aiGrading!.score}/100</span>
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    answer.aiGrading!.status === 'correct'
                                      ? 'bg-green-100 text-green-700'
                                      : answer.aiGrading!.status === 'partial'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}>
                                    {answer.aiGrading!.status === 'correct' ? 'Correct' : answer.aiGrading!.status === 'partial' ? 'Partial Credit' : 'Incorrect'}
                                  </span>
                                </div>
                                <p className="text-muted-foreground">
                                  Your answer: <span className="font-medium text-foreground">{answer.userAnswer}</span>
                                </p>
                                <p className="text-green-700">
                                  Correct answer: <span className="font-medium">{answer.correctAnswer}</span>
                                </p>
                                <div className="bg-white/50 p-3 rounded-md space-y-2 border">
                                  <p className="font-medium text-xs uppercase text-muted-foreground">AI Feedback:</p>
                                  <p className="text-sm">{answer.aiGrading!.feedback}</p>
                                  {answer.aiGrading!.reasoning_analysis && (
                                    <>
                                      <p className="font-medium text-xs uppercase text-muted-foreground mt-2">Reasoning Analysis:</p>
                                      <p className="text-sm">{answer.aiGrading!.reasoning_analysis}</p>
                                    </>
                                  )}
                                  {answer.aiGrading!.suggestions && (
                                    <>
                                      <p className="font-medium text-xs uppercase text-muted-foreground mt-2">Tips to Improve:</p>
                                      <p className="text-sm">{answer.aiGrading!.suggestions}</p>
                                    </>
                                  )}
                                </div>
                              </div>
                            ) : (
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
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
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
      {/* Quiz Header with Restart Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Quiz Mode</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRestart}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Restart Quiz
        </Button>
      </div>

      {/* AI Grading Toggle */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <div>
                <Label htmlFor="ai-grading" className="text-sm font-medium cursor-pointer">
                  AI-Powered Grading
                </Label>
                <p className="text-xs text-muted-foreground">
                  Get detailed feedback, partial credit, and reasoning analysis
                </p>
              </div>
            </div>
            <Switch
              id="ai-grading"
              checked={useAIGrading}
              onCheckedChange={setUseAIGrading}
              disabled={currentIndex > 0}
            />
          </div>
          {currentIndex > 0 && (
            <p className="text-xs text-amber-600 mt-2">
              Cannot change grading mode mid-quiz. Restart to use AI grading.
            </p>
          )}
        </CardContent>
      </Card>

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
            <Card className={
              answers[answers.length - 1].aiGrading
                ? answers[answers.length - 1].aiGrading!.status === 'correct'
                  ? 'border-green-500 bg-green-50'
                  : answers[answers.length - 1].aiGrading!.status === 'partial'
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-red-500 bg-red-50'
                : answers[answers.length - 1].isCorrect
                ? 'border-green-500 bg-green-50'
                : 'border-red-500 bg-red-50'
            }>
              <CardContent className="pt-4">
                {answers[answers.length - 1].aiGrading ? (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      {answers[answers.length - 1].aiGrading!.status === 'correct' ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                      ) : answers[answers.length - 1].aiGrading!.status === 'partial' ? (
                        <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`font-semibold ${
                            answers[answers.length - 1].aiGrading!.status === 'correct'
                              ? 'text-green-700'
                              : answers[answers.length - 1].aiGrading!.status === 'partial'
                              ? 'text-yellow-700'
                              : 'text-red-700'
                          }`}>
                            Score: {answers[answers.length - 1].aiGrading!.score}/100
                          </p>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            answers[answers.length - 1].aiGrading!.status === 'correct'
                              ? 'bg-green-100 text-green-700'
                              : answers[answers.length - 1].aiGrading!.status === 'partial'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {answers[answers.length - 1].aiGrading!.status === 'correct' ? 'Correct' : answers[answers.length - 1].aiGrading!.status === 'partial' ? 'Partial Credit' : 'Incorrect'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Correct answer: <span className="font-medium text-foreground">{currentCard.back}</span>
                        </p>
                        <div className="bg-white/70 p-3 rounded-md text-sm space-y-2">
                          <p><strong>Feedback:</strong> {answers[answers.length - 1].aiGrading!.feedback}</p>
                          {answers[answers.length - 1].aiGrading!.reasoning_analysis && (
                            <p><strong>Reasoning:</strong> {answers[answers.length - 1].aiGrading!.reasoning_analysis}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
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
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            {!showResult ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={!userAnswer.trim() || isGrading}
                className="flex-1"
                size="lg"
              >
                {isGrading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    AI Grading...
                  </>
                ) : (
                  <>
                    {useAIGrading && <Sparkles className="h-4 w-4 mr-2" />}
                    Submit Answer
                  </>
                )}
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
