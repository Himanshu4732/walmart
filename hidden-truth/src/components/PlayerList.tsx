'use client';

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { Player } from '@/hooks/usePlayers';

interface PlayerListProps {
  roomId: string;
  players: Player[];
  currentPlayer: Player | undefined;
  isHost: boolean;
}

export function PlayerList({ roomId, players, currentPlayer }: PlayerListProps) {
  const [updating, setUpdating] = useState<string | null>(null);

  const toggleReady = async (player: Player) => {
    if (!currentPlayer || player.uid !== currentPlayer.uid) return;
    
    setUpdating(player.uid);
    try {
      await updateDoc(doc(db, 'rooms', roomId, 'players', player.uid), {
        isReady: !player.isReady
      });
    } catch (error) {
      console.error('Error updating ready status:', error);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: 6 }, (_, index) => {
        const player = players[index];
        const isEmpty = !player;
        
        return (
          <Card key={index} className={`${isEmpty ? 'border-dashed border-gray-300' : ''}`}>
            <CardContent className="p-4">
              {isEmpty ? (
                <div className="text-center text-gray-400 py-8">
                  <div className="w-12 h-12 rounded-full bg-gray-100 mx-auto mb-2"></div>
                  <p className="text-sm">Empty Slot</p>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {player.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{player.displayName}</p>
                      <div className="flex items-center gap-2">
                        {player.isConnected ? (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        ) : (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                        <span className="text-xs text-gray-500">
                          {player.isConnected ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {player.isReady ? (
                      <Badge variant="default" className="bg-green-500">
                        <Check className="w-3 h-3 mr-1" />
                        Ready
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <X className="w-3 h-3 mr-1" />
                        Not Ready
                      </Badge>
                    )}
                    
                    {currentPlayer && player.uid === currentPlayer.uid && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleReady(player)}
                        disabled={updating === player.uid}
                      >
                        {updating === player.uid ? '...' : player.isReady ? 'Unready' : 'Ready'}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
