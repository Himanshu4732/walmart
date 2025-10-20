'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useRoom } from '@/hooks/useRoom';
import { usePlayers } from '@/hooks/usePlayers';
import { useGameState } from '@/hooks/useGameState';
import { useHeartbeat } from '@/hooks/useHeartbeat';
import { startGameInRoom } from '@/lib/gameFunctions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Users, Play, Copy, QrCode, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import QRCode from 'qrcode';
import { PlayerList } from '@/components/PlayerList';
import { PhaseBanner } from '@/components/PhaseBanner';
import { CluePhase } from '@/components/CluePhase';
import { QuestionPhase } from '@/components/QuestionPhase';
import { TaskPhase } from '@/components/TaskPhase';
import { DiscussionPhase } from '@/components/DiscussionPhase';
import { VotePhase } from '@/components/VotePhase';
import { RevealPhase } from '@/components/RevealPhase';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const roomId = params.roomId as string;
  
  const { room, loading: roomLoading, error: roomError } = useRoom(roomId);
  const { players, loading: playersLoading } = usePlayers(roomId);
  const { gameState, loading: gameStateLoading } = useGameState(roomId);
  
  useHeartbeat(roomId);
  
  const [isStarting, setIsStarting] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showQR, setShowQR] = useState(false);

  const isHost = Boolean(user && room && user.uid === room.hostUid);
  const currentPlayer = players.find(p => p.uid === user?.uid);
  const allPlayersReady = players.length >= 2 && players.every(p => p.isReady);

  useEffect(() => {
    if (roomError) {
      router.push('/');
    }
  }, [roomError, router]);

  useEffect(() => {
    if (room) {
      const joinUrl = `${window.location.origin}/join?code=${room.code}`;
      QRCode.toDataURL(joinUrl).then(setQrCodeUrl);
    }
  }, [room]);

  const handleStartGame = async () => {
    if (!isHost || !room) return;
    
    setIsStarting(true);
    try {
      await startGameInRoom(roomId);
    } catch (error) {
      console.error('Error starting game:', error);
    } finally {
      setIsStarting(false);
    }
  };


  const copyRoomCode = () => {
    if (room) {
      navigator.clipboard.writeText(room.code);
    }
  };

  const copyJoinLink = () => {
    if (room) {
      const joinUrl = `${window.location.origin}/join?code=${room.code}`;
      navigator.clipboard.writeText(joinUrl);
    }
  };

  if (roomLoading || playersLoading || gameStateLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600">Room not found</p>
            <Link href="/">
              <Button className="mt-4">Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Room {room.code}</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {room.playerCount}/{room.maxPlayers} players
              </p>
            </div>
          </div>
          
          {isHost && room.status === 'lobby' && (
            <div className="flex gap-2">
              <Button onClick={copyRoomCode} variant="outline" size="sm">
                <Copy className="mr-2 h-4 w-4" />
                Copy Code
              </Button>
              <Button onClick={copyJoinLink} variant="outline" size="sm">
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
              <Button onClick={() => setShowQR(!showQR)} variant="outline" size="sm">
                <QrCode className="mr-2 h-4 w-4" />
                QR Code
              </Button>
            </div>
          )}
        </div>

        {/* QR Code Modal */}
        {showQR && qrCodeUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-96">
              <CardHeader>
                <CardTitle className="text-center">Scan to Join</CardTitle>
                <CardDescription className="text-center">
                  Share this QR code with friends
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Image src={qrCodeUrl} alt="QR Code" width={200} height={200} className="mx-auto mb-4" />
                <Button onClick={() => setShowQR(false)} variant="outline">
                  Close
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {room.status === 'lobby' ? (
              <>
                {/* Lobby Phase */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Waiting for Players
                    </CardTitle>
                    <CardDescription>
                      Invite friends to join your room
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PlayerList 
                      roomId={roomId}
                      players={players} 
                      currentPlayer={currentPlayer}
                      isHost={isHost}
                    />
                    
                    {isHost && (
                      <div className="mt-6 text-center">
                        <Button 
                          onClick={handleStartGame}
                          disabled={!allPlayersReady || isStarting}
                          size="lg"
                          className="w-full"
                        >
                          {isStarting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Starting...
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Start Game
                            </>
                          )}
                        </Button>
                        {!allPlayersReady && (
                          <p className="text-sm text-gray-500 mt-2">
                            Need at least 2 players and all must be ready
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                {/* Game Phase */}
                <PhaseBanner gameState={gameState} />
                
                {gameState?.phase === 'clue' && (
                  <CluePhase roomId={roomId} currentPlayer={currentPlayer} />
                )}
                
                {gameState?.phase === 'question' && (
                  <QuestionPhase roomId={roomId} gameState={gameState} players={players} currentPlayer={currentPlayer} />
                )}
                
                {gameState?.phase === 'task' && (
                  <TaskPhase roomId={roomId} gameState={gameState} currentPlayer={currentPlayer} />
                )}
                
                {gameState?.phase === 'discussion' && (
                  <DiscussionPhase roomId={roomId} players={players} currentPlayer={currentPlayer} />
                )}
                
                {gameState?.phase === 'vote' && (
                  <VotePhase roomId={roomId} players={players} currentPlayer={currentPlayer} />
                )}
                
                {gameState?.phase === 'reveal' && (
                  <RevealPhase roomId={roomId} gameState={gameState} players={players} currentPlayer={currentPlayer} />
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Room Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Room Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                  <Badge variant={room.status === 'lobby' ? 'secondary' : 'default'}>
                    {room.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Players:</span>
                  <span className="text-sm font-medium">{room.playerCount}/{room.maxPlayers}</span>
                </div>
              </CardContent>
            </Card>

            {/* Players List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Players</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {players.map((player) => (
                    <div key={player.uid} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {player.displayName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{player.displayName}</span>
                        {player.uid === room.hostUid && (
                          <Badge variant="outline" className="text-xs">Host</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {player.isConnected && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                        {player.isReady && (
                          <Badge variant="secondary" className="text-xs">Ready</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
