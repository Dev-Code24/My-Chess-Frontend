# MyChess - Frontend

A real-time multiplayer chess platform built with Angular 19, featuring WebSocket-based live synchronization, reactive state management, and comprehensive chess rule implementation.

![Angular](https://img.shields.io/badge/Angular-19.2.0-red?logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.11-38B2AC?logo=tailwind-css)
![RxJS](https://img.shields.io/badge/RxJS-7.8.0-B7178C?logo=reactivex)

## ✨ Key Features

- **Real-time Multiplayer**: WebSocket-based bidirectional communication for instant move synchronization
- **Complete Chess Implementation**: Full rule validation including castling, en passant, pawn promotion, and checkmate detection
- **Secure Authentication**: JWT-based auth with HTTP-only cookies
- **Interactive UI**: Drag-and-drop and click-to-move with touch support
- **FEN Notation**: Board state persistence using Forsyth-Edwards Notation
- **Room-based Games**: Create/join games with unique 6-character codes
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🛠️ Tech Stack

- **Framework**: Angular 19.2.0 (standalone components)
- **Language**: TypeScript 5.7.2
- **State Management**: RxJS 7.8.0 (BehaviorSubjects)
- **Styling**: Tailwind CSS 4.1.11 + PostCSS
- **Real-time**: WebSocket API
- **Icons**: FontAwesome 6.7.2

## 🏗️ Architecture & System Design

### Design Patterns

- **[Observer Pattern](https://refactoring.guru/design-patterns/observer)**: RxJS Observables and BehaviorSubjects for reactive state management (`StateManagerService` with `user$` and `myTurn$` observables)
- **[Strategy Pattern](https://refactoring.guru/design-patterns/strategy)**: Move validation algorithms for different chess pieces (pawn, rook, knight, bishop, queen, king)
- **[Facade Pattern](https://refactoring.guru/design-patterns/facade)**: `CommonConnectBackendService` provides simplified HTTP interface with retry logic and error handling
- **[Guard Pattern](https://en.wikipedia.org/wiki/Guard_(computer_science))**: Route guards (`authGuard`, `loginGuard`) protect routes based on authentication state
- **Singleton Pattern**: Core services injected at root level for application-wide state

### System Design Highlights

**1. Real-time Communication**
```
Client → WebSocket Connection → Backend
   ↓
Opponent moves piece → Backend broadcasts → Client receives update
   ↓
Board state updated via FEN notation
```

**2. State Synchronization**
- WebSocket ensures both players see identical board state
- Reconnection logic with exponential backoff (1s → 2s → 4s → 8s)
- Toast notifications for connection status

**3. Chess Logic Architecture**
```
ChessboardComponent
├── FEN Parsing (fen-utils.ts)
├── Move Validation (move-utils.ts)
│   ├── Path clearance checking
│   ├── Attack square detection
│   └── Special moves (castling, en passant)
└── Captured Pieces Tracking
```

**4. Performance Optimizations**
- OnPush change detection strategy
- Subscription cleanup with SubSink utility
- Lazy loading of routes
- AOT compilation in production

## 🚀 Quick Start

### Prerequisites
```bash
Node.js 18+, npm 9+, Angular CLI 19
npm install -g @angular/cli@19
```

### Installation
```bash
# Clone and install
git clone https://github.com/Dev-Code24/My-Chess-Frontend
cd My-Chess-Frontend
npm install

# Configure environment
# Update src/environments/environment.development.ts
export const environment = {
  environment: 'dev',
  baseApiUrl: 'http://localhost:8080'
};

# Run dev server
ng serve
# Open http://localhost:4200
```

## 📡 WebSocket Integration

**Connection Flow**:
```typescript
1. Navigate to /play/:roomId
2. Establish WebSocket: ws://localhost:8080/room/ws/{roomCode}
3. Authenticate via JWT cookie
4. Receive real-time updates:
   - Opponent moves: { type: 'MOVE', move: {...}, fen: '...' }
   - Game end: { type: 'GAME_END', winner: 'white'|'black' }
```

**Reconnection Strategy**:
- Exponential backoff on connection loss
- Visual feedback via toast notifications
- Auto-cleanup on component destroy

## ♟️ Chess Logic Highlights

**Move Validation** (`move-utils.ts`):
- Validates all piece movements (pawn, rook, knight, bishop, queen, king)
- Special moves: castling (kingside/queenside), en passant, pawn promotion
- Check detection via `isSquareAttacked()` algorithm
- Path clearance for sliding pieces

**FEN Notation** (`fen-utils.ts`):
- Converts FEN string to 8x8 board array
- Supports board flipping for black player
- Example: `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`

**Captured Pieces**:
- Format: `b{pieces}/w{pieces}` (e.g., `bPNB/wRQ`)
- Real-time UI display by color

## 📚 Key Files

| File | Purpose |
|------|---------|
| `modules/play/components/chessboard/` | Interactive chess board UI |
| `modules/play/@utils/move-utils.ts` | Chess move validation engine |
| `modules/play/@utils/fen-utils.ts` | FEN notation parser |
| `modules/shared/services/state-manager.service.ts` | Global state management |
| `@core/http-interceptors/auth-interceptor.interceptor.ts` | JWT error handling |

## 🐛 Troubleshooting

**CORS Errors**: Ensure backend allows `http://localhost:4200` with credentials
**WebSocket Fails**: Verify backend running, check JWT cookie, confirm room code
**Auth Issues**: Clear cookies, check token expiration

---

**Built with Angular 19 • TypeScript • RxJS • Tailwind CSS**
