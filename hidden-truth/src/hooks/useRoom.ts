import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Room {
  id: string;
  code: string;
  hostUid: string;
  status: 'lobby' | 'inRound' | 'revealing' | 'ended';
  maxPlayers: number;
  playerCount: number;
  createdAt: unknown;
  updatedAt: unknown;
  startedAt?: unknown;
}

export function useRoom(roomId: string | null) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      setRoom(null);
      setLoading(false);
      return;
    }

    const roomRef = doc(db, 'rooms', roomId);
    const unsubscribe = onSnapshot(
      roomRef,
      (doc) => {
        if (doc.exists()) {
          setRoom({ id: doc.id, ...doc.data() } as Room);
          setError(null);
        } else {
          setRoom(null);
          setError('Room not found');
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to room:', error);
        setError('Failed to load room');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [roomId]);

  return { room, loading, error };
}
