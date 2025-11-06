import { Component, input, model, output, signal } from '@angular/core';
import { PieceColor, PieceDetails, PieceType } from '../../@interfaces';
import { DialogComponent } from "@shared/components/dialog/dialog.component";

@Component({
  selector: 'app-promotion-dialog',
  imports: [DialogComponent],
  templateUrl: './promotion-dialog.component.html',
  styleUrl: './promotion-dialog.component.scss'
})
export class PromotionDialogComponent {
  // TODO: Take move as input instead of pawn to be promoted
  public readonly pawn = input.required<PieceDetails>();
  public visible = model.required<boolean>();
  public onPromote = output<{ oldPieceDetails: PieceDetails, promotedPieceDetails: PieceDetails }>();

  protected selectedType = signal<PieceType>('queen');
  protected readonly promotionOptions: PieceType[] = [
    'queen', 'rook', 'bishop', 'knight'
  ];

  public selectPiece(type: PieceType): void {
    this.selectedType.set(type);
  }

  public confirm(): void {
    const selectedType = this.selectedType();
    const pawn = this.pawn();
    if (!selectedType || !pawn) { return; }

    const promotedPieceDetails: PieceDetails = {
      ...pawn,
      type: selectedType,
      id: `${pawn.color}-${selectedType}-${pawn.color === 'b' ? 7 - pawn.row : pawn.row}-${pawn.col}`,
      image: `/${pawn.color}${selectedType === 'knight' ? 'n' : selectedType[0]}.png`,
      hasMoved: true,
    };

    this.onPromote.emit({oldPieceDetails: pawn, promotedPieceDetails});
    this.close();
  }

  public close(): void {
    this.visible.set(false);
  }

  public pieceImage(color: PieceColor, type: PieceType): string {
    return `/${color}${type === 'knight' ? 'n' : type[0]}.png`;
  }
}
