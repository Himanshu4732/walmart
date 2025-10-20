'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { createNewRoom, joinRoomByCode } from '@/lib/gameFunctions';
import { Loader2, Users, Gamepad2 } from 'lucide-react';

export default function Home() {
  const { user, loading: authLoading, signIn } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      signIn();
    }
  }, [authLoading, user, signIn]);

  const handleCreateRoom = async () => {
    if (!user) return;
    
    setIsCreating(true);
    setError('');
    
    try {
      const result = await createNewRoom();
      router.push(`/room/${result.roomId}`);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to create room');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!user || !joinCode.trim() || !displayName.trim()) {
      setError('Please enter both room code and display name');
      return;
    }
    
    setIsJoining(true);
    setError('');
    
    try {
      const result = await joinRoomByCode(joinCode.trim(), displayName.trim());
      router.push(`/room/${result.roomId}`);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to join room');
    } finally {
      setIsJoining(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Hidden Truth
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            A social deduction game where one impostor tries to blend in with the truth-tellers
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-6">
          {/* Create Room Card */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Gamepad2 className="h-5 w-5" />
                Create Room
              </CardTitle>
              <CardDescription>
                Start a new game and invite friends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleCreateRoom} 
                disabled={isCreating || !user}
                className="w-full"
                size="lg"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create New Room'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Join Room Card */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Users className="h-5 w-5" />
                Join Room
              </CardTitle>
              <CardDescription>
                Enter a room code to join an existing game
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Room Code (6 digits)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                maxLength={6}
                className="text-center text-lg font-mono"
              />
              <Input
                placeholder="Your Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={20}
              />
              <Button 
                onClick={handleJoinRoom} 
                disabled={isJoining || !user || !joinCode.trim() || !displayName.trim()}
                className="w-full"
                size="lg"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Join Room'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <CardContent className="pt-6">
                <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Game Rules */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-lg">How to Play</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <p>• 2-6 players can join a room</p>
              <p>• One player is secretly the impostor</p>
              <p>• Everyone else knows the secret word</p>
              <p>• Give clues, ask questions, complete tasks</p>
              <p>• Vote to eliminate the impostor</p>
              <p>• If impostor survives, they get one guess at the word</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
