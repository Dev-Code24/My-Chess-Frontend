import { inject, Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

import { JWT_TOKEN_STORAGE_KEY } from '../@utils/constants';
import { StateManagerService } from '@shared/services/state-manager.service';
import { DEFAULT_USER_DATA } from '@shared/@utils/constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly jwtService = inject(JwtHelperService);
  private readonly stateManagerService = inject(StateManagerService);

  private readonly JWT_STORAGE_KEY = JWT_TOKEN_STORAGE_KEY;

  public get JWT(): string | null { return localStorage.getItem(this.JWT_STORAGE_KEY); }
  private set setAuthToken(token: string) { localStorage.setItem(this.JWT_STORAGE_KEY, token); }
  private clearToken(): void { localStorage.removeItem(this.JWT_STORAGE_KEY); }

  public get isUserAuthenticated(): boolean {
    if (!this.JWT) { return false; }
    return !this.jwtService.isTokenExpired(this.JWT);
  }
  public logIn(): boolean {
    // Add proper login implementation
    let jwtData = DEFAULT_USER_DATA;
    if (this.JWT) {
      jwtData.details = this.jwtService.decodeToken(this.JWT);
    }
    this.stateManagerService.updateUser({ ...jwtData, isLoggedIn: !!jwtData.details, });
    return true;
  }
  public logOut(): boolean {

    this.clearToken();
    return true;
  }
}
