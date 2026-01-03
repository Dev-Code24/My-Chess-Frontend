import { Component, inject, OnInit, signal } from '@angular/core';
import { EasterEggService } from '../service/easter-egg.service';
import { SubSink } from '@shared/@utils';
import { ApiErrorResponse } from '@shared/@interface';
import { MyChessMessageService } from '@shared/services';

@Component({
  selector: 'app-easter-egg',
  imports: [],
  templateUrl: './easter-egg.component.html',
})
export class EasterEggComponent implements OnInit {
  protected message = signal<string | undefined>(undefined);

  private readonly subsink = new SubSink();
  private readonly easterEggService = inject(EasterEggService);
  private readonly messageService = inject(MyChessMessageService);

  public ngOnInit(): void {
    this.getHelloWorld();
  }

  private getHelloWorld(): void {
    this.subsink.sink = this.easterEggService.getHelloWorld().subscribe({
      next: (response) => {
        this.message.set(response.data);
      },
      error: (err: ApiErrorResponse) => {
        console.log("error", err);
        if (err && err.data) {
          this.messageService.showError(err.message)
        } else {
          this.messageService.showError('Something went wrong.');
        }
      }
    });
  }
}
