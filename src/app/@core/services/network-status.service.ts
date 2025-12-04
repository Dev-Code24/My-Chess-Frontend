import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, map, mapTo, merge, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkStatusService {
  private onlineStatusSubject = new BehaviorSubject(navigator.onLine);
  public onlineStatus$!: Observable<boolean>;

  constructor() {
    this.onlineStatus$ = merge(
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    );

    this.onlineStatus$.subscribe((isOnline) => {
      this.onlineStatusSubject.next(isOnline);
    });
  }
}
