import { Router } from '@angular/router';
import { Component, inject, input, OnDestroy } from '@angular/core';
import { IconDefinition, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NavbarLabels } from '../../@utils';
import { PopoverComponent } from '@shared/components';
import { ButtonComponent } from '@shared/components/button/button';
import { NavbarConnectBackendService } from 'modules/navbar/service';
import { MyChessMessageService, PopoverService, StateManagerService } from '@shared/services';
import { SubSink } from '@shared/@utils';
import { UserInterface } from '@shared/@interface';

@Component({
  selector: 'app-settings-popover',
  imports: [FontAwesomeModule, PopoverComponent, ButtonComponent],
  templateUrl: './settings-popover.component.html',
  styleUrl: './settings-popover.component.scss',
})
export class SettingsPopoverComponent implements OnDestroy {
  public popoverId = input.required<string>();
  protected settingOptionsLabel: { title: string; icon: IconDefinition }[] = [
    {
      title: NavbarLabels.LOG_OUT,
      icon: faArrowRightFromBracket,
    },
  ];

  private readonly subsink = new SubSink();
  private readonly router = inject(Router);
  private readonly messageService = inject(MyChessMessageService);
  private readonly popooverService = inject(PopoverService);
  private readonly stateManagerService = inject(StateManagerService);
  private readonly connectBackendService = inject(NavbarConnectBackendService);

  public ngOnDestroy(): void {
    this.subsink.unsubscribeAll();
  }

  protected handleClick(optionLabel: string): void {
    this.popooverService.close(this.popoverId());
    if (optionLabel === NavbarLabels.LOG_OUT) {
      this.handleLogout();
    }
  }

  private handleLogout(): void {
    const user: UserInterface = this.stateManagerService.getUser();
    if (user.isLoggedIn) {
      const { email } = user.details;
      const logoutApiPayload = { email };

      this.subsink.sink = this.connectBackendService.logout(logoutApiPayload).subscribe({
        next: () => {
          this.stateManagerService.resetUser();
          this.router.navigate(['auth'], { queryParams: { login: true } });
        },
        error: () => this.messageService.showError('Could not logout. Try Again.')
      });
    }
  }
}
