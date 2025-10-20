'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Player } from '@/hooks/usePlayers';

interface DiscussionPhaseProps {
  roomId: string;
  players: Player[];
  currentPlayer: Player | undefined;
}

export function DiscussionPhase({ }: DiscussionPhaseProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Discussion Phase</CardTitle>
        <CardDescription>
          Discuss with other players and try to identify the impostor
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="text-orange-600 font-medium mb-2">Discuss!</div>
          <p className="text-sm text-gray-600">
            Talk with other players about the clues and try to figure out who the impostor is
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
