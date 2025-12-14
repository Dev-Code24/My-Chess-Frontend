import { Component, inject, input } from '@angular/core';

import { MyChessLogoComponent, AvatarComponent } from "@shared/components";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowRightToBracket } from '@fortawesome/free-solid-svg-icons';
import { UserInterface } from '@shared/@interface';
import { SettingsPopoverComponent } from "../settings-modal/settings-popover.component";
import { PopoverService } from '@shared/services';

@Component({
  selector: 'mc-navbar',
  imports: [FontAwesomeModule, MyChessLogoComponent, AvatarComponent, SettingsPopoverComponent],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  public user = input.required<UserInterface>();

  protected loginIcon = faArrowRightToBracket;
  protected popoverId = 'settings-popover';

  private readonly popoverService = inject(PopoverService);

  protected openSettings(anchor: HTMLElement): void {
    this.popoverService.open(this.popoverId, anchor);
  }
}
