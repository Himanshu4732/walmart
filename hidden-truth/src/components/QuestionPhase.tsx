'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GameState } from '@/hooks/useGameState';
import { Player } from '@/hooks/usePlayers';

interface QuestionPhaseProps {
  roomId: string;
  gameState: GameState;
  players: Player[];
  currentPlayer: Player | undefined;
}

export function QuestionPhase({ gameState, players, currentPlayer }: QuestionPhaseProps) {
  const isMyTurn = currentPlayer && gameState.askTurnUid === currentPlayer.uid;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Question Phase</CardTitle>
        <CardDescription>
          Take turns asking questions to other players about their clues
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isMyTurn ? (
          <div className="text-center py-8">
            <div className="text-green-600 font-medium mb-2">It&apos;s your turn!</div>
            <p className="text-sm text-gray-600">Ask a question to another player</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-blue-600 font-medium mb-2">
              {players.find(p => p.uid === gameState.askTurnUid)?.displayName}&apos;s turn
            </div>
            <p className="text-sm text-gray-600">Waiting for them to ask a question&hellip;</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
