import { Component, inject, input, OnDestroy, OnInit, signal } from '@angular/core';

import {ApiError, RoomDetails, UserDetails, UserInterface} from '@shared/@interface';
import { SubSink } from '@shared/@utils/Subsink';
import { PlayConnectBackendService } from '../../service/play-connect-backend.service';
import { RoomDetailsApiResponse, Move, PieceColor, LiveRoomInfo } from '../../@interfaces';
import { StateManagerService } from '@shared/services';
import { ChessboardComponent } from '../chessboard/chessboard.component';
import { LoaderDialogComponent } from "@shared/components/loader";
import { MyChessMessageService } from '@shared/services';
import { isMyTurn } from '../../@utils';
import { ERROR_MESSAGES, MESSAGES } from '@shared/@utils';

@Component({
  selector: 'app-play',
  imports: [ChessboardComponent, LoaderDialogComponent],
  templateUrl: './play.component.html',
  styleUrl: './play.component.scss'
})
export class PlayComponent implements OnInit, OnDestroy {
  public readonly roomId = input.required<string>();
  public whoIsBlackPlayer = signal<'me' | 'opponent' | undefined>(undefined);

  protected opponent = signal<UserDetails | undefined>(undefined);
  protected me = signal<UserDetails | undefined>(undefined);
  protected opponentsMove = signal<Move | null>(null);
  protected chessboardFen = signal<string | undefined>(undefined);
  protected capturedPieces = signal<string | undefined>(undefined);
  protected winner = signal<PieceColor | null>(null);
  protected dialogMessage = signal<MESSAGES>(MESSAGES.WAITING_FOR_OPPONENT);

  private readonly subsink = new SubSink();
  private readonly stateManagerService = inject(StateManagerService);
  private readonly messageService = inject(MyChessMessageService);
  private readonly connectBackend = inject(PlayConnectBackendService);

  public ngOnInit(): void {
    this.loadRoomAndConnectWebSocket();
    this.subsink.sink = this.stateManagerService.user$.subscribe({
      next: (user) => {
        if (user.isLoggedIn) {
          this.me.set(user.details);
        }
      }
    });
  }

  public ngOnDestroy(): void {
    this.subsink.unsubscribeAll();
  }

  protected onPieceMoved(move: Move): void {
    this.connectBackend.postPieceMoves(this.roomId(), move);
  }

  private loadRoomAndConnectWebSocket(): void {
    this.subsink.sink = this.connectBackend.getRoomDetails(this.roomId()).subscribe({
      next: (response: RoomDetailsApiResponse) => {
        if (response && response.data) {
          const data = response.data;

          this.assignPlayerRoles(data.blackPlayer, data.whitePlayer);

          const opponent = this.opponent();
          if (opponent && opponent.inGame) {
            this.dialogMessage.set(MESSAGES.CONNECTING);
          }

          this.assignWinner(data.gameStatus);
          this.chessboardFen.set(data.fen);
          this.capturedPieces.set(data.capturedPieces);

          const whoIsBlack = this.whoIsBlackPlayer();

          if (whoIsBlack) {
            const myColor: PieceColor = whoIsBlack === 'me' ? 'b' : 'w';
            this.stateManagerService.updateIsMyTurn(isMyTurn(data.fen, myColor));
          }
        }
      },
      error: (error: ApiError) => this.messageService.showError(error.error.message),
      complete: () => {
        if (!this.winner()) {
          this.initWebSocket();
        }
      }
    });
  }

  private initWebSocket(): void {
    this.subsink.sink = this.connectBackend.subscribeToRoom(this.roomId()).subscribe({
      next: (response) => this.listenToRoomUpdates(response),
      error: () => this.messageService.showError(ERROR_MESSAGES.WEBSOCKET_DISCONNECTED_ABRUPTLY),
    });
    this.connectBackend.joinRoom(this.roomId());
  }

  private listenToRoomUpdates(response: string | RoomDetails | LiveRoomInfo): void {
    const myColor: PieceColor = this.whoIsBlackPlayer() === 'me' ? 'b' : 'w';
    if (typeof response === 'string') {
      const opponent = this.opponent();
      if (opponent) {
        const opponentDisconnectedMessage = `Player ${opponent.username} left the room`;
        if (response.includes(opponentDisconnectedMessage)) {
          opponent.inGame = false;
          this.opponent.set(opponent);
          this.dialogMessage.set(MESSAGES.WAITING_FOR_OPPONENT);
          this.messageService.showMessage(response);
        } else if (response.includes('resumed')) {
          opponent.inGame = true;
          this.opponent.set(opponent);
          this.messageService.showMessage(response);
        }
      }
      return;
    }

    if ('code' in response) {
      const existingUserDetails: UserInterface = JSON.parse(JSON.stringify(this.stateManagerService.getUser()));
      const myColor = this.whoIsBlackPlayer() === 'me' ? 'b' : 'w';
      existingUserDetails.details = myColor === 'w' ? response.whitePlayer : response.blackPlayer;

      this.stateManagerService.updateUser(existingUserDetails);
      this.assignPlayerRoles(response.blackPlayer, response.whitePlayer);
      this.assignWinner(response.gameStatus);
      return;
    }

    const move = response.move;
    const moveIsBlack = move.piece.color === 'b';
    const isOpponentMove = (moveIsBlack && this.whoIsBlackPlayer() === 'opponent') ||
      (!moveIsBlack && this.whoIsBlackPlayer() === 'me');

    if (isOpponentMove) {
      this.opponentsMove.set(move);
    }

    this.stateManagerService.updateIsMyTurn(isMyTurn(response.fen, myColor));
  }

  private assignPlayerRoles(
    blackPlayer: UserDetails | null,
    whitePlayer: UserDetails | null
  ): void {
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
      const winnerColor: PieceColor = gameStatus.includes('white') ? 'w' : 'b';
      this.winner.set(winnerColor);
    }
  }
}
