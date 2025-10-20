'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GameState } from '@/hooks/useGameState';
import { Player } from '@/hooks/usePlayers';

interface TaskPhaseProps {
  roomId: string;
  gameState: GameState;
  currentPlayer: Player | undefined;
}

export function TaskPhase({ roomId, gameState, currentPlayer }: TaskPhaseProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Your Task</CardTitle>
        <CardDescription>
          Complete the mini-task to earn points and help your team
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="text-blue-600 font-medium mb-2">Task Phase</div>
          <p className="text-sm text-gray-600">
            {currentPlayer?.role === 'impostor' 
              ? 'Complete the task to blend in (it might be slightly harder)'
              : 'Complete the task to help your team win!'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
