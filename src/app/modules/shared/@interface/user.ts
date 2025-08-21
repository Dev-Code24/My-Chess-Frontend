export interface UserDetails {
  username: string;
  email: string;
}

export type UserInterface = { isLoggedIn: false; details: null; } | { isLoggedIn: true; details: UserDetails; };

