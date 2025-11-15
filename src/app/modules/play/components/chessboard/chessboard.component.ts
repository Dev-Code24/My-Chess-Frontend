import { Component, computed, effect, ElementRef, inject, input, OnDestroy, output, signal, viewChild } from '@angular/core';
import { Piece, PieceColor, MoveDetails, Move, PieceDetails, CapturedPieceDetails } from './../../@interfaces';
import { AvatarComponent } from "@shared/components/avatar/avatar.component";
import { UserDetails } from '@shared/@interface';
import { validateMove, getCapturedPiecesOfAColor, parseFen } from '../../@utils';
import { SubSink } from '@shared/@utils';
import { timer } from 'rxjs';
import { StateManagerService } from '@shared/services';
import { PromotionDialogComponent } from "../promotion-dialog/promotion-dialog.component";
import { GameOverDialogComponent } from "../game-over-dialog/game-over-dialog.component";

@Component({
  selector: 'app-chessboard',
  imports: [AvatarComponent, PromotionDialogComponent, GameOverDialogComponent],
  templateUrl: './chessboard.component.html',
  styleUrl: './chessboard.component.scss'
})
export class ChessboardComponent implements OnDestroy {
  public readonly opponent = input.required<UserDetails>();
  public readonly me = input.required<UserDetails>();
  public readonly whoIsBlackPlayer = input.required<'me' | 'opponent'>();
  public readonly opponentsMove = input.required<Move | null>();
  public readonly chessboardFen = input.required<string>();
  public readonly capturedPieces = input.required<string>()
  public readonly winner = input.required<PieceColor | null>();
  public move = output<Move>();

  protected myColor = computed<PieceColor>(() => this.whoIsBlackPlayer() === 'me' ? 'b' : 'w');
  protected pieces = signal<PieceDetails[]>([]);
  protected capturedPiecesByMe = signal<CapturedPieceDetails[]>([]);
  protected capturedPiecesByOpponent = signal<CapturedPieceDetails[]>([]);
  protected draggingPiece = signal<Piece | null>(null);
  protected selectedPiece = signal<Piece | null>(null);
  protected dragX = signal(0);
  protected dragY = signal(0);
  protected hoverSquareRow = signal(0);
  protected hoverSquareCol = signal(0);
  protected isHoverSquareVisible = signal(false);
  protected isMyTurn = signal<boolean | undefined>(undefined);
  protected isPromotionDialogVisible = signal<boolean>(false);
  protected pawnToBePromoted = signal<PieceDetails | null>(null);

  private readonly subsink = new SubSink()
  private readonly chessBoard = viewChild<ElementRef<HTMLDivElement>>('chessBoardRef');
  private startRowCol = signal<{ row: number; col: number } | null>(null);
  private lastOpponentMove = signal<Move | null>(null);
  private isOpponentsMoveSame = computed(() => {
    const opponentsMove = this.opponentsMove();
    const lastOpponentMove = this.lastOpponentMove();
    if (opponentsMove && lastOpponentMove) {
      return lastOpponentMove && JSON.stringify(lastOpponentMove) === JSON.stringify(opponentsMove);
    }

    return false;
  });
  private stateManagerService = inject(StateManagerService);

  constructor() {
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    effect(() => {
      this.initBoard();
    });

    effect(() => {
      const opponentsMove = this.opponentsMove();
      if (opponentsMove && !this.isOpponentsMoveSame()) {
        const targetRow = 7 - opponentsMove.to.row;
        const targetCol = opponentsMove.to.col;
        this.updatePiece(
          targetRow,
          targetCol,
          opponentsMove.piece,
          opponentsMove.moveDetails,
          true
        );
        this.lastOpponentMove.set(opponentsMove);
      }
    });

    this.subsink.sink = this.stateManagerService.myTurn$.subscribe((isMyTurn) => {
      this.isMyTurn.set(isMyTurn);
    });
  }

  public ngOnInit(): void {
    const opponentsColor = this.myColor() === 'b' ? 'w' : 'b';
    this.capturedPiecesByMe.set(getCapturedPiecesOfAColor(opponentsColor, this.capturedPieces()));
    this.capturedPiecesByOpponent.set(getCapturedPiecesOfAColor(this.myColor(), this.capturedPieces()));
  }

  public ngOnDestroy(): void {
    this.subsink.unsubscribeAll();
  }

  protected onBoardClick(event: MouseEvent): void {
    const isMyTurn = this.isMyTurn();
    const board = this.chessBoard();
    const selectedPiece = this.selectedPiece();
    const draggingPiece = this.draggingPiece();
    if (isMyTurn && board) {
      const rect = board.nativeElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const targetCol = Math.min(7, Math.max(0, Math.floor((x / rect.width) * 8)));
      const targetRow = Math.min(7, Math.max(0, Math.floor((y / rect.height) * 8)));

      if (!draggingPiece && !selectedPiece) {
        const piece = this.pieces().find(p => p.row === targetRow && p.col === targetCol);
        if (piece && piece.color === this.myColor()) {
          this.selectedPiece.set({
            id: piece.id,
            row: piece.row,
            col: piece.col,
            hasMoved: piece.hasMoved,
            color: piece.color,
            type: piece.type,
          });
        }
        return;
      }

      if (selectedPiece) {
        const validMove = validateMove(targetRow, targetCol, this.myColor(), this.pieces(), selectedPiece);
        if (validMove.valid) { this.updatePiece(targetRow, targetCol, selectedPiece, validMove, false); }
        this.resetSelectedPiece();
      }
    }
  }

  protected onBoardMouseMove(event: MouseEvent): void {
    const board = this.chessBoard();
    const selectedPiece = this.selectedPiece();
    const draggingPiece = this.draggingPiece();

    if (board && (selectedPiece || draggingPiece)) {
      const rect = board.nativeElement.getBoundingClientRect();
      const isBoardFlipped = this.whoIsBlackPlayer() === 'me';
      const fracX = (event.clientX - rect.left) / rect.width;
      const fracY = (event.clientY - rect.top) / rect.height;

      let col: number, row: number;
      if (isBoardFlipped) {
        row = 7 - Math.floor(fracX * 8);
        col = Math.floor(fracY * 8);
      } else {
        row = Math.floor(fracY * 8);
        col = Math.floor(fracX * 8);
      }

      this.hoverSquareCol.set(Math.min(7, Math.max(0, col)));
      this.hoverSquareRow.set(Math.min(7, Math.max(0, row)));
      this.isHoverSquareVisible.set(true);
    }
  }

  protected onBoardMouseLeave(): void {
    this.isHoverSquareVisible.set(false);
  }

  protected onPieceMouseDown(event: MouseEvent | TouchEvent, piece: PieceDetails) {
    event.preventDefault();
    event.stopPropagation();

    const board = this.chessBoard();
    const isMyTurn = this.isMyTurn();

    if (isMyTurn && piece.color === this.myColor() && board) {
      const grabbedPiece = (event.target as HTMLDivElement);
      grabbedPiece.style.cursor = 'grabbing';

      this.draggingPiece.set({
        id: piece.id,
        row: piece.row,
        col: piece.col,
        color: piece.color,
        type: piece.type,
        hasMoved: piece.hasMoved,
      });
      this.startRowCol.set({ row: piece.row, col: piece.col });
      this.dragX.set(piece.col * 12.5);
      this.dragY.set(piece.row * 12.5);
      window.addEventListener('mousemove', this.onMouseMove);
      window.addEventListener('mouseup', this.onMouseUp);
      window.addEventListener('touchmove', this.onMouseMove, { passive: true });
      window.addEventListener('touchend', this.onMouseUp);
    }
  }

  protected onMouseMove(event: MouseEvent | TouchEvent) {
    const piece = this.draggingPiece();
    const board = this.chessBoard();

    if (piece && board) {
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
      const rect = board.nativeElement.getBoundingClientRect();
      const cursorX = ((clientX - rect.left) / rect.width) * 100;
      const cursorY = ((clientY - rect.top) / rect.height) * 100;
      requestAnimationFrame(() => {
        this.dragX.set(cursorX - 6.25);
        this.dragY.set(cursorY - 6.25);
      });
    }
  }

  protected onMouseUp(event: MouseEvent | TouchEvent) {
    const piece = this.draggingPiece();
    const board = this.chessBoard();
    const isMyTurn = this.isMyTurn();

    if (isMyTurn && piece && board) {
      const grabbedPiece = (event.target as HTMLDivElement);
      grabbedPiece.style.cursor = 'grab';

      const rect = board.nativeElement.getBoundingClientRect();
      const clientX = 'touches' in event ? event.changedTouches[0].clientX : event.clientX;
      const clientY = 'touches' in event ? event.changedTouches[0].clientY : event.clientY;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const targetCol = Math.min(7, Math.max(0, Math.floor((x / rect.width) * 8)));
      const targetRow = Math.min(7, Math.max(0, Math.floor((y / rect.height) * 8)));
      const validMove = validateMove(targetRow, targetCol, this.myColor(), this.pieces(), piece);

      if (validMove.valid) { this.updatePiece(targetRow, targetCol, piece, validMove, false); }

      if (!(targetRow === piece.row && targetCol === piece.col)) {
        this.subsink.sink = timer(0).subscribe(() => this.resetSelectedPiece());
      } else {
        this.draggingPiece.set(null);
      }

      window.removeEventListener('mousemove', this.onMouseMove);
      window.removeEventListener('mouseup', this.onMouseUp);
      window.removeEventListener('touchmove', this.onMouseMove);
      window.removeEventListener('touchend', this.onMouseUp);
    }
  }

  protected handlePromotionPieceSelection(
    pieces: { oldPieceDetails: PieceDetails, promotedPieceDetails: PieceDetails }
  ): void {
    this.pawnToBePromoted.set(null);

    const { oldPieceDetails, promotedPieceDetails } = pieces;
    this.pieces.update((allPieces: PieceDetails[]) => {
      let allOldPieces = [...allPieces];
      const oldPawnIndex = allOldPieces.findIndex((piece: PieceDetails) => oldPieceDetails.id === piece.id);
      const oldPawn = JSON.parse(JSON.stringify(allOldPieces[oldPawnIndex]));
      if (oldPawn) {
        oldPawn.type = promotedPieceDetails.type;
        oldPawn.id = promotedPieceDetails.id;
        oldPawn.image = promotedPieceDetails.image;
        oldPawn.hasMoved = true;
      }

      allOldPieces.splice(oldPawnIndex, 1);
      allOldPieces.push(oldPawn);
      return allOldPieces;
    });
    const oldPiece: Piece = {
      color: oldPieceDetails.color,
      id: oldPieceDetails.id,
      col: oldPieceDetails.col,
      row: oldPieceDetails.row,
      hasMoved: oldPieceDetails.hasMoved,
      type: oldPieceDetails.type
    };
    const promotedPiece: Piece = {
      col: promotedPieceDetails.col,
      color: promotedPieceDetails.color,
      hasMoved: promotedPieceDetails.hasMoved,
      id: promotedPieceDetails.id,
      row: promotedPieceDetails.row,
      type: promotedPieceDetails.type,
    };

    this.move.emit({
      piece: oldPiece,
      moveDetails: { valid: true, promotion: true, promotedPiece },
      to: { row: oldPiece.row, col: oldPiece.col },
    });
  }

  private initBoard(): void {
    const boardOrientation = this.whoIsBlackPlayer() === 'me' ? 'flip' : 'normal';
    const pieces = parseFen(this.chessboardFen(), boardOrientation);

    const arrangedPieces = boardOrientation === 'normal'
        ? [...pieces.w, ...pieces.b]
        : [...pieces.b, ...pieces.w];

    this.pieces.set(arrangedPieces);
    const pawnWaitingForPromotion = arrangedPieces.find(
      (piece: PieceDetails) => piece.color === this.myColor() && piece.type === 'pawn' && piece.row === 0
    );
    if (pawnWaitingForPromotion) {
      this.pawnToBePromoted.set(pawnWaitingForPromotion);
      this.isPromotionDialogVisible.set(true);
    }
  }

  private updatePiece(
    targetRow: number,
    targetCol: number,
    piece: Piece,
    moveDetails: MoveDetails,
    isOpponentsMove: boolean
  ): void {
    const targetPiece = moveDetails.targetPiece;
    // Setting row in the id as 7 - targetRow because, otherwise the id won't stay consistent on opponent's side
    let newPieceId: string;
    if (isOpponentsMove) {
      newPieceId = `${piece.color}-${piece.type}-${piece.color === 'b' ? targetRow : 7 - targetRow}-${targetCol}`;
    } else {
      newPieceId = `${piece.color}-${piece.type}-${piece.color === 'b' ? 7 - targetRow : targetRow}-${targetCol}`;
    }

    this.pieces.update((allPieces: PieceDetails[]) => {
      let allOldPieces: PieceDetails[] = JSON.parse(JSON.stringify(allPieces));
      if (moveDetails.castling) {
        const rookCol = moveDetails.castling === 'kingside' ? 7 : 0;
        const newRookCol = moveDetails.castling === 'kingside' ? 5 : 3;

        allOldPieces = allOldPieces.map(p => {
          if ('rook' === p.type && p.color === piece.color && p.row === targetRow && p.col === rookCol) {
            return { ...p, col: newRookCol, hasMoved: true };
          }
          return p;
        });
      } else if (moveDetails.enPassant) {
        const capturedPawn = moveDetails.targetPiece;
        if (capturedPawn) { allOldPieces = allOldPieces.filter(p => p.id !== capturedPawn.id); }
        allOldPieces = allOldPieces.map(p =>
          p.id === piece.id ? { ...p, row: targetRow, col: targetCol, hasMoved: true } : p
        );
      } else if (moveDetails.promotion) {
        const pawnPieceDetails: PieceDetails = {
          ...piece,
          id: newPieceId,
          image: `/${piece.color}p.png`,
          row: targetRow,
          col: targetCol,
          hasMoved: true
        };
        if (moveDetails.promotedPiece) {
          const promotedPiece: Piece = JSON.parse(JSON.stringify(moveDetails.promotedPiece));
          const oldPawn = allOldPieces.find((p: PieceDetails) => p.id === piece.id);
          if (oldPawn) {
            oldPawn.type = promotedPiece.type;
            oldPawn.id = promotedPiece.id;
            oldPawn.image = `./${promotedPiece.color}${promotedPiece.type.charAt(0)}.png`;
          }
        } else {
          this.pawnToBePromoted.set(pawnPieceDetails);
          this.isPromotionDialogVisible.set(true);
        }
      }

      if (targetPiece) {
        allOldPieces = allOldPieces.filter(p => p.id !== targetPiece.id);
        if (targetPiece.type === 'king') {

        }
      }

      return allOldPieces.map(p => {
        if (p.id === piece.id) {
          const updatedPiece = { ...p, row: targetRow, col: targetCol, hasMoved: true }
          if (p.type === 'pawn') {
            if (moveDetails.situation === 'doubleStep') {
              updatedPiece.enPassantAvailable = true;
            } else {
              delete updatedPiece.enPassantAvailable;
            }
          }
          updatedPiece.id = newPieceId;
          return updatedPiece;
        }
        return p;
      });
    });

    if (targetPiece) {
      if (targetPiece.color !== this.myColor()) {
        this.capturedPiecesByMe.update((capturedPieces) => {
          const pieces = [...capturedPieces];
          return pieces.map((piece) => piece.type === targetPiece.type ? { ...piece, count: piece.count + 1 } : piece);
        });
      } else {
        this.capturedPiecesByOpponent.update((capturedPieces) => {
          const pieces = [...capturedPieces];
          return pieces.map((piece) => piece.type === targetPiece.type ? { ...piece, count: piece.count + 1 } : piece);
        });
      }
    }

    if (piece.color === this.myColor()) {
      if (piece.type === 'pawn' && moveDetails.situation === 'doubleStep') {
        piece.enPassantAvailable = true;
      }
      this.move.emit({
        moveDetails,
        piece,
        to: { row: targetRow, col: targetCol },
      });
    }
  }

  private resetSelectedPiece(): void {
    this.selectedPiece.set(null);
    this.draggingPiece.set(null);
    this.isHoverSquareVisible.set(false);
    this.dragX.set(0);
    this.dragY.set(0);
  }
}
