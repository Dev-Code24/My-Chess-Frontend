import { Routes } from '@angular/router';
import { authGuard } from '@shared/guards/auth.guard';

import { HomeComponent } from 'modules/home/components/home/home.component';
import { PlayComponent } from 'modules/play/components/play/play.component';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.routes').then(r => r.AuthRoutes),
  },
  { path: '', redirectTo: 'home', pathMatch: 'full', },
  {
    path: '',
    canActivate: [ authGuard ],
    children: [
      { path: 'play', component: PlayComponent },
      { path: 'home', component: HomeComponent },
    ],
  },
  { path: '**', redirectTo: 'home', pathMatch: 'full' },
];
