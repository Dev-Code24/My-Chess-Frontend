import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonConnectBackendService, WebsocketService } from '@shared/services';
import { LogoutApiPayload, LogoutApiResponse } from '@shared/@interface';

@Injectable({
  providedIn: 'root'
})
export class NavbarConnectBackendService {
  private readonly commonBackendService = inject(CommonConnectBackendService);
  private readonly wsService = inject(WebsocketService);

  public logout(payload: LogoutApiPayload): Observable<LogoutApiResponse> {
    this.wsService.disconnect();
    return this.commonBackendService.post<LogoutApiResponse>('auth/logout', payload);
  }
}
