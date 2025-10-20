import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface GameState {
  phase: 'clue' | 'question' | 'task' | 'discussion' | 'vote' | 'reveal';
  phaseEndsAt: any;
  askTurnUid: string | null;
  taskSeed: string | null;
  eliminatedUid?: string;
  eliminatedRole?: 'truth' | 'impostor';
  voteCounts?: { [uid: string]: number };
  gameResult?: 'impostor' | 'truth';
  impostorGuess?: string;
  realWord?: string;
}

export function useGameState(roomId: string | null) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      setGameState(null);
      setLoading(false);
      return;
    }

    const stateRef = doc(db, 'rooms', roomId, 'state', 'current');
    
    const unsubscribe = onSnapshot(
      stateRef,
      (doc) => {
        if (doc.exists()) {
          setGameState(doc.data() as GameState);
          setError(null);
        } else {
          setGameState(null);
          setError('Game state not found');
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to game state:', error);
        setError('Failed to load game state');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [roomId]);

  return { gameState, loading, error };
}
