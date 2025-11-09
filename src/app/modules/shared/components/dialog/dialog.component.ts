import {
  ChangeDetectionStrategy, Component, computed, effect, ElementRef, input, model, output,
  viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogConfig } from '@shared/@interface/ui';
import { COLORS } from '@shared/@utils/constants';

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
    top: '50%',
    left: '50%',
    closable: true,
    backdrop: true,
  });

  public isVisible = model.required<boolean>();
  public onDialogClose = output();

  protected BG = COLORS.bg;
  protected topAndLeft = computed(() => {
    const pattern = /[a-zA-Z%]+$/;

    const width = this.config().width!;
    const widthUnit = width.match(pattern)?.[0] || 'px';
    const halfWidth = parseFloat(width) / 2;

    const height = this.config().height!;
    const heightUnit = height.match(pattern)?.[0] || 'px';
    const halfHeight = parseFloat(height) / 2;

    return {
      top: `calc(${this.config().top} - ${halfHeight}${heightUnit})`,
      left: `calc(${this.config().left} - ${halfWidth}${widthUnit})`
    };
  });

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
