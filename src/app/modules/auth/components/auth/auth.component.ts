import { Component, computed, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { TabViewComponent, TabViewPanelComponent } from "@shared/components/tabview";
import { LoginComponent } from "../login/login.component";
import { SignUpComponent } from "../sign-up/sign-up.component";
import { MyChessLogoComponent } from "@shared/components";

import { AuthConnectBackendService } from 'modules/auth/service/auth-connect-backend.service';
import { AuthService } from 'modules/auth/service/auth.service';
import { AuthForm, LoginApiResponse, SignupApiResponse } from 'modules/auth/@interface';
import { AUTH } from '../../@utils/constants';
import { COLORS } from '@shared/@utils/constants';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-auth',
  imports: [
    TabViewComponent, TabViewPanelComponent, LoginComponent, SignUpComponent, FontAwesomeModule, MyChessLogoComponent
],
  templateUrl: './auth.component.html',
})
export class AuthComponent  {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly connectBackend = inject(AuthConnectBackendService);

  protected readonly CONSTANTS = {...AUTH, ...COLORS};
  protected activeIndex = computed(() => this.router.url.includes('login') ? 0 : 1);

  protected onTabChange(index: number): void {
    switch (index) {
      case 0:
        this.router.navigate(['auth'], {
          queryParams: { login: true, }
        });
        break;
      case 1:
        this.router.navigate(['auth'], {
          queryParams: { 'sign-up': true, }
        });
        break;
      default: break;
    }
  }

  protected handleLoginOrSignup(formObject: AuthForm): void {
    const { formType, payload } = formObject;
    switch (formType) {
      case 'LOGIN':
        this.connectBackend.login(payload).subscribe({
          next: (res: LoginApiResponse) => {
            this.authService.authenticate(res.data);
            console.log(res.timestamp);
          },
          error: (err: HttpErrorResponse) => console.error('🥲 Something bad happened', err),
          complete: () => this.router.navigate(['/home'])
        });
        break;
      case 'SIGN_UP':
        this.connectBackend.signup(payload).subscribe({
          next: (res: SignupApiResponse) => {
            this.authService.authenticate(res.data);
            console.log(res.timestamp);
          },
          error: (err: HttpErrorResponse) => console.error('🥲 Something bad happened', err),
          complete: () => this.router.navigate(['/home'])
        });
        break;
      default:
        console.log('Authentication crashed!');
        break;
    }
  }
}
