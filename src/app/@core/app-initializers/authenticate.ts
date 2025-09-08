import { inject } from "@angular/core";
import { catchError, of, tap } from "rxjs";

import { AuthService } from "modules/auth/service";
import { LoginApiResponse } from "modules/auth/@interface";
import { CommonConnectBackendService } from "@shared/services";

export function AuthAppInitiazer () {
  const auth = inject(AuthService);
  const commonConnectBackend = inject(CommonConnectBackendService);

  return commonConnectBackend.get<LoginApiResponse>('user/me')
    .pipe(
      tap((value) => { auth.authenticate(value.data); }),
      catchError(() => {
        auth.logOut();
        return of(null);
      })
    );
}
