import { Component, effect, inject, input, OnInit, signal } from '@angular/core';

import { RoomDetails, UserDetails } from '@shared/@interface';
import { SubSink } from '@shared/@utils/Subsink';
import { PlayConnectBackendService } from '../../service/play-connect-backend.service';
import { RoomDetailsApiResponse, Move, PieceColor, LiveRoomInfo } from '../../@interfaces';
import { StateManagerService } from '@shared/services';
import { ChessboardComponent } from '../chessboard/chessboard.component';
import { HttpErrorResponse } from '@angular/common/http';
import { LoaderDialogComponent } from "@shared/components/loader";

@Component({
  selector: 'app-play',
  imports: [ChessboardComponent, LoaderDialogComponent],
  templateUrl: './play.component.html',
  styleUrl: './play.component.scss'
})
export class PlayComponent implements OnInit {
  public readonly roomId = input.required<string>();

  protected roomNotification = signal<string | undefined>(undefined);
  protected opponent = signal<UserDetails | undefined>(undefined);
  protected me = signal<UserDetails | undefined>(undefined);
  protected whoIsBlackPlayer = signal<'me' | 'opponent' | undefined>(undefined);
  protected opponentsMove = signal<Move | null>(null);
  protected chessboardFen = signal<string | undefined>(undefined);
  protected capturedPieces = signal<string | undefined>(undefined);
  protected winner = signal<PieceColor | null>(null);

  private readonly subsink = new SubSink();
  private readonly stateManagerService = inject(StateManagerService);
  private readonly connectBackend = inject(PlayConnectBackendService);

  constructor() {
    effect(() => this.me.set(this.stateManagerService.getUser().details!));
  }
  public ngOnInit(): void {
    this.getRoomDetails();
  }

  public ngOnDestroy(): void {
    this.subsink.unsubscribeAll();
  }

  protected onPieceMoved(move: Move): void {
    this.subsink.sink = this.connectBackend.postPieceMoves(this.roomId(), move).subscribe({
      next: (data) => {
        console.log('you played', data);
      },
      error: (err: HttpErrorResponse) => console.error(err),
    });
  }

  private getLiveRoomDetails(): void {
    this.subsink.sink = this.connectBackend.getLiveRoomDetails(this.roomId()).subscribe({
      next: (response: string | RoomDetails | LiveRoomInfo) => {
        if (typeof response === 'string') {
          this.roomNotification.set(response);
        } else if ('code' in response) {
          this.assignPlayerRoles(response.blackPlayer, response.whitePlayer);
          this.assignWinner(response.gameStatus);
        } else {
          if (response.move.piece.color === 'b') {
            if (this.whoIsBlackPlayer() === 'opponent') {
              console.log('opponent moved:', response);
              this.opponentsMove.set(response.move);
            }
          } else {
            if (this.whoIsBlackPlayer() === 'me') {
              console.log('opponent moved:', response);
              this.opponentsMove.set(response.move);
            }
          }
        }
      },
      error: (error: HttpErrorResponse) => console.error(error)
    });
  }

  private getRoomDetails(): void {
    this.subsink.sink = this.connectBackend.getRoomDetails(this.roomId()).subscribe({
      next: (response: RoomDetailsApiResponse) => {
        if (response && response.data) {
          const { data } = response;
          this.assignPlayerRoles(data.blackPlayer, data.whitePlayer);
          this.assignWinner(data.gameStatus);
          this.chessboardFen.set(data.fen);
          this.capturedPieces.set(data.capturedPieces);
          const whoIsBlackPlayer = this.whoIsBlackPlayer();
        }
      },
      error: (error: HttpErrorResponse) => console.error(error),
      complete: () => {
        if (!this.winner()) {
          this.getLiveRoomDetails();
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

  private assignWinner(gameStatus: string): void {
    if (gameStatus.includes('won')) {
      const winner: PieceColor = gameStatus.includes('white') ? 'w' : 'b';
      this.winner.set(winner);
    }
  }
}
