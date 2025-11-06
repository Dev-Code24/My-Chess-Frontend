import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DialogComponent } from "@shared/components/dialog/dialog.component";
import { PieceColor } from 'modules/play/@interfaces';

@Component({
  selector: 'app-game-over-dialog',
  imports: [DialogComponent],
  templateUrl: './game-over-dialog.component.html',
})
export class GameOverDialogComponent {
  public readonly winner = input.required<PieceColor>();
  public readonly myColor = input.required<PieceColor>();
  protected isVisible = signal<boolean>(true);
  protected dialogTitle = computed<string>(() => `Game Finished! ${this.winner() === this.myColor() ? 'You' : this.winner().toUpperCase()} won.`);

  private router = inject(Router);

  protected redirectToHome(): void {
    this.router.navigate(['/home']);
  }
}
