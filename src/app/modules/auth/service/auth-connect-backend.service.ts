import { HttpClient, HttpParamsOptions } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginApiPayload, LoginApiResponse, SignupApiPayload, SignupApiResponse } from '../@interface';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AuthConnectBackendService {
  private http = inject(HttpClient);
  private url = environment.baseApiUrl;
  private postOptions = { withCredentials: true, }

  constructor() { }

  public login(payload: LoginApiPayload): Observable<LoginApiResponse> {
    return this.http.post<LoginApiResponse>(`${this.url}/auth/login`, payload, this.postOptions);
  }
  public signup(payload: SignupApiPayload): Observable<SignupApiResponse> {
    return this.http.post<SignupApiResponse>(`${this.url}/auth/signup`, payload, this.postOptions);
  }
}
