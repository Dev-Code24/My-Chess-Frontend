import { Component } from '@angular/core';

import { LinkButtonComponent } from "@shared/components/button/link-button/link-button.component";
import { COLORS } from '@shared/@utils/constants';
import { faDoorOpen, faPlayCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-home',
  imports: [ LinkButtonComponent ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  protected playIcon = faPlayCircle;
  protected joinRoomIcon = faDoorOpen;
  protected BG = COLORS.bg;
}
