import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateRoomApiResponse, JoinRoomApiPayload, JoinRoomApiResponse } from '../@interface';
import { CommonConnectBackendService } from '@shared/services';

@Injectable({
  providedIn: 'root'
})
export class HomeConnectBackendService {
  private readonly commonConnectBackend = inject(CommonConnectBackendService);

  constructor() { }

  public joinRoom(roomId: JoinRoomApiPayload): Observable<JoinRoomApiResponse> {
    return this.commonConnectBackend.post<JoinRoomApiResponse>('/room/join', roomId);
  }

  public createRoom(): Observable<CreateRoomApiResponse> {
    return this.commonConnectBackend.post('/room/create', {});
  }
}
