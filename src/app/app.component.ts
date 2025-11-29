import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserInterface, WebSocketState } from '@shared/@interface';
import {DEFAULT_USER_DATA, ERROR_MESSAGES, MESSAGES} from '@shared/@utils/constants';
import { SubSink } from '@shared/@utils/Subsink';
import { StateManagerService } from '@shared/services/state-manager.service';
import { NavbarComponent } from "modules/navbar/components/navbar/navbar.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { MyChessMessageService, WebsocketService } from '@shared/services';
import { catchError, distinctUntilChanged, EMPTY, interval, map, merge, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  public readonly title = 'my-chess-frontend';
  protected user = signal<UserInterface>(DEFAULT_USER_DATA);

  private readonly messageService = inject(MyChessMessageService);
  private readonly stateManagerService = inject(StateManagerService);
  private readonly wsService= inject(WebsocketService);
  private readonly subsink = new SubSink();

  public ngOnInit(): void {
    this.subsink.sink = this.stateManagerService.user$
      .pipe(
        tap((user: UserInterface) => this.user.set(user)),
        map((user: UserInterface) => user.isLoggedIn),
        distinctUntilChanged(),
        switchMap((isLoggedIn: boolean) => {
          if (isLoggedIn) {
            const connection$ = this.wsService.connect().pipe(
              tap(() => this.messageService.showSuccess(MESSAGES.WEBSOCKET_CONNECTED)),
              catchError(() => {
                this.messageService.showError(ERROR_MESSAGES.WEBSOCKET_CONNECTION_FAILED);
                return EMPTY;
              })
            );

            const heartbeat$ = interval(10_000).pipe(
              tap(() => this.wsService.checkHeartbeat())
            );

            return merge(connection$, heartbeat$);
          } else {
            this.wsService.disconnect();
            return EMPTY;
          }
        })
      ).subscribe();

    this.subsink.sink = this.stateManagerService.wsStateNotification$.subscribe((message) => {
      if (this.stateManagerService.getWsConnectionState() !== WebSocketState.CONNECTED) {
        this.messageService.showError(message);
      } else {
        this.messageService.showSuccess(message);
      }
    });
  }

  public ngOnDestroy(): void {
    this.subsink.unsubscribeAll();
  }
}
