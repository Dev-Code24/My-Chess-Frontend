import { Component, computed, effect, ElementRef, input, signal, viewChild } from '@angular/core';
import { Piece, PieceColor, Move } from './../../@interfaces';
import { AvatarComponent } from "@shared/components/avatar/avatar.component";
import { UserDetails } from '@shared/@interface';
import { validateMove, getTargetPiece } from '../../@utils';

@Component({
  selector: 'app-chessboard',
  imports: [AvatarComponent],
  templateUrl: './chessboard.component.html',
  styleUrl: './chessboard.component.scss'
})
export class ChessboardComponent {
  public opponent = input.required<UserDetails>();
  public me = input.required<UserDetails>();
  public whoIsBlackPlayer = input.required<'me' | 'opponent'>();

  protected myColor = computed<PieceColor>(() => this.whoIsBlackPlayer() === 'me' ? 'b' : 'w');
  protected pieces = signal<Piece[]>([]);
  protected draggingPiece = signal<Piece | null>(null);
  protected selectedPiece = signal<Piece | null>(null);
  protected dragX = signal(0);
  protected dragY = signal(0);
  protected hoverSquareRow = signal(0);
  protected hoverSquareCol = signal(0);
  protected isHoverSquareVisible = signal(false);

  private chessBoard = viewChild<ElementRef<HTMLDivElement>>('chessBoardRef');
  private startRowCol = signal<{ row: number; col: number } | null>(null);

  constructor() {
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    effect(() => {
      this.initBoard();
    });
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
        if (piece && piece.color === this.myColor()) { this.selectedPiece.set(piece); }
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
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      this.hoverSquareCol.set(Math.min(7, Math.max(0, Math.floor((x / rect.width) * 8))));
      this.hoverSquareRow.set(Math.min(7, Math.max(0, Math.floor((y / rect.height) * 8))));
      this.isHoverSquareVisible.set(true);
    }
  }

  protected onBoardMouseLeave(): void {
    this.isHoverSquareVisible.set(false);
  }

  protected onPieceMouseDown(event: MouseEvent | TouchEvent, piece: Piece) {
    event.preventDefault();
    event.stopPropagation();
    const board = this.chessBoard();

    if ((piece.color === this.myColor() || 1) && board) {
      const grabbedPiece = (event.target as HTMLDivElement);
      grabbedPiece.style.cursor = 'grabbing';

      this.draggingPiece.set(piece);
      this.startRowCol.set({ row: piece.row, col: piece.col });
      this.dragX.set(piece.col * 12.5);
      this.dragY.set(piece.row * 12.5);
      window.addEventListener('mousemove', this.onMouseMove);
      window.addEventListener('mouseup', this.onMouseUp);
      window.addEventListener('touchmove', this.onMouseMove, { passive: false });
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
      console.log(validMove);

      if (!(targetRow === piece.row && targetCol === piece.col)) {
        setTimeout(() => this.resetSelectedPiece(), 0);
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

  private addPieces(color: PieceColor, backRow: number, pawnRow: number, backRowPieces: string[]): void {
    const pieces: Piece[] = [];
    backRowPieces.forEach((type, col) => {
      pieces.push({
        id: `${color}-${type}-${col}`,
        type: type as Piece['type'],
        row: backRow,
        image: `/${color}${type === 'knight' ? 'n' : type.charAt(0)}.png`,
        color,
        col,
      });
    });

    for (let col = 0; col < 8; col++) {
      pieces.push({
        id: `${color}-pawn-${col}`,
        type: 'pawn',
        color,
        row: pawnRow,
        col,
        image: `/${color}p.png`
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
    this.pieces.update(arr => {
      let newArr = [...arr];
      if (move.castling) {
        const rookCol = move.castling === 'kingside' ? 7 : 0;
        const newRookCol = move.castling === 'kingside' ? 5 : 3;
        newArr = newArr.map(p => {
          if (p.type === 'rook' && p.row === piece.row && p.col === rookCol) {
            return { ...p, col: newRookCol, hasMoved: true };
          }
          return p;
        });
      }
      if (targetPiece) { newArr = newArr.filter(p => p.id !== targetPiece!.id); }
      return newArr.map(p => p.id === piece.id ? { ...p, row: targetRow, col: targetCol, hasMoved: true } : p);
    });
  }

  private resetSelectedPiece(): void {
    this.selectedPiece.set(null);
    this.draggingPiece.set(null);
    this.isHoverSquareVisible.set(false);
    this.dragX.set(0);
    this.dragY.set(0);
  }
}
