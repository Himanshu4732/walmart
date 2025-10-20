'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { submitPlayerVote } from '@/lib/gameFunctions';
import { Player } from '@/hooks/usePlayers';

interface VotePhaseProps {
  roomId: string;
  players: Player[];
  currentPlayer: Player | undefined;
}

export function VotePhase({ roomId, players, currentPlayer }: VotePhaseProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleVote = async (targetUid: string) => {
    if (!currentPlayer || targetUid === currentPlayer.uid) return;

    setIsSubmitting(true);
    try {
      await submitPlayerVote(roomId, targetUid);
      setSubmitted(true);
      setSelectedPlayer(targetUid);
    } catch (error) {
      console.error('Error submitting vote:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentPlayer) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vote for the Impostor</CardTitle>
        <CardDescription>
          Who do you think is the impostor? Vote to eliminate them.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <div className="text-center py-8">
            <div className="text-green-600 font-medium mb-2">✓ Vote Submitted!</div>
            <p className="text-sm text-gray-600">
              You voted for {players.find(p => p.uid === selectedPlayer)?.displayName}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {players
                .filter(player => player.uid !== currentPlayer.uid)
                .map((player) => (
                  <Button
                    key={player.uid}
                    variant={selectedPlayer === player.uid ? 'default' : 'outline'}
                    onClick={() => handleVote(player.uid)}
                    disabled={isSubmitting}
                    className="h-12"
                  >
                    {player.displayName}
                  </Button>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
