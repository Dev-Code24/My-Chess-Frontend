import { Injectable } from '@angular/core';
import { DEFAULT_USER_DATA } from '@shared/@utils/constants';
import { UserInterface } from '@shared/@interface';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StateManagerService {
  private userSubject = new BehaviorSubject<UserInterface>(DEFAULT_USER_DATA)

  public user$: Observable<UserInterface> = this.userSubject.asObservable();

  constructor() { }

  /* USER STATE METHODS */
  public getUser(): UserInterface { return this.userSubject.value; }
  public updateUser(updatedUserField: Partial<UserInterface>): void {
    const currentUser = this.getUser();
    this.userSubject.next({ ...currentUser , ...updatedUserField });
  }
  public resetUser(): void { this.userSubject.next(DEFAULT_USER_DATA); }

}
