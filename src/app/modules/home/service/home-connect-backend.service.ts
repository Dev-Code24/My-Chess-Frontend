import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateRoomApiResponse, JoinRoomApiPayload, JoinRoomApiResponse } from '../@interface';
import { CommonConnectBackendService } from '@shared/services';
import {LoginApiResponse} from '../../auth/@interface';

@Injectable({
  providedIn: 'root',
})
export class HomeConnectBackendService {
  private readonly commonConnectBackend = inject(CommonConnectBackendService);

  public getUserDetails(): Observable<LoginApiResponse> {
    return this.commonConnectBackend.get<LoginApiResponse>('/user/me');
  }

  // TODO: Change join room to use dynamic route instead of request body
  public joinRoom(roomId: JoinRoomApiPayload): Observable<JoinRoomApiResponse> {
    return this.commonConnectBackend.post<JoinRoomApiResponse>('/room/join', roomId);
  }

  public createRoom(): Observable<CreateRoomApiResponse> {
    return this.commonConnectBackend.post<CreateRoomApiResponse>('/room/create');
  }
}
