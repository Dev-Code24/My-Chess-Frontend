import { inject, Injectable } from '@angular/core';
import { StateManagerService } from '@shared/services/state-manager.service';
import { DEFAULT_USER_DATA } from '@shared/@utils/constants';
import { LoginApiResponseAttribute } from '../@interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly stateManagerService = inject(StateManagerService);

  public isUserAuthenticated(): boolean { return this.stateManagerService.getUser().isLoggedIn; }
  public authenticate(user: LoginApiResponseAttribute): boolean {
    this.stateManagerService.updateUser({
      isLoggedIn: true,
      details: user,
    })
    return true;
  }
  public logOut(): boolean {
    this.stateManagerService.updateUser(DEFAULT_USER_DATA);
    return true;
  }
}
