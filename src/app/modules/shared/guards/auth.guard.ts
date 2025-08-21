import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StateManagerService } from '@shared/services/state-manager.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const stateManagerService = inject(StateManagerService);
  const router = inject(Router);

  return stateManagerService.user$.pipe(
    map(state => {
      if (state.isLoggedIn) return true;
      else return router.createUrlTree(['auth'], {
        queryParams: {
          'sign-up': true,
        }
      });
    })
  )
};
