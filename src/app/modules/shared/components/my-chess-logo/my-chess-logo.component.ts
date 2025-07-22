import { Component } from '@angular/core';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChessRook } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'MyChessLogo',
  imports: [ FontAwesomeModule ],
  template: `
      <span class="relative pl-[2.5rem] text-sky-400">
      <fa-icon class="absolute left-1 z-0" [icon]="chessIcon" />
      <span class="relative z-0 pl-4">My Chess</span>
    </span>
  `
})
export class MyChessLogoComponent {
  protected chessIcon = faChessRook;
}
