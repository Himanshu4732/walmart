import { onCall } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();
const auth = getAuth();

// Word lists for the game
const WORDS = [
  { real: 'Volcano', decoy: 'Mountain' },
  { real: 'Ocean', decoy: 'Lake' },
  { real: 'Dragon', decoy: 'Lizard' },
  { real: 'Castle', decoy: 'House' },
  { real: 'Diamond', decoy: 'Crystal' },
  { real: 'Thunder', decoy: 'Lightning' },
  { real: 'Phoenix', decoy: 'Eagle' },
  { real: 'Tornado', decoy: 'Wind' },
  { real: 'Avalanche', decoy: 'Snow' },
  { real: 'Tsunami', decoy: 'Wave' }
];

// Helper function to generate 6-digit room code
function generateRoomCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper function to get server timestamp
function getServerTimestamp() {
  return FieldValue.serverTimestamp();
}

// Create a new room
export const createRoom = onCall(async (request) => {
  const { auth } = request;
  if (!auth) {
    throw new Error('Authentication required');
  }

  const roomCode = generateRoomCode();
  const roomId = db.collection('rooms').doc().id;
  const now = getServerTimestamp();

  // Create room document
  await db.collection('rooms').doc(roomId).set({
    code: roomCode,
    hostUid: auth.uid,
    status: 'lobby',
    maxPlayers: 6,
    playerCount: 1,
    createdAt: now,
    updatedAt: now
  });

  // Create host player document
  await db.collection('rooms').doc(roomId).collection('players').doc(auth.uid).set({
    uid: auth.uid,
    displayName: 'Host',
    photoURL: null,
    isReady: false,
    isConnected: true,
    lastSeen: now,
    joinedAt: now,
    role: null
  });

  return {
    roomId,
    code: roomCode,
    joinUrl: `${process.env.FUNCTIONS_EMULATOR ? 'http://localhost:3000' : 'https://your-domain.com'}/join?code=${roomCode}`
  };
});

// Join a room
export const joinRoom = onCall(async (request) => {
  const { auth } = request;
  const { code, displayName } = request.data;
  
  if (!auth) {
    throw new Error('Authentication required');
  }

  if (!code || !displayName) {
    throw new Error('Room code and display name are required');
  }

  // Find room by code
  const roomsSnapshot = await db.collection('rooms')
    .where('code', '==', code)
    .where('status', '==', 'lobby')
    .limit(1)
    .get();

  if (roomsSnapshot.empty) {
    throw new Error('Room not found or game already started');
  }

  const roomDoc = roomsSnapshot.docs[0];
  const roomId = roomDoc.id;
  const roomData = roomDoc.data();

  // Check if room is full
  if (roomData.playerCount >= roomData.maxPlayers) {
    throw new Error('Room is full');
  }

  const now = getServerTimestamp();

  // Check if player already exists
  const existingPlayer = await db.collection('rooms').doc(roomId)
    .collection('players').doc(auth.uid).get();

  if (existingPlayer.exists) {
    // Update existing player
    await db.collection('rooms').doc(roomId)
      .collection('players').doc(auth.uid).update({
        isConnected: true,
        lastSeen: now,
        displayName
      });
  } else {
    // Create new player and increment count
    await db.runTransaction(async (transaction) => {
      const roomRef = db.collection('rooms').doc(roomId);
      const playerRef = db.collection('rooms').doc(roomId)
        .collection('players').doc(auth.uid);

      transaction.set(playerRef, {
        uid: auth.uid,
        displayName,
        photoURL: null,
        isReady: false,
        isConnected: true,
        lastSeen: now,
        joinedAt: now,
        role: null
      });

      transaction.update(roomRef, {
        playerCount: FieldValue.increment(1),
        updatedAt: now
      });
    });
  }

  return { roomId };
});

// Start the game
export const startGame = onCall(async (request) => {
  const { auth } = request;
  const { roomId } = request.data;

  if (!auth) {
    throw new Error('Authentication required');
  }

  const roomRef = db.collection('rooms').doc(roomId);
  const roomDoc = await roomRef.get();

  if (!roomDoc.exists) {
    throw new Error('Room not found');
  }

  const roomData = roomDoc.data()!;

  // Check if user is host
  if (roomData.hostUid !== auth.uid) {
    throw new Error('Only the host can start the game');
  }

  // Check player count and readiness
  if (roomData.playerCount < 2 || roomData.playerCount > 6) {
    throw new Error('Need 2-6 players to start');
  }

  // Get all players and check if all are ready
  const playersSnapshot = await db.collection('rooms').doc(roomId)
    .collection('players').get();

  const players = playersSnapshot.docs.map(doc => doc.data());
  const allReady = players.every(player => player.isReady);

  if (!allReady) {
    throw new Error('All players must be ready to start');
  }

  // Pick random word pair
  const wordPair = WORDS[Math.floor(Math.random() * WORDS.length)];
  
  // Randomly assign roles (1 impostor, rest truth)
  const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
  const roles = shuffledPlayers.map((player, index) => 
    index === 0 ? 'impostor' : 'truth'
  );

  const now = getServerTimestamp();
  const clueEndTime = new Date(Date.now() + 20 * 1000); // 20 seconds

  // Update room status and create game state
  await db.runTransaction(async (transaction) => {
    // Update room
    transaction.update(roomRef, {
      status: 'inRound',
      startedAt: now,
      updatedAt: now
    });

    // Create game state
    transaction.set(db.collection('rooms').doc(roomId).collection('state').doc('current'), {
      phase: 'clue',
      phaseEndsAt: clueEndTime,
      askTurnUid: null,
      taskSeed: Math.random().toString(36).substring(7)
    });

    // Store secrets (admin only)
    transaction.set(db.collection('rooms').doc(roomId).collection('secrets').doc('current'), {
      realWord: wordPair.real,
      decoyWord: wordPair.decoy,
      createdAt: now
    });

    // Assign roles to players
    shuffledPlayers.forEach((player, index) => {
      transaction.update(
        db.collection('rooms').doc(roomId).collection('players').doc(player.uid),
        { role: roles[index] }
      );
    });
  });

  return { success: true };
});

// Advance to next phase
export const advancePhase = onCall(async (request) => {
  const { auth } = request;
  const { roomId } = request.data;

  if (!auth) {
    throw new Error('Authentication required');
  }

  const stateRef = db.collection('rooms').doc(roomId).collection('state').doc('current');
  const stateDoc = await stateRef.get();

  if (!stateDoc.exists) {
    throw new Error('Game state not found');
  }

  const currentState = stateDoc.data()!;
  const now = new Date();
  const nextPhase = getNextPhase(currentState.phase);

  let phaseEndsAt: Date;
  let updates: any = { phase: nextPhase };

  switch (nextPhase) {
    case 'question':
      phaseEndsAt = new Date(now.getTime() + 60 * 1000); // 60 seconds
      updates.askTurnUid = await getFirstPlayer(roomId);
      break;
    case 'task':
      phaseEndsAt = new Date(now.getTime() + 15 * 1000); // 15 seconds
      updates.taskSeed = Math.random().toString(36).substring(7);
      break;
    case 'discussion':
      phaseEndsAt = new Date(now.getTime() + 60 * 1000); // 60 seconds
      break;
    case 'vote':
      phaseEndsAt = new Date(now.getTime() + 20 * 1000); // 20 seconds
      break;
    case 'reveal':
      phaseEndsAt = new Date(now.getTime() + 30 * 1000); // 30 seconds
      await tallyVotes(roomId);
      break;
    default:
      throw new Error('Invalid phase transition');
  }

  updates.phaseEndsAt = phaseEndsAt;

  await stateRef.update(updates);
  return { success: true, nextPhase };
});

// Submit a clue
export const submitClue = onCall(async (request) => {
  const { auth } = request;
  const { roomId, clue } = request.data;

  if (!auth) {
    throw new Error('Authentication required');
  }

  if (!clue || clue.trim().length === 0) {
    throw new Error('Clue is required');
  }

  const now = getServerTimestamp();
  await db.collection('rooms').doc(roomId).collection('clues').doc(auth.uid).set({
    clue: clue.trim(),
    submittedAt: now
  });

  return { success: true };
});

// Submit a vote
export const submitVote = onCall(async (request) => {
  const { auth } = request;
  const { roomId, targetUid } = request.data;

  if (!auth) {
    throw new Error('Authentication required');
  }

  if (!targetUid) {
    throw new Error('Target player is required');
  }

  if (targetUid === auth.uid) {
    throw new Error('Cannot vote for yourself');
  }

  const now = getServerTimestamp();
  await db.collection('rooms').doc(roomId).collection('votes').doc(auth.uid).set({
    targetUid,
    submittedAt: now
  });

  return { success: true };
});

// Impostor guess
export const impostorGuess = onCall(async (request) => {
  const { auth } = request;
  const { roomId, guess } = request.data;

  if (!auth) {
    throw new Error('Authentication required');
  }

  if (!guess) {
    throw new Error('Guess is required');
  }

  // Get player role
  const playerDoc = await db.collection('rooms').doc(roomId)
    .collection('players').doc(auth.uid).get();

  if (!playerDoc.exists || playerDoc.data()?.role !== 'impostor') {
    throw new Error('Only the impostor can make a guess');
  }

  // Get the real word
  const secretsDoc = await db.collection('rooms').doc(roomId)
    .collection('secrets').doc('current').get();

  if (!secretsDoc.exists) {
    throw new Error('Game secrets not found');
  }

  const realWord = secretsDoc.data()?.realWord;
  const normalizedGuess = guess.trim().toLowerCase();
  const normalizedReal = realWord.toLowerCase();

  const isCorrect = normalizedGuess === normalizedReal;

  // Update game state with result
  await db.collection('rooms').doc(roomId).collection('state').doc('current').update({
    phase: 'reveal',
    gameResult: isCorrect ? 'impostor' : 'truth',
    impostorGuess: guess,
    realWord: realWord
  });

  return { 
    success: true, 
    isCorrect,
    realWord: isCorrect ? realWord : undefined
  };
});

// Helper function to get next phase
function getNextPhase(currentPhase: string): string {
  const phases = ['clue', 'question', 'task', 'discussion', 'vote', 'reveal'];
  const currentIndex = phases.indexOf(currentPhase);
  return phases[currentIndex + 1] || 'reveal';
}

// Helper function to get first player for question phase
async function getFirstPlayer(roomId: string): Promise<string> {
  const playersSnapshot = await db.collection('rooms').doc(roomId)
    .collection('players').orderBy('joinedAt').limit(1).get();
  
  return playersSnapshot.docs[0]?.data().uid || '';
}

// Helper function to tally votes
async function tallyVotes(roomId: string): Promise<void> {
  const votesSnapshot = await db.collection('rooms').doc(roomId)
    .collection('votes').get();

  const voteCounts: { [uid: string]: number } = {};
  votesSnapshot.docs.forEach(doc => {
    const targetUid = doc.data().targetUid;
    voteCounts[targetUid] = (voteCounts[targetUid] || 0) + 1;
  });

  // Find player with most votes
  let maxVotes = 0;
  let eliminatedUid = '';
  for (const [uid, count] of Object.entries(voteCounts)) {
    if (count > maxVotes) {
      maxVotes = count;
      eliminatedUid = uid;
    }
  }

  // Get eliminated player's role
  const eliminatedPlayer = await db.collection('rooms').doc(roomId)
    .collection('players').doc(eliminatedUid).get();
  
  const eliminatedRole = eliminatedPlayer.data()?.role;

  // Update game state
  await db.collection('rooms').doc(roomId).collection('state').doc('current').update({
    eliminatedUid,
    eliminatedRole,
    voteCounts
  });
}

// Clean up stale players (scheduled function)
export const cleanStalePlayers = onSchedule('every 1 minutes', async (event) => {
  const now = new Date();
  const staleThreshold = 25 * 1000; // 25 seconds
  const removeThreshold = 2 * 60 * 1000; // 2 minutes

  // Get all lobby rooms
  const lobbyRooms = await db.collection('rooms')
    .where('status', '==', 'lobby')
    .get();

  for (const roomDoc of lobbyRooms.docs) {
    const roomId = roomDoc.id;
    const playersSnapshot = await db.collection('rooms').doc(roomId)
      .collection('players').get();

    for (const playerDoc of playersSnapshot.docs) {
      const playerData = playerDoc.data();
      const lastSeen = playerData.lastSeen?.toDate();
      
      if (!lastSeen) continue;

      const timeSinceLastSeen = now.getTime() - lastSeen.getTime();

      if (timeSinceLastSeen > removeThreshold) {
        // Remove player completely
        await db.runTransaction(async (transaction) => {
          const roomRef = db.collection('rooms').doc(roomId);
          const playerRef = db.collection('rooms').doc(roomId)
            .collection('players').doc(playerDoc.id);

          transaction.delete(playerRef);
          transaction.update(roomRef, {
            playerCount: FieldValue.increment(-1),
            updatedAt: getServerTimestamp()
          });

          // If removed player was host, transfer to next player
          if (playerData.uid === roomDoc.data().hostUid) {
            const remainingPlayers = playersSnapshot.docs
              .filter(doc => doc.id !== playerDoc.id)
              .sort((a, b) => a.data().joinedAt.seconds - b.data().joinedAt.seconds);
            
            if (remainingPlayers.length > 0) {
              transaction.update(roomRef, {
                hostUid: remainingPlayers[0].data().uid
              });
            }
          }
        });
      } else if (timeSinceLastSeen > staleThreshold) {
        // Mark as offline
        await db.collection('rooms').doc(roomId)
          .collection('players').doc(playerDoc.id).update({
            isConnected: false
          });
      }
    }
  }
});
