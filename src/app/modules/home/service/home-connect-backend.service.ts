import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateRoomApiResponse, JoinRoomApiPayload, JoinRoomApiResponse } from '../@interface';
import { CommonConnectBackendService } from '@shared/services';

@Injectable({
  providedIn: 'root',
})
export class HomeConnectBackendService {
  private readonly commonConnectBackend = inject(CommonConnectBackendService);

  constructor() {}

  public joinRoom(roomId: JoinRoomApiPayload): Observable<JoinRoomApiResponse> {
    return this.commonConnectBackend.post<JoinRoomApiResponse>('/room/join', roomId);
  }

  public createRoom(): Observable<CreateRoomApiResponse> {
    // return this.commonConnectBackend.post<CreateRoomApiResponse>('/room/create');
    return new Observable<CreateRoomApiResponse>((observer) => {
      setTimeout(() => {
        observer.next({
          "message": "success",
          "status": 200,
          "data": {
              "id": "b525458f-fb0c-4434-af81-72d518203d59",
              "roomStatus": "available",
              "gameStatus": "waiting",
              "code": "6pijxk",
              "lastActivity": new Date("2025-09-19T22:47:06.669735"),
              "whitePlayer": {
                  "email": "rajeev24cl@gmail.com",
                  "username": "rajeev24cl",
                  "inGame": true
              },
              "blackPlayer": {
                  "email": "rajeev25cl@gmail.com",
                  "username": "Rajeev",
                  "inGame": true
              },
          },
          "selfLink": "/room/create",
          "timestamp": new Date("2025-09-19T17:17:07.306390Z")
      });
        observer.complete();
      }, 500);
    });
  }
}
