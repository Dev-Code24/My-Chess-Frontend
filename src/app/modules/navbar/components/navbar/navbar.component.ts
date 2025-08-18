import { Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { MyChessLogoComponent, AvatarComponent } from "@shared/components";

import { faArrowRightToBracket } from '@fortawesome/free-solid-svg-icons';
import { UserInterface } from '@shared/@interface';


@Component({
  selector: 'mc-navbar',
  imports: [ FontAwesomeModule, MyChessLogoComponent, AvatarComponent ],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  public user = input.required<UserInterface>();

  protected loginIcon = faArrowRightToBracket;
}
