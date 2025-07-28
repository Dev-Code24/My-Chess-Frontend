export interface UserInterface {
  isLoggedIn: boolean;
  details: { name: string | null, email: string | null };
}
