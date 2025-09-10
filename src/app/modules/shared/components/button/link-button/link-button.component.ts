import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink, UrlTree } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { type IconDefinition } from '@fortawesome/free-regular-svg-icons';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'mc-linkButton',
  imports: [CommonModule, RouterLink, FontAwesomeModule],
  templateUrl: './link-button.component.html',
})
export class LinkButtonComponent {
  public href = input.required<string | UrlTree>();
  public label = input.required<string>();
  public icon = input<IconDefinition>();
  public styleClass = input<string>();
  public isDisabled = input<boolean>(false);
  public isLoading = input<boolean>(false);
  public buttonSize = input<'sm' | 'md' | 'lg' | 'accent'>('sm');

  protected spinnerIcon = faCircleNotch;

  protected getButtonClass(): string {
    const classes: string[] = [];
    const styles = {
      constant: 'flex justify-center items-center gap-2 duration-300 transition-colors transition-discrete ease-in-out delay-100 cursor-pointer disabled:cursor-not-allowed',
      default: 'text-lime-900 bg-lime-300 hover:bg-lime-400 active:bg-lime-500 w-full h-full disabled:bg-lime-100 p-4 rounded-md font-medium shadow-sm hover:shadow-md',
      styleClass: this.styleClass(),
    };

    classes.push(styles.constant);
    if (styles.styleClass) { classes.push(styles.styleClass); }
    else { classes.push(styles.default); }

    return classes.join(' ');
  }

  protected handleClick(): void {
    const href = this.href();
    if (!href) {
      return;
    }
  }
}
