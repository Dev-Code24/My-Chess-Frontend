import {
  ChangeDetectionStrategy, Component, computed, effect, ElementRef, input, model, output,
  viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogConfig } from '@shared/@interface';
import { COLORS } from '@shared/@utils';

@Component({
  selector: 'mc-dialog',
  imports: [CommonModule],
  templateUrl: './dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent {
  public htmlDialogElementRef = viewChild<ElementRef<HTMLElement>>('dialogRef');
  public config = input<DialogConfig>({
    width: '300px',
    height: '200px',
    top: '0%',
    left: '0%',
    closable: true,
    backdrop: true,
  });

  public isVisible = model.required<boolean>();
  public onDialogClose = output();

  protected BG = COLORS.bg;

  constructor() {
    effect(() => {
      const modal = this.htmlDialogElementRef();
      if (this.isVisible() && modal) {
        modal.nativeElement.focus();
      }
    });
  }

  public show() {
    this.isVisible.set(true);
  }

  public close() {
    this.isVisible.set(false);
    this.onDialogClose.emit();
  }

  public toggle() {
    this.isVisible.set(!this.isVisible());
  }

  protected onBackdropClick(event: MouseEvent) {
    if (!this.config().backdrop) { return; }

    const current = event.currentTarget as HTMLElement;
    if (current && !current.dataset['backdrop']) {
      this.close();
    }
  }

  protected onEscapeKey(event: Event) {
  if (!this.config().closable) { return; }
    event.preventDefault();
    this.close();
  }
}
