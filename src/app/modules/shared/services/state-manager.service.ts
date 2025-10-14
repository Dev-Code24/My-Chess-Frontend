import { Injectable } from '@angular/core';
import { DEFAULT_USER_DATA } from '@shared/@utils/constants';
import { UserInterface } from '@shared/@interface';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StateManagerService {
  private userSubject = new BehaviorSubject<UserInterface>(DEFAULT_USER_DATA)
  private myTurnSubject = new BehaviorSubject<boolean>(false);

  public user$: Observable<UserInterface> = this.userSubject.asObservable();
  public myTurn$: Observable<boolean> = this.myTurnSubject.asObservable();

  constructor() { }

  /* USER STATE METHODS */
  public getUser(): UserInterface { return this.userSubject.value; }
  public updateUser(updatedUserField: UserInterface): void { this.userSubject.next(updatedUserField); }
  public resetUser(): void { this.userSubject.next(DEFAULT_USER_DATA); }

  public isMyTurn(): boolean { return this.myTurnSubject.value; }
  public updateIsMyTurn(myTurn: boolean): void { this.myTurnSubject.next(myTurn); }
}
