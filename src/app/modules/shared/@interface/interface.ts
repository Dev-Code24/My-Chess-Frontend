export interface UserInterface {
  isLoggedIn: boolean;
  details: { name: string; email: string; } | null;
}
