export interface UserDetails {
  username: string;
  email: string;
  inGame: boolean;
}

export type UserInterface = { isLoggedIn: false; details: null; } | { isLoggedIn: true; details: UserDetails; };

export interface RoomDetails {
  id: string;
  code: string;
  fen: string;
  whitePlayer: UserDetails | null;
  blackPlayer: UserDetails | null;
  lastActivity: Date;
  roomStatus: string;
  gameStatus: string;
}
