import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Player {
  uid: string;
  displayName: string;
  photoURL: string | null;
  isReady: boolean;
  isConnected: boolean;
  lastSeen: any;
  joinedAt: any;
  role: 'truth' | 'impostor' | null;
}

export function usePlayers(roomId: string | null) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      setPlayers([]);
      setLoading(false);
      return;
    }

    const playersRef = collection(db, 'rooms', roomId, 'players');
    const q = query(playersRef, orderBy('joinedAt', 'asc'));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const playersList = snapshot.docs.map(doc => ({
          ...doc.data()
        } as Player));
        setPlayers(playersList);
        setError(null);
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to players:', error);
        setError('Failed to load players');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [roomId]);

  return { players, loading, error };
}
