import { Injectable, signal } from '@angular/core';
import { Popover } from '@shared/@interface';

@Injectable({
  providedIn: 'root'
})
export class PopoverService {
  public popovers = signal<Popover[]>([]);

  public isOpen(id: string): boolean {
    return this.popovers().some(p => p.id === id && p.isOpen);
  }

  public open(id: string, anchor: HTMLElement): void {
    const existingPopover = this.popovers().find(popover => popover.id === id);

    if (existingPopover) {
      existingPopover.isOpen = true;
      existingPopover.anchor = anchor;
      this.popovers.set([...this.popovers()]);
      return;
    }

    this.popovers.update((popover) => [ ...popover, { id, anchor, isOpen: true }]);
  }

  public close(id: string): void {
    this.popovers.update((popovers) => popovers.map((popover) => {
      return popover.id === id ? { ...popover, isOpen: false } : popover;
    }));
  }

  public closeAll(): void {
    this.popovers.update(p => p.map(pop => ({ ...pop, isOpen: false })));
  }

  public getAnchor(id: string): HTMLElement | null {
    const popover = this.popovers().find(p => p.id === id);

    if (popover) { return popover.anchor; }

    return null;
  }
}
