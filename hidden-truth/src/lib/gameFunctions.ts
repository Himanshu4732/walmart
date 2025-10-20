import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

// Cloud Functions
export const createRoom = httpsCallable(functions, 'createRoom');
export const joinRoom = httpsCallable(functions, 'joinRoom');
export const startGame = httpsCallable(functions, 'startGame');
export const advancePhase = httpsCallable(functions, 'advancePhase');
export const submitClue = httpsCallable(functions, 'submitClue');
export const submitVote = httpsCallable(functions, 'submitVote');
export const impostorGuess = httpsCallable(functions, 'impostorGuess');

// Helper functions
export async function createNewRoom() {
  try {
    const result = await createRoom();
    return result.data as { roomId: string; code: string; joinUrl: string };
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
}

export async function joinRoomByCode(code: string, displayName: string) {
  try {
    const result = await joinRoom({ code, displayName });
    return result.data as { roomId: string };
  } catch (error) {
    console.error('Error joining room:', error);
    throw error;
  }
}

export async function startGameInRoom(roomId: string) {
  try {
    const result = await startGame({ roomId });
    return result.data as { success: boolean };
  } catch (error) {
    console.error('Error starting game:', error);
    throw error;
  }
}

export async function advanceGamePhase(roomId: string) {
  try {
    const result = await advancePhase({ roomId });
    return result.data as { success: boolean; nextPhase: string };
  } catch (error) {
    console.error('Error advancing phase:', error);
    throw error;
  }
}

export async function submitPlayerClue(roomId: string, clue: string) {
  try {
    const result = await submitClue({ roomId, clue });
    return result.data as { success: boolean };
  } catch (error) {
    console.error('Error submitting clue:', error);
    throw error;
  }
}

export async function submitPlayerVote(roomId: string, targetUid: string) {
  try {
    const result = await submitVote({ roomId, targetUid });
    return result.data as { success: boolean };
  } catch (error) {
    console.error('Error submitting vote:', error);
    throw error;
  }
}

export async function submitImpostorGuess(roomId: string, guess: string) {
  try {
    const result = await impostorGuess({ roomId, guess });
    return result.data as { success: boolean; isCorrect: boolean; realWord?: string };
  } catch (error) {
    console.error('Error submitting impostor guess:', error);
    throw error;
  }
}
