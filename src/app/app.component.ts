import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserInterface } from '@shared/@interface';
import { DEFAULT_USER_DATA } from '@shared/@utils/constants';
import { SubSink } from '@shared/@utils/Subsink';
import { StateManagerService } from '@shared/services/state-manager.service';
import { NavbarComponent } from "modules/navbar/components/navbar/navbar.component";

@Component({
  selector: 'app-root',
  imports: [ RouterOutlet, NavbarComponent ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  public readonly title = 'my-chess-frontend';

  protected user = signal<UserInterface>(DEFAULT_USER_DATA);

  private readonly stateManagerService = inject(StateManagerService);
  private readonly subsink = new SubSink();

  public ngOnInit(): void {
    this.subsink.sink = this.stateManagerService.user$.subscribe({
      next: (value) => this.user.set(value),
    });
  }

  public ngOnDestroy(): void {
    this.subsink.unsubscribeAll();
  }
}
