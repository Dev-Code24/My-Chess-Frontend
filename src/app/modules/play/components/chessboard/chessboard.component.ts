import { Component, computed, effect, ElementRef, inject, input, OnDestroy, output, signal, viewChild } from '@angular/core';
import { Piece, PieceColor, MoveDetails, Move, PieceDetails, CapturedPieceDetails } from './../../@interfaces';
import { AvatarComponent } from "@shared/components/avatar/avatar.component";
import { UserDetails } from '@shared/@interface';
import { validateMove, getTargetPiece, getCapturedPiecesOfAColor, parseFen } from '../../@utils';
import { SubSink } from '@shared/@utils';
import { timer } from 'rxjs';
import { StateManagerService } from '@shared/services';

@Component({
  selector: 'app-chessboard',
  imports: [AvatarComponent],
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

  private readonly subsink = new SubSink()
  private readonly chessBoard = viewChild<ElementRef<HTMLDivElement>>('chessBoardRef');
  private startRowCol = signal<{ row: number; col: number } | null>(null);
  private lastOpponentMove = signal<Move | null>(null);
  private isOpponentsMoveSame = computed(() => {
    const opponentsMove = this.opponentsMove();
    const lastOpponentMove = this.lastOpponentMove();
    if (opponentsMove && lastOpponentMove) {
      return lastOpponentMove &&
        lastOpponentMove.to.row === opponentsMove.to.row &&
        lastOpponentMove.to.col === opponentsMove.to.col &&
        lastOpponentMove.piece.id === opponentsMove.piece.id;
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
        this.updatePiece(7 - opponentsMove.to.row, opponentsMove.to.col, opponentsMove.piece, opponentsMove.moveDetails);
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
        if (validMove.valid) { this.updatePiece(targetRow, targetCol, selectedPiece, validMove); }
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

      if (validMove.valid) { this.updatePiece(targetRow, targetCol, piece, validMove); }

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

  private initBoard(): void {
    const boardOrientation = this.whoIsBlackPlayer() === 'me' ? 'flip' : 'normal';
    const pieces = parseFen(this.chessboardFen(), boardOrientation);

    if (boardOrientation === 'normal') {
      this.pieces.set([...pieces.w, ...pieces.b]);
    } else {
      this.pieces.set([...pieces.b, ...pieces.w]);
    }
  }

  private updatePiece(
    targetRow: number,
    targetCol: number,
    piece: Piece,
    moveDetails: MoveDetails
  ): void {
    const targetPiece = moveDetails.capture;
    this.pieces.update(allPieces => {
      let allOldPieces = [...allPieces];
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
        const capturedPawn = moveDetails.capture;
        if (capturedPawn) { allOldPieces = allOldPieces.filter(p => p.id !== capturedPawn.id); }
        allOldPieces = allOldPieces.map(p =>
          p.id === piece.id ? { ...p, row: targetRow, col: targetCol, hasMoved: true } : p
        );
      }

      if (targetPiece) { allOldPieces = allOldPieces.filter(p => p.id !== targetPiece.id); }

      return allOldPieces.map(p => {
        if (p.id === piece.id) {
          const a = { ...p, row: targetRow, col: targetCol, hasMoved: true }
          if (p.type === 'pawn') {
            if (moveDetails.situation === 'doubleStep') { a.enPassantAvailable = true; }
            else {
              a.enPassantAvailable = false;
              delete a.enPassantAvailable;
            }
          }
          return a;
        } else { return p; }
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
        targetPiece: targetPiece ?? null,
        piece,
        to: { row: targetRow, col: targetCol },
        moveDetails
      });

      console.log({
        targetPiece: targetPiece ?? null,
        piece,
        to: { row: targetRow, col: targetCol },
        moveDetails
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
