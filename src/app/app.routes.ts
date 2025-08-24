import { Routes } from '@angular/router';

import { authGuard, loginGuard } from '@shared/guards';

import { AuthComponent } from 'modules/auth/components/auth/auth.component';
import { HomeComponent } from 'modules/home/components/home/home.component';
import { PlayComponent } from 'modules/play/components/play/play.component';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [loginGuard],
    component: AuthComponent,
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'play/:roomId', component: PlayComponent },
    ],
  },
  { path: '**', redirectTo: 'home', pathMatch: 'full' },
];
