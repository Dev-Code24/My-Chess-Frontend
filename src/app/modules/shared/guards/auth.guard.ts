import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChildFn, Router, RouterStateSnapshot } from '@angular/router';
import { StateManagerService } from '@shared/services/state-manager.service';
import { map } from 'rxjs';

export const authGuard: CanActivateChildFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const stateManagerService = inject(StateManagerService);
  const router = inject(Router);

  return stateManagerService.user$.pipe(
    map(appState => {
      if (appState.isLoggedIn) { return true; }
      else {
        return router.createUrlTree(['auth'], {
          queryParams: {
            signup: true,
          },
        });
      }
    })
  )
};
