import { Component, computed, inject } from '@angular/core';

import { TabViewComponent, TabViewPanelComponent } from "@shared/components/tabview";
import { LoginComponent } from "../login/login.component";
import { SignUpComponent } from "../sign-up/sign-up.component";

import { AUTH } from '../../@constants/constants';
import { Router } from '@angular/router';
import { COLORS } from '@shared/utils/constants';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MyChessLogoComponent } from "@shared/components/my-chess-logo/my-chess-logo.component";
import { AuthForm } from 'modules/auth/@interface/interface';

@Component({
  selector: 'app-auth',
  imports: [
    TabViewComponent, TabViewPanelComponent, LoginComponent, SignUpComponent, FontAwesomeModule, MyChessLogoComponent
],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent  {
  private router = inject(Router);

  protected CONSTANTS = {...AUTH, ...COLORS};
  protected activeIndex = computed(() => this.router.url.includes('login') ? 0 : 1);

  protected onTabChange(index: number) {
    if (index === 0) {
      this.router.navigate(['/auth/login']);
    } else if (index === 1) {
      this.router.navigate(['/auth/sign-up']);
    }
  }

  protected handleSubmit(formObject: AuthForm ): void {
    const { formType } = formObject;
    if (formType === 'LOGIN') {

    } else {

    }
  }
}
