// my-chess-logo-icon.component.ts
import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChessPawn } from '@fortawesome/free-solid-svg-icons';
import { IconSize } from '@shared/@interface';

@Component({
  selector: 'MyChessLogoIcon',
  standalone: true,
  imports: [ FontAwesomeModule, CommonModule ],
  template: `
    <span [ngClass]="['relative', sizeClass]">
      <fa-icon [icon]="pawnChessIcon" class="absolute scale-80" [ngClass]="iconPositions[0]" />
      <fa-icon [icon]="pawnChessIcon" class="absolute" [ngClass]="iconPositions[1]" />
      <fa-icon [icon]="pawnChessIcon" class="absolute scale-80" [ngClass]="iconPositions[2]" />
    </span>
  `,
})
export class MyChessLogoIconComponent {
  public size = input<IconSize>('md');
  public positions = input<[string, string, string]>();

  protected pawnChessIcon = faChessPawn;

  protected get sizeClass(): string {
    return {
      sm: 'text-3xl',
      md: 'text-5xl',
      xl: 'text-6xl',
    }[this.size()];
  }

  protected get iconPositions(): [string, string, string] {
    const positions = this.positions();
    if (positions) {
      return positions;
    }
    const defaultPositions: Record<IconSize, [string, string, string]> = {
      sm: ['-left-6', '-left-2', 'left-2'],
      md: ['-left-9', '-left-3', 'left-3'],
      xl: ['-left-11', '-left-4', 'left-3'],
    };

    return defaultPositions[this.size()];;
  }
}
