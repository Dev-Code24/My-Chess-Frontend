import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, of, tap } from "rxjs";

import { UserDetails } from "@shared/@interface";
import { AuthService } from "modules/auth/service/auth.service";
import { environment } from "../../../environments/environment.development";
import { LoginApiResponse } from "modules/auth/@interface";

export function AuthAppInitiazer () {
  const auth = inject(AuthService);
  const http = inject(HttpClient);

  return http.get<LoginApiResponse>(`${environment.baseApiUrl}/user/me`, { withCredentials: true, })
    .pipe(
      tap((value) => { auth.authenticate(value.data); }),
      catchError(() => {
        auth.logOut();
        return of(null);
      })
    );
}
