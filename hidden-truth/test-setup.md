# Hidden Truth - Test Setup Guide

## Quick Test (Development)

1. **Start the development server:**
   ```bash
   npm run dev:emulators
   ```
   This will start both Firebase emulators and Next.js dev server.

2. **Open the game:**
   - Visit http://localhost:3000
   - You should see the home page with "Create Room" and "Join Room" options

3. **Test the game flow:**
   - Open multiple browser tabs/windows
   - Create a room in one tab (you'll get a 6-digit code)
   - Join the same room in other tabs using the code
   - Test the complete game flow: lobby → start → clue → question → task → discussion → vote → reveal

## Production Deployment

1. **Set up Firebase project:**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Anonymous), Firestore, and Cloud Functions
   - Get your Firebase config

2. **Create environment file:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Firebase config
   ```

3. **Deploy:**
   ```bash
   # Deploy functions first
   cd functions
   npm install
   cd ..
   firebase deploy --only functions

   # Build and deploy hosting
   npm run build
   firebase deploy --only hosting,firestore:rules
   ```

## Features Implemented

✅ **Complete Game Engine:**
- 6-player lobby with room codes
- Real-time presence tracking
- Role assignment (1 impostor, rest truth-tellers)
- 5 game phases: Clue → Question → Task → Discussion → Vote → Reveal
- Voting system with elimination
- Impostor guess mechanic
- Win conditions for both teams

✅ **Technical Implementation:**
- Next.js 15 with TypeScript
- Firebase Auth, Firestore, Cloud Functions
- Real-time data synchronization
- Responsive UI with Tailwind CSS
- Security rules preventing cheating
- Heartbeat system for presence
- QR code generation for easy joining

✅ **Security:**
- All game logic runs server-side
- Clients cannot modify roles or game state
- Proper authentication required
- Firestore security rules enforced

## Game Rules

1. **Setup:** Host creates room, friends join with code
2. **Roles:** 1 impostor (doesn't know word), rest are truth-tellers (know word)
3. **Phases:**
   - **Clue (20s):** Everyone gives one-word clue
   - **Question (60s):** Take turns asking questions
   - **Task (15s):** Complete mini-task
   - **Discussion (60s):** Discuss and identify impostor
   - **Vote (20s):** Vote to eliminate suspect
   - **Reveal:** Show results, impostor gets one guess if they survive

4. **Win Conditions:**
   - Truth holders win if impostor is eliminated
   - Impostor wins if they guess the secret word correctly
   - Truth holders win if impostor guesses wrong

The game is now ready to play! 🎮
