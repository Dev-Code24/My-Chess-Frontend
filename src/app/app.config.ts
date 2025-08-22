import { ApplicationConfig, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthAppInitiazer } from '@core/app-initializers/authenticate';
import { AuthHttpInterceptor, DateHttpInterceptor } from '@core/http-interceptors';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withRouterConfig({
        paramsInheritanceStrategy: 'always',
      })
    ),
    provideHttpClient(
      withInterceptors([ DateHttpInterceptor, AuthHttpInterceptor ]),
    ),
    provideAppInitializer(AuthAppInitiazer)
  ],
};
