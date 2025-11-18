# MyChess - Frontend

A real-time multiplayer chess platform built with Angular 19, featuring WebSocket-based live synchronization, reactive state management, and comprehensive chess rule implementation.

![Angular](https://img.shields.io/badge/Angular-19.2.0-red?logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.11-38B2AC?logo=tailwind-css)
![RxJS](https://img.shields.io/badge/RxJS-7.8.0-B7178C?logo=reactivex)

<img width="1680" height="1050" alt="Screenshot 2025-11-18 at 6 30 27 PM" src="https://github.com/user-attachments/assets/b7d2ea60-4811-497f-9e40-0ded6a077dcb" />

## ✨ Key Features

- **Real-time Multiplayer**: WebSocket-based bidirectional communication with automatic reconnection and message queuing
- **Complete Chess Implementation**: Full rule validation including castling, en passant, pawn promotion, and checkmate detection
- **Secure Authentication**: JWT-based auth with HTTP-only cookies
- **Interactive UI**: Drag-and-drop and click-to-move with touch support
- **FEN Notation**: Board state persistence using Forsyth-Edwards Notation
- **Room-based Games**: Create/join games with unique 6-character codes
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🛠️ Tech Stack

- **Framework**: Angular 19.2.0 (standalone components)
- **Language**: TypeScript 5.7.2
- **State Management**: RxJS 7.8.0 (BehaviorSubjects) + Angular Signals
- **Styling**: Tailwind CSS 4.1.11 + PostCSS
- **Real-time**: WebSocket API with STOMP protocol
- **Icons**: FontAwesome 6.7.2

## 🏗️ Architecture & System Design

### Design Patterns Implemented

- **[Strategy Pattern](https://refactoring.guru/design-patterns/strategy)**: Chess move validation algorithms in `move-utils.ts` with different strategies for each piece type (pawn, rook, knight, bishop, queen, king with special moves)

- **Resource Management Pattern**: Custom `SubSink` class for automatic subscription cleanup preventing memory leaks

- **[Facade Pattern](https://refactoring.guru/design-patterns/facade)**: `MyChessMessageService` provides simplified domain-specific interface for toast notifications (`showSuccess()`, `showError()`, etc.)

- **Centralized State Management**: `StateManagerService` using RxJS BehaviorSubjects for reactive state with clear separation between state updates and observable streams

- **WebSocket Resilience Pattern**: Custom reconnection logic with exponential backoff, message queuing during disconnection, and automatic subscription restoration

- **Seeded Random Generator Pattern**: `randomHSLGenerator()` utility using Mulberry32 PRNG for deterministic color generation based on user identifiers

- **Stateful Queue Pattern**: `ToastService` managing notification queue with max capacity, auto-dismissal, pause/resume capability, and requestAnimationFrame-based timing

- **Immutable Utility Pattern**: Pure functional utilities in `fen-utils.ts` and `move-utils.ts` for chess logic without side effects

- **Discriminated Union Types**: TypeScript union types for state management ensuring compile-time type safety (e.g., `UserInterface` type)

### System Design Highlights

**1. Real-time Communication**
```
Client → WebSocket Connection → Backend
   ↓
Opponent moves piece → Backend broadcasts → Client receives update
   ↓
Board state updated via FEN notation
```

**2. WebSocket Resilience**
- Message queuing during disconnection
- Automatic reconnection with exponential backoff
- Subscription restoration after reconnect
- Circuit breaker after 15 failed attempts
- Heartbeat monitoring for stale connections

**3. Chess Logic Architecture**
```
ChessboardComponent
├── FEN Parsing (fen-utils.ts)
├── Move Validation (move-utils.ts)
│   ├── Strategy per piece type
│   ├── Path clearance checking
│   ├── Attack square detection
│   └── Special moves (castling, en passant)
└── Captured Pieces Parsing (custom string format)
```

**4. Performance Optimizations**
- OnPush change detection strategy
- Subscription cleanup with SubSink utility
- Lazy loading of routes
- AOT compilation in production
- Angular Signals for fine-grained reactivity

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
- Exponential backoff on connection loss (1s → 2s → 4s → 8s)
- Message queue persists unsent messages
- Automatic subscription restoration
- Visual feedback via toast notifications
- Auto-cleanup on component destroy

## ♟️ Chess Logic Highlights

**Move Validation** (`move-utils.ts`):
- Strategy pattern with 50+ lines of pawn-specific logic
- Special moves: castling (kingside/queenside), en passant, pawn promotion
- `isSquareAttacked()` algorithm for check detection
- `isPathClear()` for sliding pieces (rook, bishop, queen)

**FEN Notation** (`fen-utils.ts`):
- Bidirectional conversion: FEN string ↔ 8x8 board array
- Board orientation support (normal/flipped for black player)
- Example: `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`

**Captured Pieces**:
- Custom format: `b{pieces}/w{pieces}` (e.g., `bPNB/wRQ`)
- Parser: `getCapturedPiecesOfAColor()` with regex-based extraction
- Real-time UI display by color

## 📚 Key Files

| File | Purpose |
|------|---------|
| `modules/play/components/chessboard/` | Interactive chess board UI with drag-drop |
| `modules/play/@utils/move-utils.ts` | Strategy pattern for piece validation |
| `modules/play/@utils/fen-utils.ts` | FEN notation parser with orientation support |
| `modules/shared/services/state-manager.service.ts` | RxJS-based centralized state |
| `modules/shared/services/websocket.service.ts` | Resilient WebSocket with message queue |
| `modules/shared/@utils/Subsink.ts` | Custom subscription management |
| `@core/http-interceptors/auth-interceptor.interceptor.ts` | Functional JWT error handling |

## 🐛 Troubleshooting

**CORS Errors**: Ensure backend allows `http://localhost:4200` with credentials
**WebSocket Fails**: Check browser console, verify backend running, confirm JWT cookie present
**Auth Issues**: Clear cookies, check token expiration
**Message Queue Overflow**: Check network connectivity, backend may be down

---

**Built with Angular 19 • TypeScript • RxJS • Tailwind CSS**
