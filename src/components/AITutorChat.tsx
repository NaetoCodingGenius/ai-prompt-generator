'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStudyStore } from '@/store/studyStore';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AITutorChatProps {
  context: string; // Study material content
  title?: string;
}

const DAILY_MESSAGE_LIMIT = 3;

interface TutorUsage {
  count: number;
  date: string; // YYYY-MM-DD
}

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

function getTutorUsage(): TutorUsage {
  if (typeof window === 'undefined') return { count: 0, date: getTodayString() };

  const stored = localStorage.getItem('ai-tutor-usage');
  if (!stored) {
    return { count: 0, date: getTodayString() };
  }

  try {
    const usage = JSON.parse(stored) as TutorUsage;
    // Reset if new day
    if (usage.date !== getTodayString()) {
      return { count: 0, date: getTodayString() };
    }
    return usage;
  } catch {
    return { count: 0, date: getTodayString() };
  }
}

function updateTutorUsage(count: number) {
  if (typeof window === 'undefined') return;

  const usage: TutorUsage = {
    count,
    date: getTodayString()
  };
  localStorage.setItem('ai-tutor-usage', JSON.stringify(usage));
}

export function AITutorChat({ context, title }: AITutorChatProps) {
  const isPremium = useStudyStore((state) => state.isPremium);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load usage on mount
  useEffect(() => {
    const usage = getTutorUsage();
    setMessageCount(usage.count);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Check daily limit (skip for premium users)
    const usage = getTutorUsage();
    if (!isPremium && usage.count >= DAILY_MESSAGE_LIMIT) {
      toast.error(`Daily message limit reached (${DAILY_MESSAGE_LIMIT} messages). Upgrade to Premium for unlimited!`);
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage,
          context,
          conversationHistory: messages.slice(-10),
        }),
      });

      const data = await response.json();

      if (data.success && data.answer) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.answer },
        ]);

        // Increment usage count (only for free users)
        if (!isPremium) {
          const newCount = usage.count + 1;
          updateTutorUsage(newCount);
          setMessageCount(newCount);

          // Warn when approaching limit
          const remaining = DAILY_MESSAGE_LIMIT - newCount;
          if (remaining === 1) {
            toast('Only 1 message left today! Upgrade to Premium for unlimited.', { icon: '⚠️' });
          } else if (remaining === 0) {
            toast.error('Daily limit reached! Upgrade to Premium for unlimited messages.');
          }
        }
      } else {
        toast.error(data.error || 'Failed to get response');
      }
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    'Explain this concept in simpler terms',
    'Can you give me an example?',
    'What are the key points I should remember?',
    'How does this relate to other concepts?',
  ];

  const remainingMessages = isPremium ? 999 : DAILY_MESSAGE_LIMIT - messageCount;
  const isLimitReached = !isPremium && remainingMessages <= 0;

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            AI Tutor Chat
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              isPremium
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                : remainingMessages <= 1
                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            }`}>
              {isPremium ? 'Unlimited ✨' : `${remainingMessages} message${remainingMessages === 1 ? '' : 's'} left today`}
            </span>
          </div>
        </div>
        <CardDescription>
          {isLimitReached ? (
            <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
              <AlertCircle className="h-3 w-3" />
              Daily limit reached. Upgrade to Premium for unlimited messages!
            </span>
          ) : (
            <>Ask questions about {title || 'your study material'}</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <Sparkles className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ask me anything!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                I can help explain concepts, provide examples, or answer questions about your study material.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setInput(question)}
                    className="text-xs"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            placeholder={
              isLimitReached
                ? 'Daily message limit reached. Come back tomorrow!'
                : 'Ask a question about your study material...'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading || isLimitReached}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading || isLimitReached}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Press Enter to send • Shift+Enter for new line
        </p>
      </CardContent>
    </Card>
  );
}
