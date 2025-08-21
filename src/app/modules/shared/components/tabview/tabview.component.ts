import { Component, ContentChildren, ElementRef, input, QueryList, ViewChild, ViewChildren, AfterViewInit, OnDestroy, effect, signal, output } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { SubSink } from '@shared/@utils/Subsink';
import { TabViewPanelComponent } from './tabview-panel/tabview-panel.component';

@Component({
  selector: 'mc-tabview',
  imports: [],
  templateUrl: './tabview.component.html',
})
export class TabViewComponent implements AfterViewInit, OnDestroy {
  @ContentChildren(TabViewPanelComponent) panels!: QueryList<TabViewPanelComponent>;
  @ViewChildren('tabRef') tabRefs!: QueryList<ElementRef>;
  @ViewChild('headerWrapper') headerWrapper!: ElementRef<HTMLElement>;

  private subsink = new SubSink();
  private destroy$ = new Subject<void>();
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
  }

  public ngAfterViewInit() {
    setTimeout(() => {
      this.tabChange(this.currentIndex());
      this.setupResizeObserver();
      setTimeout(() => this.indicator.update(current => ({ ...current, ready: true })), 50);
    }, 0);

    this.subsink.sink = this.panels.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
      setTimeout(() => this.updateIndicator(), 0);
    });
  }

  public ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.resizeObserver?.disconnect();
    this.subsink.unsubscribeAll();
    this.panels.forEach(panel => panel.active = false);
  }

  public tabChange(index: number): void {
    if (index < 0 || index >= this.panels.length) return;

    if (this.currentIndex() !== index) this.onTabChange.emit(index);
    this.currentIndex.set(index);
    this.panels.forEach((panel, i) => panel.active = (i === index));
    requestAnimationFrame(() => this.updateIndicator());
  }

  public get tabHeaders(): string[] {
    return this.panels?.map(panel => panel.header()) || [];
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateIndicator();
      });

      if (this.headerWrapper?.nativeElement) {
        this.resizeObserver.observe(this.headerWrapper.nativeElement);
      }
    }
  }

  private updateIndicator(): void {
    const activeIdx = this.currentIndex();
    const tab = this.tabRefs.get(activeIdx)?.nativeElement;
    const wrapper = this.headerWrapper?.nativeElement;

    if (!tab || !wrapper) return;

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
