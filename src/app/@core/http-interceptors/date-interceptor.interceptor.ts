import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';

export const DateHttpInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map((event) => {
      if (event instanceof HttpResponse && event.body) {
        return event.clone({
          body: convertDates(event.body),
        });
      }
      return event;
    })
  );
};

function convertDates(body: any): any {
  if (body === null || body === undefined) return body;

  if (typeof body === 'string' && isIsoDate(body)) {
    return new Date(body);
  }

  if (Array.isArray(body)) {
    return body.map((val) => convertDates(val));
  }

  if (typeof body === 'object') {
    const copy: any = {};
    for (const key of Object.keys(body)) {
      copy[key] = convertDates(body[key]);
    }
    return copy;
  }

  return body;
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(value);
}
