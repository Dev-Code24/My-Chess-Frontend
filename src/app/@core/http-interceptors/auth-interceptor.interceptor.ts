import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const AuthHttpInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const easterEggPath = 'hello-world';
  const href = window.location.href;

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (href.includes(easterEggPath)) {
        router.navigate([easterEggPath]);
      } else if (error.status === 401 || error.status === 403) {
        router.navigate(['auth'], { queryParams: { signup: true, }, });
      }
      return throwError(() => error);
    })
  );
};
