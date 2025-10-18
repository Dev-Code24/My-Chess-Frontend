import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, signal } from '@angular/core';
import { IconSize } from '@shared/@interface';
import { randomHSLGenerator } from '@shared/@utils/utils';

@Component({
  selector: 'mc-avatar',
  imports: [ CommonModule ],
  templateUrl: './avatar.component.html',
})
export class AvatarComponent {
  public label = input.required<string>();
  public username = input<string>();
  public usernamePosition = input<'right' | 'left'>('left');
  public size = input<IconSize>('sm');
  public actionable = input<boolean>(false);

  protected generatedHSL = computed<[string, number, number, number]>(() => randomHSLGenerator(this.label()));
  protected usernameColor = computed<string>(() => {
    const hsl = this.generatedHSL();
    return `hsl(${hsl[1]}, ${hsl[2]}%, ${hsl[3] - 40}%)`;
  });

  protected get labelInitials(): string {
    const label = this.label();
    if (label) {
      const labelSplit = label.trim().toUpperCase().split(' ');
      return labelSplit[0][0] + (labelSplit.length > 1 ? labelSplit[1][0] : labelSplit[0].length > 1 ? labelSplit[0][1] : 'P');
    }
    return label;
  }
}
