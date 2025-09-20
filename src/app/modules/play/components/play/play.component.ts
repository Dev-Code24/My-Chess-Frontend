import { Component, inject, input, OnInit, signal } from '@angular/core';

import { RoomDetails, UserDetails } from '@shared/@interface';
import { SubSink } from '@shared/@utils/Subsink';
import { PlayConnectBackendService } from 'modules/play/service/play-connect-backend.service';
import { RoomDetailsApiResponse } from 'modules/play/@interfaces';
import { StateManagerService } from '@shared/services';
import { ChessboardComponent } from '../chessboard/chessboard.component';

@Component({
  selector: 'app-play',
  imports: [ChessboardComponent],
  templateUrl: './play.component.html',
  styleUrl: './play.component.scss'
})
export class PlayComponent implements OnInit {
  protected readonly roomId = input.required<string>();
  protected opponent = signal<UserDetails | undefined>(undefined);
  protected me = signal<UserDetails | undefined>(undefined);
  protected whoIsBlackPlayer = signal<'me' | 'opponent' | undefined>(undefined);

  private readonly subsink = new SubSink();
  private readonly stateManagerService = inject(StateManagerService);
  private readonly connectBackend = inject(PlayConnectBackendService);

  public ngOnInit(): void {
    this.me.set(this.stateManagerService.getUser().details!);
    // this.getLiveRoomDetails();
    this.getRoomDetails();
  }

  public ngOnDestroy(): void {
    this.subsink.unsubscribeAll();
  }

  private getLiveRoomDetails(): void {
    this.subsink.sink = this.connectBackend.getLiveRoomDetails(this.roomId()).subscribe({
      next: (response: string | RoomDetails) => {
        if (typeof response === 'string') {
          console.log('string:', response);
        } else {
          console.log('object:', response);
        }
      },
      error: (error: Event) => console.log(error)
    });
  }

  private getRoomDetails(): void {
    this.subsink.sink = this.connectBackend.getRoomDetails(this.roomId()).subscribe({
      next: (response: RoomDetailsApiResponse) => {
        if (response && response.data) {
          const { data } = response;

          if (data.blackPlayer && data.blackPlayer.email !== this.me()!.email) {
            this.opponent.set(data.blackPlayer);
            this.whoIsBlackPlayer.set('opponent');
          } else if (data.whitePlayer && data.whitePlayer.email !== this.me()!.email) {
            this.opponent.set(data.whitePlayer);
            this.whoIsBlackPlayer.set('me');
          }
        }
      }
    });
  }
}
