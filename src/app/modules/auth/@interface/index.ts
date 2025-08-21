import { BasicApiResponse, UserDetails } from "@shared/@interface";

interface LoginForm {
  formType: 'LOGIN';
  payload: LoginApiPayload;
}

interface SignupForm {
  formType: 'SIGN_UP';
  payload: SignupApiPayload;
}

export type AuthForm = LoginForm | SignupForm;

export enum AuthProvider {
  GOOGLE = 'google',
  LOCAL = 'local',
}

export interface SignupApiPayload {
  email: string;
  password: string;
  username?: string;
  authProvider: AuthProvider;
}

export interface LoginApiPayload {
  email: string;
  password: string;
}

export interface LoginApiResponseAttribute extends UserDetails { }
export interface LoginApiResponse extends BasicApiResponse<LoginApiResponseAttribute> { }
export interface SignupApiResponseAttribute extends UserDetails { }
export interface SignupApiResponse extends BasicApiResponse<SignupApiResponseAttribute> { }
