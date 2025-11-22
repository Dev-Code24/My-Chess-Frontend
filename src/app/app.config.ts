import { ApplicationConfig, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthHttpInterceptor, DateHttpInterceptor } from '@core/http-interceptors';
import { AppInitializer } from '@core/app-initializers';

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
    provideAppInitializer(AppInitializer),
    provideHttpClient(
      withInterceptors([ DateHttpInterceptor, AuthHttpInterceptor ]),
    ),
  ],
};
