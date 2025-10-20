'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GameState } from '@/hooks/useGameState';

interface PhaseBannerProps {
  gameState: GameState | null;
}

export function PhaseBanner({ gameState }: PhaseBannerProps) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!gameState?.phaseEndsAt) return;

    const updateTimer = () => {
      const now = new Date();
      const endTime = gameState.phaseEndsAt.toDate();
      const diff = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
      setTimeLeft(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [gameState?.phaseEndsAt]);

  if (!gameState) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'clue': return 'bg-blue-500';
      case 'question': return 'bg-green-500';
      case 'task': return 'bg-purple-500';
      case 'discussion': return 'bg-orange-500';
      case 'vote': return 'bg-red-500';
      case 'reveal': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPhaseName = (phase: string) => {
    switch (phase) {
      case 'clue': return 'Give Clues';
      case 'question': return 'Ask Questions';
      case 'task': return 'Complete Task';
      case 'discussion': return 'Discuss';
      case 'vote': return 'Vote';
      case 'reveal': return 'Reveal';
      default: return phase;
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge className={`${getPhaseColor(gameState.phase)} text-white`}>
              {getPhaseName(gameState.phase)}
            </Badge>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {gameState.phase === 'question' && gameState.askTurnUid && 'Your turn to ask a question'}
            </span>
          </div>
          
          {timeLeft > 0 && (
            <div className="text-right">
              <div className="text-2xl font-mono font-bold">
                {formatTime(timeLeft)}
              </div>
              <div className="text-xs text-gray-500">Time Remaining</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
