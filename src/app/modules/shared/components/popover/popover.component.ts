import {
  Component, computed, effect, ElementRef, HostListener, inject, input, OnDestroy, signal, viewChild
} from '@angular/core';
import { SubSink } from '@shared/@utils';
import { PopoverService } from '@shared/services';

@Component({
  selector: 'mc-popover',
  imports: [],
  templateUrl: './popover.component.html',
  styleUrl: './popover.component.scss'
})
export class PopoverComponent implements OnDestroy {
  public popoverId = input.required<string>();

  protected popoverPosition = signal<{ left: number, top: number } | undefined>(undefined);
  protected isPopoverOpen = computed<boolean>(() => this.popoverService.isOpen(this.popoverId()));

  private readonly popoverElement = viewChild<ElementRef<HTMLDivElement>>('popoverElement');

  private subsink = new SubSink();
  private readonly popoverService = inject(PopoverService);

  constructor() {
    effect(() => {
      if (this.isPopoverOpen()) {
        this.positionPopover();
        setTimeout(() => {
          document.addEventListener('click', this.handleOutsideClick);
          window.addEventListener('resize', this.handleWindowResize);
        }, 0);
      } else {
        document.removeEventListener('click', this.handleOutsideClick);
        window.removeEventListener('resize', this.handleWindowResize);
      }
    })
  }

  public ngOnDestroy(): void {
    document.removeEventListener('click', this.handleOutsideClick);
    window.removeEventListener('resize', this.handleWindowResize);
    this.subsink.unsubscribeAll();
  }

  @HostListener('click', ['$event'])
  protected stopClickPropagation(event: Event) {
    event.stopPropagation();
  }

  private handleOutsideClick = (event: Event): void => {
    const popoverEl = this.popoverElement()?.nativeElement;
    const target = event.target as Node;

    const isOutsidePopover = popoverEl && !popoverEl.contains(target);

    if (isOutsidePopover) {
      this.popoverService.close(this.popoverId());
    }
  }

  private handleWindowResize = (): void => {
    if (this.isPopoverOpen()) {
      this.positionPopover();
    }
  }

  protected positionPopover(): void {
    const anchorEl = this.popoverService.getAnchor(this.popoverId());

    if (!anchorEl) { return; }

    const anchorRect = anchorEl.getBoundingClientRect();

    const viewPortWidth = window.innerWidth;
    const estimatedPopoverWidth = 200;

    let left = anchorRect.left + 6;
    let top = anchorRect.bottom + 6;

    // Check if popover would overflow viewport
    if (left + estimatedPopoverWidth + 6 > viewPortWidth) {
      left = anchorRect.right - estimatedPopoverWidth - 8;
    }

    if (left < 8) {
      left = 8;
    }

    this.popoverPosition.set({
      left,
      top
    });

    // After popover is rendered, fine-tune position with actual width
    setTimeout(() => {
      const popoverNativeEl = this.popoverElement()?.nativeElement;
      if (popoverNativeEl) {
        const popoverWidth = popoverNativeEl.offsetWidth;
        let adjustedLeft = anchorRect.left + 6;

        if (adjustedLeft + popoverWidth + 6 > viewPortWidth) {
          adjustedLeft = anchorRect.right - popoverWidth - 6;
        }

        if (adjustedLeft < 8) {
          adjustedLeft = 8;
        }

        // Only update if position changed significantly
        if (Math.abs(adjustedLeft - left) > 2) {
          this.popoverPosition.set({
            left: adjustedLeft,
            top
          });
        }
      }
    }, 0);
  }
}
