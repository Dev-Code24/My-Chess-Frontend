import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'mc-button',
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './button.component.html',
})
export class ButtonComponent {
  public title = input.required<string>();
  public isDisabled = input<boolean>(false);
  public buttonType = input<'submit' | 'button' | 'reset'>('button');
  public buttonSize = input<'sm' | 'md' | 'lg'>('sm');
  public isLoading = input<boolean>(false);

  protected spinnerIcon = faCircleNotch;
}
