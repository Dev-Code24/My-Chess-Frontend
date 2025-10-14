import { Component, effect, inject, input, OnInit, signal } from '@angular/core';

import { RoomDetails, UserDetails } from '@shared/@interface';
import { SubSink } from '@shared/@utils/Subsink';
import { PlayConnectBackendService } from '../../service/play-connect-backend.service';
import { RoomDetailsApiResponse, PieceMoved, PieceColor, LiveMoveDetails } from '../../@interfaces';
import { StateManagerService } from '@shared/services';
import { ChessboardComponent } from '../chessboard/chessboard.component';
import { isMyTurn } from '../../@utils';

@Component({
  selector: 'app-play',
  imports: [ChessboardComponent],
  templateUrl: './play.component.html',
  styleUrl: './play.component.scss'
})
export class PlayComponent implements OnInit {
  public readonly roomId = input.required<string>();

  protected roomNotification = signal<string | undefined>(undefined);
  protected opponent = signal<UserDetails | undefined>(undefined);
  protected me = signal<UserDetails | undefined>(undefined);
  protected whoIsBlackPlayer = signal<'me' | 'opponent' | undefined>(undefined);
  protected opponentsMove = signal<PieceMoved | null>(null);
  protected chessboardFen = signal<string | undefined>(undefined);

  private readonly subsink = new SubSink();
  private readonly stateManagerService = inject(StateManagerService);
  private readonly connectBackend = inject(PlayConnectBackendService);

  constructor() {
    effect(() => this.me.set(this.stateManagerService.getUser().details!));
  }
  public ngOnInit(): void {
    this.getLiveRoomDetails();
    this.getRoomDetails();
  }

  public ngOnDestroy(): void {
    this.subsink.unsubscribeAll();
  }

  protected onPieceMoved(pieceMoved: PieceMoved): void {
    this.subsink.sink = this.connectBackend.postPieceMoves(this.roomId(), pieceMoved).subscribe({
      next: (data) => {
        console.log('you played', data);
      },
      error: (err) => console.error(err),
    });
  }

  private getLiveRoomDetails(): void {
    this.subsink.sink = this.connectBackend.getLiveRoomDetails(this.roomId()).subscribe({
      next: (response: string | RoomDetails | LiveMoveDetails) => {
        if (typeof response === 'string') {
          this.roomNotification.set(response);
        } else if ('code' in response) {
          this.assignPlayerRoles(response.blackPlayer, response.whitePlayer);
        } else {
          const myColor: PieceColor = this.whoIsBlackPlayer() === 'me' ? 'b' : 'w';
          if (response.moveDetails.piece.color === 'b') {
            if (this.whoIsBlackPlayer() === 'opponent') {
              console.log('opponent moved:', response);
              this.opponentsMove.set(response.moveDetails);
            }
          } else {
            if (this.whoIsBlackPlayer() === 'me') {
              console.log('opponent moved:', response);
              this.opponentsMove.set(response.moveDetails);
            }
          }
          this.stateManagerService.updateIsMyTurn(isMyTurn(response.fen, myColor));
          console.log('set my turn to ', this.stateManagerService.isMyTurn());
        }
      },
      error: (error: Event) => console.error(error)
    });
  }

  private getRoomDetails(): void {
    this.subsink.sink = this.connectBackend.getRoomDetails(this.roomId()).subscribe({
      next: (response: RoomDetailsApiResponse) => {
        if (response && response.data) {
          const { data } = response;
          this.assignPlayerRoles(data.blackPlayer, data.whitePlayer);
          this.chessboardFen.set(data.fen);
          const whoIsBlackPlayer = this.whoIsBlackPlayer();
          if (whoIsBlackPlayer) {
            const myColor: PieceColor = this.whoIsBlackPlayer() === 'me' ? 'b' : 'w';
            this.stateManagerService.updateIsMyTurn(isMyTurn(data.fen, myColor));
          }
        }
      }
    });
  }

  private assignPlayerRoles(blackPlayer: UserDetails | null, whitePlayer: UserDetails | null): void {
    if (blackPlayer && blackPlayer.email !== this.me()!.email) {
      this.opponent.set(blackPlayer);
      this.whoIsBlackPlayer.set('opponent');
    } else if (whitePlayer && whitePlayer.email !== this.me()!.email) {
      this.opponent.set(whitePlayer);
      this.whoIsBlackPlayer.set('me');
    }
  }
}
