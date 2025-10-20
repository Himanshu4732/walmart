'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { submitPlayerClue } from '@/lib/gameFunctions';
import { Player } from '@/hooks/usePlayers';

interface CluePhaseProps {
  roomId: string;
  currentPlayer: Player | undefined;
}

export function CluePhase({ roomId, currentPlayer }: CluePhaseProps) {
  const [clue, setClue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitClue = async () => {
    if (!clue.trim() || !currentPlayer) return;

    setIsSubmitting(true);
    try {
      await submitPlayerClue(roomId, clue.trim());
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting clue:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentPlayer) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Give Your Clue</CardTitle>
        <CardDescription>
          {currentPlayer.role === 'impostor' 
            ? 'Try to blend in! Give a clue that sounds like it could be about the secret word.'
            : 'Give a one-word clue about the secret word. Help others guess what it is!'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <div className="text-center py-8">
            <div className="text-green-600 font-medium mb-2">✓ Clue Submitted!</div>
            <p className="text-sm text-gray-600">Waiting for other players...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Your Clue (one word)
              </label>
              <Input
                placeholder="Enter your clue..."
                value={clue}
                onChange={(e) => setClue(e.target.value)}
                maxLength={20}
                className="mt-1"
              />
            </div>
            
            <Button 
              onClick={handleSubmitClue}
              disabled={!clue.trim() || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Clue'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
