'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { submitImpostorGuess } from '@/lib/gameFunctions';
import { GameState } from '@/hooks/useGameState';
import { Player } from '@/hooks/usePlayers';

interface RevealPhaseProps {
  roomId: string;
  gameState: GameState;
  players: Player[];
  currentPlayer: Player | undefined;
}

export function RevealPhase({ roomId, gameState, players, currentPlayer }: RevealPhaseProps) {
  const [guess, setGuess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isImpostor = currentPlayer?.role === 'impostor';
  const eliminatedPlayer = players.find(p => p.uid === gameState.eliminatedUid);

  const handleImpostorGuess = async () => {
    if (!guess.trim() || !currentPlayer) return;

    setIsSubmitting(true);
    try {
      await submitImpostorGuess(roomId, guess.trim());
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting guess:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Results</CardTitle>
        <CardDescription>
          {gameState.eliminatedRole === 'impostor' 
            ? 'The impostor has been eliminated!'
            : 'The impostor survived the vote!'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Elimination Results */}
        {eliminatedPlayer && (
          <div className="text-center py-4 border rounded-lg">
            <div className="text-lg font-medium mb-2">
              {eliminatedPlayer.displayName} was eliminated
            </div>
            <div className={`text-sm ${gameState.eliminatedRole === 'impostor' ? 'text-green-600' : 'text-red-600'}`}>
              {gameState.eliminatedRole === 'impostor' ? 'They were the impostor!' : 'They were innocent!'}
            </div>
          </div>
        )}

        {/* Vote Counts */}
        {gameState.voteCounts && (
          <div>
            <h4 className="font-medium mb-2">Vote Results:</h4>
            <div className="space-y-1">
              {Object.entries(gameState.voteCounts).map(([uid, count]) => {
                const player = players.find(p => p.uid === uid);
                return (
                  <div key={uid} className="flex justify-between text-sm">
                    <span>{player?.displayName || 'Unknown'}</span>
                    <span>{count} vote{count !== 1 ? 's' : ''}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Impostor Guess */}
        {isImpostor && !gameState.eliminatedUid && !submitted && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-red-600 font-medium mb-2">You survived!</div>
              <p className="text-sm text-gray-600">
                You have one chance to guess the secret word to win the game.
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                What is the secret word?
              </label>
              <Input
                placeholder="Enter your guess..."
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <Button 
              onClick={handleImpostorGuess}
              disabled={!guess.trim() || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Guess'}
            </Button>
          </div>
        )}

        {/* Final Results */}
        {gameState.gameResult && (
          <div className="text-center py-6 border rounded-lg">
            <div className={`text-2xl font-bold mb-2 ${
              gameState.gameResult === 'impostor' ? 'text-red-600' : 'text-green-600'
            }`}>
              {gameState.gameResult === 'impostor' ? 'Impostor Wins!' : 'Truth Holders Win!'}
            </div>
            {gameState.realWord && (
              <div className="text-sm text-gray-600">
                The secret word was: <span className="font-medium">{gameState.realWord}</span>
              </div>
            )}
            {gameState.impostorGuess && (
              <div className="text-sm text-gray-600">
                Impostor guessed: <span className="font-medium">{gameState.impostorGuess}</span>
              </div>
            )}
          </div>
        )}

        {/* Next Round Button */}
        <div className="text-center">
          <Button variant="outline" className="w-full">
            Play Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
