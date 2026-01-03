import { Routes } from '@angular/router';

import { authGuard, loginGuard, leaveRoomGuard } from '@shared/guards';
import { AuthComponent } from 'modules/auth/components/auth/auth.component';
import { HomeComponent } from 'modules/home/components/home/home.component';
import { PlayComponent } from 'modules/play/components/play/play.component';
import { EasterEggComponent } from 'modules/easter-egg/easter-egg/easter-egg.component';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [loginGuard],
    component: AuthComponent,
  },
  {
    path: 'hello-world',
    component: EasterEggComponent,
  },
  {
    path: '',
    canActivateChild: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'play/:roomId', component: PlayComponent, canDeactivate: [ leaveRoomGuard ] },
    ],
  },
  { path: '**', redirectTo: 'home', pathMatch: 'full' },
];
