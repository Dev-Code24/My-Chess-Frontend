import {
  ChangeDetectionStrategy, Component, computed, effect, ElementRef, input, model, output,
  viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogConfig } from '@shared/@interface/ui';
import { COLORS } from '@shared/@utils/constants';

@Component({
  selector: 'mc-dialog',
  imports: [ CommonModule ],
  templateUrl: './dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent {
  public htmlDialogElementRef = viewChild<ElementRef<HTMLDialogElement>>('dialogRef');
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
  protected topAndLeft = computed<{ top: string, left: string }>(() => {
    const pattern = /[a-zA-Z%]+$/;

    const width = this.config().width!;
    const widthUnit = width.match(pattern)?.[0] || 'px';
    const numWidth = parseFloat(width);
    const halfWidth = numWidth / 2;

    const height = this.config().height!;
    const heightUnit = height.match(pattern)?.[0] || 'px';
    const numHeight = parseFloat(height);
    const halfHeight = numHeight / 2;
    const top = `calc(${this.config().top} - ${halfHeight}${heightUnit})`;
    const left = `calc(${this.config().left} - ${halfWidth}${widthUnit})`;

    return { top, left };
  });

  constructor() {
    effect(() => {
      const elementRef = this.htmlDialogElementRef();
      const dialogElement = elementRef && elementRef.nativeElement;
      if (dialogElement) {
        if (this.isVisible()) {
          dialogElement.showModal();
        } else {
          dialogElement.close();
        }
      }
    });
  }

  public ngOnDestroy() {
    const elementRef = this.htmlDialogElementRef();
    if (elementRef && elementRef.nativeElement.open) {
      elementRef.nativeElement.close();
    }
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
    const elementRef = this.htmlDialogElementRef();
    if (elementRef && this.config().backdrop && event.target === elementRef.nativeElement) {
      this.close();
    }
  }

  protected onEscapeKey(event: Event) {
    if (this.config().closable) {
      event.preventDefault();
      this.close();
    }
  }
}
