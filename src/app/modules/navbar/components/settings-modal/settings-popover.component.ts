import { Router } from '@angular/router';
import { Component, inject, input, OnDestroy } from '@angular/core';
import { IconDefinition, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NavbarLabels } from '../../@utils';
import { PopoverComponent } from '@shared/components';
import { ButtonComponent } from '@shared/components/button/button';
import { NavbarConnectBackendService } from 'modules/navbar/service';
import { MyChessMessageService, PopoverService, StateManagerService } from '@shared/services';
import { ERROR_MESSAGES, MESSAGES, SubSink } from '@shared/@utils';

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
  private readonly popooverService = inject(PopoverService);
  private readonly messageService = inject(MyChessMessageService);
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
    this.subsink.sink = this.connectBackendService.logout().subscribe({
      next: () => {
        this.stateManagerService.resetUser();
        this.messageService.showSuccess(MESSAGES.LOGGED_OUT);
        this.router.navigate(['auth'], { queryParams: { login: true } });
      },
      error: () => this.messageService.showError(ERROR_MESSAGES.COULD_NOT_LOG_OUT)
    });
  }
}
