'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Clock, Coffee } from 'lucide-react';
import toast from 'react-hot-toast';

const WORK_DURATION = 25 * 60; // 25 minutes
const BREAK_DURATION = 5 * 60; // 5 minutes
const LONG_BREAK_DURATION = 15 * 60; // 15 minutes

type TimerMode = 'work' | 'break' | 'long-break';

interface StudyTimerProps {
  onSessionComplete?: (duration: number) => void;
}

export function StudyTimer({ onSessionComplete }: StudyTimerProps) {
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [totalStudyTime, setTotalStudyTime] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create notification sound (simple beep)
    if (typeof window !== 'undefined') {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioRef.current = new Audio();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });

        // Track study time (only during work sessions)
        if (mode === 'work') {
          setTotalStudyTime((prev) => prev + 1);
        }
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, mode]);

  const handleTimerComplete = () => {
    setIsRunning(false);

    // Play notification sound
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Study Timer', {
        body: mode === 'work' ? 'Great work! Time for a break.' : 'Break over! Ready to study?',
        icon: '/icon-192.png',
      });
    }

    // Show toast notification
    if (mode === 'work') {
      setSessionsCompleted((prev) => prev + 1);
      toast.success('🎉 Study session complete! Take a break.', { duration: 5000 });

      // Callback for session tracking
      if (onSessionComplete) {
        onSessionComplete(WORK_DURATION);
      }

      // Determine next break type
      const nextSessions = sessionsCompleted + 1;
      if (nextSessions % 4 === 0) {
        setMode('long-break');
        setTimeLeft(LONG_BREAK_DURATION);
        toast('Time for a long break! You deserve it.', { icon: '☕' });
      } else {
        setMode('break');
        setTimeLeft(BREAK_DURATION);
      }
    } else {
      setMode('work');
      setTimeLeft(WORK_DURATION);
      toast.success('✨ Break over! Ready to study?');
    }
  };

  const toggleTimer = () => {
    if (!isRunning && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setMode('work');
    setTimeLeft(WORK_DURATION);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTotalTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const progressPercentage = () => {
    const total = mode === 'work' ? WORK_DURATION : mode === 'break' ? BREAK_DURATION : LONG_BREAK_DURATION;
    return ((total - timeLeft) / total) * 100;
  };

  return (
    <Card className={`${mode !== 'work' ? 'border-green-500 bg-green-50/50' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pomodoro Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mode Indicator */}
        <div className="flex justify-center gap-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${mode === 'work' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            Work
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${mode === 'break' ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
            Break
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${mode === 'long-break' ? 'bg-green-600 text-white' : 'bg-muted text-muted-foreground'}`}>
            Long Break
          </div>
        </div>

        {/* Timer Display */}
        <div className="text-center">
          <div className="text-6xl font-bold mb-4 font-mono">
            {formatTime(timeLeft)}
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${mode === 'work' ? 'bg-primary' : 'bg-green-500'}`}
              style={{ width: `${progressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-2">
          <Button
            onClick={toggleTimer}
            size="lg"
            className="w-32"
          >
            {isRunning ? (
              <>
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Start
              </>
            )}
          </Button>
          <Button
            onClick={resetTimer}
            size="lg"
            variant="outline"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold">{sessionsCompleted}</div>
            <div className="text-xs text-muted-foreground">Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{formatTotalTime(totalStudyTime)}</div>
            <div className="text-xs text-muted-foreground">Total Time</div>
          </div>
        </div>

        {/* Next Break Info */}
        {mode === 'work' && (
          <div className="text-center text-sm text-muted-foreground">
            <Coffee className="h-4 w-4 inline mr-1" />
            {(sessionsCompleted + 1) % 4 === 0 ? 'Long break after this session' : `${4 - ((sessionsCompleted + 1) % 4)} sessions until long break`}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
