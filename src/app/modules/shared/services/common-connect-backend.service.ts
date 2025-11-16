import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { RequestOptions } from '@shared/@interface';
import { catchError, Observable, retry, throwError } from 'rxjs';
import { WebsocketService } from './websocket.service';
import { StateManagerService } from './state-manager.service';

@Injectable({
  providedIn: 'root'
})
export class CommonConnectBackendService {
  private readonly http = inject(HttpClient);
  private readonly wsService = inject(WebsocketService);
  private readonly stateManagerService = inject(StateManagerService);
  private readonly baseUrl = environment.baseApiUrl;

  private readonly defaults: Required<Pick<RequestOptions, 'withCredentials' | 'retryCount'>> = {
    withCredentials: true,
    retryCount: 0,
  };

  private resolveUrl(path: string): string {
    const needsSlash = !(this.baseUrl.endsWith('/') || path.startsWith('/'));
    return `${this.baseUrl}${needsSlash ? '/' : ''}${path}`;
  }

  /** Convert plain objects to HttpHeaders/HttpParams */
  private buildOptions(opts?: RequestOptions) {
    const merged: Required<RequestOptions> = {
      ...this.defaults,
      params: opts?.params ?? {},
      headers: opts?.headers ?? {},
      withCredentials: opts?.withCredentials ?? this.defaults.withCredentials,
      retryCount: opts?.retryCount ?? this.defaults.retryCount,
    };

    let headers = new HttpHeaders();
    Object.entries(merged.headers).forEach(([key, value]) => {
      if (value !== null && value !== undefined) { headers = headers.set(key, String(value)); }
    });

    let params = new HttpParams();
    Object.entries(merged.params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(item => {
          if (item !== null && item !== undefined) { params = params.append(key, String(item)); }
        });
      } else if (value !== null && value !== undefined) {
        params = params.set(key, String(value));
      }
    });

    return { headers, params, withCredentials: merged.withCredentials, retryCount: merged.retryCount };
  }

  private handle<T>(obs: Observable<T>, retryCount: number): Observable<T> {
    return obs.pipe(
      retry(retryCount),
      catchError(err => {
        return throwError(() => err);
      })
    );
  }

  public get<T>(path: string, options?: RequestOptions): Observable<T> {
    const url = this.resolveUrl(path);
    const { retryCount, ...opts } = this.buildOptions(options);
    return this.handle(this.http.get<T>(url, opts), retryCount);
  }

  public post<T>(path: string, body?: unknown, options?: RequestOptions): Observable<T> {
    const url = this.resolveUrl(path);
    const { retryCount, ...opts } = this.buildOptions(options);
    return this.handle(this.http.post<T>(url, body ?? {}, opts), retryCount);
  }

  public put<T>(path: string, body?: unknown, options?: RequestOptions): Observable<T> {
    const url = this.resolveUrl(path);
    const { retryCount, ...opts } = this.buildOptions(options);
    return this.handle(this.http.put<T>(url, body ?? {}, opts), retryCount);
  }

  public patch<T>(path: string, body?: unknown, options?: RequestOptions): Observable<T> {
    const url = this.resolveUrl(path);
    const { retryCount, ...opts } = this.buildOptions(options);
    return this.handle(this.http.patch<T>(url, body ?? {}, opts), retryCount);
  }

  public delete<T>(path: string, options?: RequestOptions): Observable<T> {
    const url = this.resolveUrl(path);
    const { retryCount, ...opts } = this.buildOptions(options);
    return this.handle(this.http.delete<T>(url, opts), retryCount);
  }

  /** Convenience for multipart/form-data uploads */
  public upload<T>(path: string, formData: FormData, options?: RequestOptions): Observable<T> {
    const url = this.resolveUrl(path);
    const { retryCount, ...opts } = this.buildOptions(options);
    // NOTE: Do not set Content-Type; browser will set the multipart boundary
    return this.handle(this.http.post<T>(url, formData, opts), retryCount);
  }

  public wsConnect(): Observable<void> {
    return this.wsService.connect();
  }

  public wsSubscribe<T>(destination: string): Observable<T> {
    return this.wsService.subscribe<T>('/topic' + destination);
  }

  public wsSend(destination: string, body: unknown): void {
    this.wsService.send('/ws' + destination, body);
  }

  public wsDisconnect(): void {
    this.wsService.disconnect();
  }

  public wsConnectionState() {
    return this.stateManagerService.getWsConnectionState();
  }
}
