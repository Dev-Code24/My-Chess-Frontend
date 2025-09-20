import { Component, computed, effect, ElementRef, input, signal, viewChild } from '@angular/core';
import { Piece, PieceColor } from './../../@interfaces/index';
import { AvatarComponent } from "@shared/components/avatar/avatar.component";
import { UserDetails } from '@shared/@interface';
import { isValidMove } from '../../@utils';

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

  protected pieces = signal<Piece[]>([]);
  protected dragOffset = signal<{ x: number, y: number }>({ x: 0, y: 0 });
  protected draggingPiece = signal<Piece | null>(null);
  protected dragX = signal(0);
  protected dragY = signal(0);

  private startRowCol = signal<{ row: number; col: number } | null>(null);
  private chessBoardRef = viewChild<ElementRef<HTMLDivElement>>('chessBoard');
  private myColor = computed<PieceColor>(() => {
    return this.whoIsBlackPlayer() === 'me' ? 'b' : 'w';
  });

  constructor() {
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    effect(() => {
      this.initBoard();
    });
  }

  protected onPieceMouseDown(event: MouseEvent | TouchEvent, piece: Piece) {
    event.preventDefault();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    const board = this.chessBoardRef();
    if (board) {
      const rect = board.nativeElement.getBoundingClientRect();

      this.draggingPiece.set(piece);
      this.startRowCol.set({ row: piece.row, col: piece.col });
      this.dragX.set(piece.col * 12.5);
      this.dragY.set(piece.row * 12.5);
      this.dragOffset.set({
        x: clientX - rect.left - (piece.col + 0.5) * (rect.width / 8),
        y: clientY - rect.top - (piece.row + 0.5) * (rect.height / 8),
      });
      window.addEventListener('mousemove', this.onMouseMove);
      window.addEventListener('mouseup', this.onMouseUp);
      window.addEventListener('touchmove', this.onMouseMove, { passive: false });
      window.addEventListener('touchend', this.onMouseUp);
    }
  }

  protected onMouseMove(event: MouseEvent | TouchEvent) {
    const piece = this.draggingPiece();
    if (!piece) { return; }

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    const board = this.chessBoardRef();

    if (board) {
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
    if (!piece) return;

    const board = this.chessBoardRef();
    if (board) {
      const rect = board.nativeElement.getBoundingClientRect();

      const clientX = 'touches' in event ? event.changedTouches[0].clientX : event.clientX;
      const clientY = 'touches' in event ? event.changedTouches[0].clientY : event.clientY;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const targetCol = Math.min(7, Math.max(0, Math.floor((x / rect.width) * 8)));
      const targetRow = Math.min(7, Math.max(0, Math.floor((y / rect.height) * 8)));

      let targetPiece: Piece | undefined | null = this.pieces().find(p => p.col === targetCol && p.row === targetRow);
      if (targetPiece) { targetPiece = targetPiece.color === piece.color ? null : targetPiece; }

      const isValid = isValidMove(piece, targetPiece, this.myColor(), targetRow, targetCol);
      if (isValid) {
        this.pieces.update(arr => {
          let newArr = [...arr];
          if (targetPiece) { newArr = newArr.filter(p => p.id !== targetPiece!.id); }
          return newArr.map(p => p.id === piece.id ? { ...p, row: targetRow, col: targetCol } : p);
        });
      } else {
        this.pieces.update(arr =>
          arr.map(p => p.id === piece.id
            ? { ...p, row: this.startRowCol()!.row, col: this.startRowCol()!.col }
            : p)
        );
      }
      this.draggingPiece.set(null);
      this.dragX.set(0);
      this.dragY.set(0);

      window.removeEventListener('mousemove', this.onMouseMove);
      window.removeEventListener('mouseup', this.onMouseUp);
      window.removeEventListener('touchmove', this.onMouseMove);
      window.removeEventListener('touchend', this.onMouseUp);
    }
  }


  private initBoard() {
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

  private addPieces(color: PieceColor, backRow: number, pawnRow: number, backRowPieces: string[]) {
    const pieces: Piece[] = [];
    backRowPieces.forEach((type, col) => {
      pieces.push({
        id: `${color}-${type}-${col}`,
        type: type as Piece['type'],
        color,
        row: backRow,
        col,
        image: `/${color}${type === 'knight' ? 'n' : type.charAt(0)}.png`
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
}
