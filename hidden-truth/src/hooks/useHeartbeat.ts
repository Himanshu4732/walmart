import { useEffect, useRef } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';

export function useHeartbeat(roomId: string | null) {
  const { user } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!roomId || !user) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Update heartbeat every 10 seconds
    const updateHeartbeat = async () => {
      try {
        await updateDoc(doc(db, 'rooms', roomId, 'players', user.uid), {
          lastSeen: serverTimestamp(),
          isConnected: true
        });
      } catch (error) {
        console.error('Error updating heartbeat:', error);
      }
    };

    // Initial heartbeat
    updateHeartbeat();

    // Set up interval
    intervalRef.current = setInterval(updateHeartbeat, 10000);

    // Cleanup on unmount or page unload
    const handleBeforeUnload = async () => {
      try {
        await updateDoc(doc(db, 'rooms', roomId, 'players', user.uid), {
          isConnected: false
        });
      } catch (error) {
        console.error('Error setting offline status:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Set offline status on cleanup
      updateDoc(doc(db, 'rooms', roomId, 'players', user.uid), {
        isConnected: false
      }).catch(console.error);
    };
  }, [roomId, user]);

  return null;
}
