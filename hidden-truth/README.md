# Hidden Truth - Social Deduction Game

A browser-based social deduction game where up to 6 friends join the same room. Everyone gets the same secret word, except 1 impostor who gets a fake/blank word. Players give clues, ask questions, complete tasks, then vote. If the impostor survives, they get one guess at the real word to steal the win.

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Firebase (Auth, Firestore, Cloud Functions, Hosting)
- **Real-time**: Firestore real-time listeners
- **Authentication**: Firebase Anonymous Auth

## Features

- 🎮 **6-Player Lobby**: Create rooms with 6-digit codes
- 🔗 **Easy Joining**: Share room codes, links, or QR codes
- 👥 **Real-time Presence**: See who's online/offline
- 🎯 **Game Phases**: Clue → Question → Task → Discussion → Vote → Reveal
- 🕵️ **Role Assignment**: 1 impostor, rest are truth-tellers
- 🗳️ **Voting System**: Eliminate suspected impostors
- 🏆 **Win Conditions**: Truth holders eliminate impostor OR impostor guesses the word
- 📱 **Responsive Design**: Works on desktop and mobile

## Quick Start

### Prerequisites

- Node.js 20+
- Firebase CLI
- A Firebase project

### 1. Clone and Install

```bash
git clone <repository-url>
cd hidden-truth
npm install
```

### 2. Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Anonymous), Firestore, and Cloud Functions
3. Get your Firebase config and create `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Deploy Firebase Functions

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

### 4. Run Development Server

```bash
# Start Firebase emulators + Next.js dev server
npm run dev:emulators

# Or run them separately:
# Terminal 1: firebase emulators:start
# Terminal 2: npm run dev
```

### 5. Open the Game

Visit [http://localhost:3000](http://localhost:3000)

## Game Rules

### Setup
1. Host creates a room and gets a 6-digit code
2. Friends join using the code or QR code
3. Everyone toggles "Ready" when ready to play
4. Host starts the game when 2-6 players are ready

### Gameplay
1. **Clue Phase (20s)**: Everyone gives a one-word clue about their word
2. **Question Phase (60s)**: Take turns asking questions about clues
3. **Task Phase (15s)**: Complete a mini-task (impostor gets slightly harder task)
4. **Discussion Phase (60s)**: Discuss and try to identify the impostor
5. **Vote Phase (20s)**: Vote to eliminate a suspected impostor
6. **Reveal Phase**: 
   - If impostor eliminated → Truth holders win
   - If impostor survives → They get one guess at the secret word
   - If impostor guesses correctly → Impostor wins
   - If impostor guesses wrong → Truth holders win

### Roles
- **Truth Holders**: Know the secret word, try to identify the impostor
- **Impostor**: Doesn't know the word, tries to blend in and survive voting

## Project Structure

```
hidden-truth/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── page.tsx        # Home page
│   │   ├── join/           # Join room page
│   │   └── room/[roomId]/  # Game room page
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── PlayerList.tsx
│   │   ├── PhaseBanner.tsx
│   │   └── [Phase]Phase.tsx
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useRoom.ts
│   │   ├── usePlayers.ts
│   │   ├── useGameState.ts
│   │   └── useHeartbeat.ts
│   └── lib/               # Utilities
│       ├── firebase.ts
│       └── gameFunctions.ts
├── functions/             # Firebase Cloud Functions
│   ├── src/
│   │   └── index.ts
│   └── package.json
├── firebase.json          # Firebase configuration
├── firestore.rules        # Firestore security rules
└── firestore.indexes.json # Firestore indexes
```

## Deployment

### Deploy to Firebase Hosting

```bash
npm run build
firebase deploy --only hosting,functions,firestore:rules
```

### Environment Variables

Make sure to set these in your Firebase project:
- `FUNCTIONS_EMULATOR` (automatically set by Firebase)

## Testing

1. Open multiple browser tabs/windows
2. Create a room in one tab
3. Join the same room in other tabs using the room code
4. Test the complete game flow

## Security

- All game logic runs server-side in Cloud Functions
- Clients cannot modify roles, game state, or secret words
- Firestore security rules enforce proper access controls
- Anonymous authentication required for all operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
