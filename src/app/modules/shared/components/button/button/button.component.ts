import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleNotch, IconDefinition } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'mc-button',
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './button.component.html',
})
export class ButtonComponent {
  public label = input.required<string>();
  public isDisabled = input<boolean>(false);
  public buttonType = input<'submit' | 'button' | 'reset'>('button');
  public buttonSize = input<'sm' | 'md' | 'lg' | 'accent'>('sm');
  public icon = input<IconDefinition>();
  public isLoading = input<boolean>(false);
  public styleClass = input<string>();

  protected spinnerIcon = faCircleNotch;

  protected getButtonClass(): string {
    const classes: string[] = [];
    const styles = {
      constant: 'flex justify-center items-center gap-2 duration-300 transition-colors transition-discrete ease-in-out delay-100 cursor-pointer disabled:cursor-not-allowed',
      default: `bg-lime-300 hover:bg-lime-400 active:bg-lime-300 w-full h-full disabled: bg-lime-100 p-4 rounded-md font-medium`,
      styleClass: this.styleClass(),
    };
    classes.push(styles.constant);
    if (styles.styleClass) { classes.push(styles.styleClass); }
    else { classes.push(styles.default); }

    return classes.join(' ');
  }
}
