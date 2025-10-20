'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { joinRoomByCode } from '@/lib/gameFunctions';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function JoinPageContent() {
  const { user, loading: authLoading, signIn } = useAuth();
  const [isJoining, setIsJoining] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!authLoading && !user) {
      signIn();
    }
  }, [authLoading, user, signIn]);

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setJoinCode(code);
    }
  }, [searchParams]);

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
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Join Room</CardTitle>
              <CardDescription>
                Enter the room code and your name to join the game
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Room Code
                </label>
                <Input
                  placeholder="Enter 6-digit code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-lg font-mono mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Your Name
                </label>
                <Input
                  placeholder="Enter your display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={20}
                  className="mt-1"
                />
              </div>

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

              {error && (
                <div className="text-red-600 dark:text-red-400 text-sm text-center">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div>Loading...</div></div>}>
      <JoinPageContent />
    </Suspense>
  );
}
