import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink, UrlTree } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { type IconDefinition } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'mc-linkButton',
  imports: [CommonModule, RouterLink, FontAwesomeModule],
  templateUrl: './link-button.component.html',
})
export class LinkButtonComponent {
  public label = input.required<string>();
  public styleClass = input<string>();
  public href = input.required<string | UrlTree>();
  public icon = input<IconDefinition>();
  public iconStyleClass = input<string>();

  protected getButtonClass(): string {
    const classes: string[] = [];
    const inputsObj = {
      styleClass: this.styleClass(),
    };

    if (inputsObj.styleClass) { classes.push(inputsObj.styleClass); }

    return classes.join(' ');
  }

  protected getIconClass(): string {
    const classes: string[] = [];
    const inputObj = {
      styleClass: this.iconStyleClass(),
    }

    if (inputObj.styleClass) { classes.push(inputObj.styleClass); }

    return classes.join(' ');
  }

  protected handleClick(): void {
    const href = this.href();
    if (!href) {
      return;
    }
  }
}
