import { inject } from "@angular/core";
import { catchError, of, tap } from "rxjs";

import { AuthService } from "modules/auth/service";
import { LoginApiResponse } from "modules/auth/@interface";
import { CommonConnectBackendService } from "@shared/services";

export function AuthAppInitiazer () {
  const authService = inject(AuthService);
  const commonConnectBackendService = inject(CommonConnectBackendService);

  return commonConnectBackendService.get<LoginApiResponse>('user/me')
    .pipe(
      tap((value) => { authService.authenticate(value.data); }),
      catchError(() => {
        authService.logOut();
        return of(null);
      })
    );
}
