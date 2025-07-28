import { Routes } from '@angular/router';
import { authGuard } from '@shared/guards/auth.guard';
import { PlayComponent } from 'modules/play/play.component';

export const routes: Routes = [
  { path: '', redirectTo: 'play', pathMatch: 'full'},
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.routes').then(r => r.AuthRoutes),
  },
  {
    path: 'play',
    canActivate: [ authGuard ],
    component: PlayComponent
  },
  { path: '**', redirectTo: 'play', pathMatch: 'full' },
];
