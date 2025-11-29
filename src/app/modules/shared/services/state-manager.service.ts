import { Injectable } from '@angular/core';
import { DEFAULT_USER_DATA } from '@shared/@utils/constants';
import { UserInterface, WebSocketState } from '@shared/@interface';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StateManagerService {
  private userSubject = new BehaviorSubject<UserInterface>(DEFAULT_USER_DATA)
  private myTurnSubject = new BehaviorSubject<boolean>(false);
  private wsConnectionState = new BehaviorSubject<WebSocketState>(WebSocketState.DISCONNECTED);
  private wsStateNotification = new Subject<string>();

  public user$: Observable<UserInterface> = this.userSubject.asObservable();
  public myTurn$: Observable<boolean> = this.myTurnSubject.asObservable();
  public wsStateNotification$: Observable<string> = this.wsStateNotification.asObservable();

  constructor() { }

  /* USER STATE METHODS */
  public getUser(): UserInterface { return this.userSubject.value; }
  public updateUser(updatedUserField: UserInterface): void { this.userSubject.next(updatedUserField); }
  public resetUser(): void { this.userSubject.next(DEFAULT_USER_DATA); }
  public isMyTurn(): boolean { return this.myTurnSubject.value; }
  public updateIsMyTurn(myTurn: boolean): void { this.myTurnSubject.next(myTurn); }

  /* WEBSOCKET STATE METHODS */
  public updateWsStateNotification(message: string) { this.wsStateNotification.next(message); }

  public getWsConnectionState(): WebSocketState { return this.wsConnectionState.value; }

  public setWsConnecting() { this.wsConnectionState.next(WebSocketState.CONNECTING); }
  public setWsConnected() { this.wsConnectionState.next(WebSocketState.CONNECTED); }
  public setWsDisconnected() { this.wsConnectionState.next(WebSocketState.DISCONNECTED); }
  public setWsReconnecting() { this.wsConnectionState.next(WebSocketState.RECONNECTING); }
  public setWsStale() { this.wsConnectionState.next(WebSocketState.STALE); }
}
