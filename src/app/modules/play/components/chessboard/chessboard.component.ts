import { Component, computed, effect, ElementRef, input, OnDestroy, output, signal, viewChild } from '@angular/core';
import { Piece, PieceColor, Move, PieceMoved, PieceDetails, CapturedPieceDetails, PieceType } from './../../@interfaces';
import { AvatarComponent } from "@shared/components/avatar/avatar.component";
import { UserDetails } from '@shared/@interface';
import { validateMove, getTargetPiece, getDefaultCapturedPieces } from '../../@utils';
import { SubSink } from '@shared/@utils';
import { timer } from 'rxjs';

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
  public readonly opponentsMove = input.required<PieceMoved | null>();
  public pieceMoved = output<PieceMoved>();

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

  private readonly subsink = new SubSink()
  private chessBoard = viewChild<ElementRef<HTMLDivElement>>('chessBoardRef');
  private startRowCol = signal<{ row: number; col: number } | null>(null);
  private lastOpponentMove = signal<PieceMoved | null>(null);
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

  constructor() {
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    effect(() => {
      this.initBoard();
    });

    effect(() => {
      const opponentsMove = this.opponentsMove();
      if (opponentsMove && !this.isOpponentsMoveSame()) {
        this.updatePiece(opponentsMove.to.row, opponentsMove.to.col, opponentsMove.piece, opponentsMove.move);
        this.lastOpponentMove.set(opponentsMove);
        console.log('updated opponent\'s piece,');
      }
    });
  }

  public ngOnInit(): void {
    const opponentsColor = this.myColor() === 'b' ? 'w' : 'b';
    this.capturedPiecesByMe.set(getDefaultCapturedPieces(opponentsColor));
    this.capturedPiecesByOpponent.set(getDefaultCapturedPieces(this.myColor()));
  }

  public ngOnDestroy(): void {
    this.subsink.unsubscribeAll();
  }

  protected onBoardClick(event: MouseEvent): void {
    const board = this.chessBoard();
    const selectedPiece = this.selectedPiece();
    const draggingPiece = this.draggingPiece();
    if (board) {
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

    if (piece.color === this.myColor() && board) {
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

    if (piece && board) {
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
    const whiteBackRow = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    const blackBackRow = [...whiteBackRow];
    const boardOrientation = this.whoIsBlackPlayer() === 'me' ? 'flip' : 'normal';

    if (boardOrientation === 'normal') {
      this.addPieces('w', 7, 6, whiteBackRow);
      this.addPieces('b', 0, 1, blackBackRow);
    } else {
      this.addPieces('b', 7, 6, blackBackRow);
      this.addPieces('w', 0, 1, whiteBackRow);
    }
  }

  private addPieces(
    color: PieceColor,
    backRow: number,
    pawnRow: number,
    backRowPieces: string[]
  ): void {
    const pieces: PieceDetails[] = [];
    backRowPieces.forEach((type, col) => {
      pieces.push({
        id: `${color}-${type}-${col + 1}`,
        type: type as Piece['type'],
        row: backRow,
        image: `/${color}${type === 'knight' ? 'n' : type.charAt(0)}.png`,
        color,
        col,
        hasMoved: false,
      });
    });

    for (let col = 0; col < 8; col++) {
      pieces.push({
        id: `${color}-pawn-${col}`,
        type: 'pawn',
        color,
        row: pawnRow,
        col,
        image: `/${color}p.png`,
        enPassantAvailable: true,
        hasMoved: false,
      });
    }
    this.pieces.update((array) => [...array, ...pieces]);
  }

  private updatePiece(
    targetRow: number,
    targetCol: number,
    piece: Piece,
    move: Move
  ): void {
    const targetPiece = getTargetPiece(targetRow, targetCol, this.pieces(), piece);
    this.pieces.update(allPieces => {
      let allOldPieces = [...allPieces];
      if (move.castling) {
        const rookCol = move.castling === 'kingside' ? 7 : 0;
        const newRookCol = move.castling === 'kingside' ? 5 : 3;

        allOldPieces = allOldPieces.map(p => {
          if (p.type === 'rook' && p.row === piece.row && p.col === rookCol) {
            return { ...p, col: newRookCol, hasMoved: true };
          }
          return p;
        });
      }
      if (move.enPassant) {
        const capturedPawn = move.capture;
        if (capturedPawn) { allOldPieces = allOldPieces.filter(p => p.id !== capturedPawn.id); }
        allOldPieces = allOldPieces.map(p =>
          p.id === piece.id ? { ...p, row: targetRow, col: targetCol, hasMoved: true } : p
        );
      }

      if (targetPiece) { allOldPieces = allOldPieces.filter(p => p.id !== targetPiece!.id); }
      return allOldPieces.map(p => p.id === piece.id ? { ...p, row: targetRow, col: targetCol, hasMoved: true } : p);
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
      this.pieceMoved.emit({
        targetPiece: targetPiece ?? null,
        piece,
        to: { row: targetRow, col: targetCol },
        move
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
