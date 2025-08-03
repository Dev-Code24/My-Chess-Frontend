import { Component, input } from '@angular/core';

@Component({
  selector: 'mc-tabviewPanel',
  imports: [],
  template: `
    @if (active) {
      <ng-content></ng-content>
    }
  `,
})

export class TabViewPanelComponent {
  public header = input.required<string>();
  public active: boolean = false;
}
