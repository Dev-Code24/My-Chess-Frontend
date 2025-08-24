import { Component, inject } from '@angular/core';

import { LinkButtonComponent } from "@shared/components/button/link-button/link-button.component";
import { COLORS } from '@shared/@utils/constants';
import { faDoorOpen, faPlayCircle } from '@fortawesome/free-solid-svg-icons';
import { Router, UrlTree } from '@angular/router';

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
  protected joinRoomUrl!: UrlTree;
  protected playUrl!: UrlTree;

  private router = inject(Router);

  public ngOnInit(): void {
    this.joinRoomUrl = this.router.createUrlTree(['home'], { queryParams: { join: true, }, });
    this.playUrl = this.router.createUrlTree(['home'], { queryParams: { createRoom: true, }, })
  }
}
