import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserInterface, WebSocketState } from '@shared/@interface';
import {DEFAULT_USER_DATA, ERROR_MESSAGES, MESSAGES} from '@shared/@utils/constants';
import { SubSink } from '@shared/@utils/Subsink';
import { StateManagerService } from '@shared/services/state-manager.service';
import { NavbarComponent } from "modules/navbar/components/navbar/navbar.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { MyChessMessageService, WebsocketService } from '@shared/services';
import { interval, tap } from 'rxjs';

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
        tap((user) => this.user.set(user)),
      )
      .subscribe({
        next: (user) => {
          if (user.isLoggedIn) {
            this.subsink.sink = this.wsService.connect().subscribe({
              next: () => this.messageService.showSuccess(MESSAGES.WEBSOCKET_CONNECTED),
              error: () => this.messageService.showError(ERROR_MESSAGES.WEBSOCKET_CONNECTION_FAILED),
            });

            this.subsink.sink = interval(10_000).subscribe(() => this.wsService.checkHeartbeat());
          } else {
            this.wsService.disconnect();
          }
        }
      });

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
