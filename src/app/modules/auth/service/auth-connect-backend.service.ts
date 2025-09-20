import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginApiPayload, LoginApiResponse, SignupApiPayload, SignupApiResponse } from '../@interface';
import { CommonConnectBackendService } from '@shared/services';

@Injectable({
  providedIn: 'root'
})
export class AuthConnectBackendService {
  private readonly commonConnectBackend = inject(CommonConnectBackendService);

  constructor() { }

  public login(payload: LoginApiPayload): Observable<LoginApiResponse> {
    return this.commonConnectBackend.post<LoginApiResponse>('/auth/login', payload);
  }
  public signup(payload: SignupApiPayload): Observable<SignupApiResponse> {
    return this.commonConnectBackend.post<SignupApiResponse>('/auth/signup', payload);
  }
}
