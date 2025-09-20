import {
  Component, input, OnDestroy, effect, signal, output, viewChildren, contentChildren, ElementRef
} from '@angular/core';
import { TabViewPanelComponent } from './tabview-panel/tabview-panel.component';

@Component({
  selector: 'mc-tabview',
  imports: [],
  templateUrl: './tabview.component.html',
})
export class TabViewComponent implements OnDestroy {
  public panels = contentChildren(TabViewPanelComponent);
  public tabRefs = viewChildren<ElementRef>('tabRef');
  public headerWrapper = viewChildren<ElementRef>('headerWrapper');
  private resizeObserver: ResizeObserver | undefined;

  public activeIndex = input<number>(0);
  public tabHeight = input<string | number>('h-[3.8rem]');
  public tabHighlightColor = input<string>('bg-gray-300');
  public tabBackgroundColor = input<string>('bg-gray-100');
  public onTabChange = output<number>();

  protected currentIndex = signal(0);
  protected indicator = signal({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    ready: false
  });

  constructor() {
    effect(() => {
      const index = this.activeIndex();
      this.currentIndex.set(index);
      setTimeout(() => this.updateIndicator(), 0);
    });
    effect(() => {
      setTimeout(() => { this.tabChange(this.currentIndex()); }, 0);
    });
    effect(() => {
      const wrapper = this.headerWrapper();
      if (wrapper.length) { this.setupResizeObserver(wrapper[0].nativeElement); }
    });
    effect(() => {
      const tabs = this.tabRefs();
      if (tabs.length) {
        setTimeout(() => this.indicator.update(current => ({ ...current, ready: true })), 50);
      }
    });
  }

  public ngOnDestroy() {
    this.resizeObserver?.disconnect();
    this.panels().forEach(panel => panel.active = false);
  }

  public tabChange(index: number): void {
    const panels = this.panels();
    if (index < 0 || index >= panels.length) { return; }

    if (this.currentIndex() !== index) this.onTabChange.emit(index);
    this.currentIndex.set(index);
    panels.forEach((panel, i) => panel.active = (i === index));
    requestAnimationFrame(() => this.updateIndicator());
  }

  public get tabHeaders(): string[] {
    return this.panels().map(panel => panel.header()) || [];
  }

  private setupResizeObserver(element: HTMLElement): void {
    if (typeof ResizeObserver !== 'undefined' && !this.resizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateIndicator();
      });
      this.resizeObserver.observe(element);
    }
  }

  private updateIndicator(): void {
    const activeIdx = this.currentIndex();
    const tab = this.tabRefs().at(activeIdx)?.nativeElement;
    const wrapper = this.headerWrapper().at(0)?.nativeElement;

    if (!tab || !wrapper) { return; }

    const tabRect = tab.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();

    const padding = 8;
    this.indicator.update(current => ({
      ...current,
      left: tabRect.left - wrapperRect.left + padding,
      top: tabRect.top - wrapperRect.top + padding,
      width: tab.offsetWidth - 2 * padding,
      height: tab.offsetHeight - 2 * (padding + 1)
    }));
  }
}
