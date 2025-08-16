import { CommonModule } from '@angular/common';
import { Component, input, OnInit, signal } from '@angular/core';
import { SizeType } from '@shared/@interface/ui-interface';
import { randomHSLGenerator } from '@shared/@utils/utils';

@Component({
  selector: 'mc-avatar',
  imports: [ CommonModule ],
  templateUrl: './avatar.component.html',
})
export class AvatarComponent implements OnInit {
  public label = input<string>();
  public size = input<SizeType>('sm');

  protected generatedHSL = signal<[string, string, string, string] | undefined>(undefined);

  public ngOnInit(): void {
    this.setAvatarBG();
  }

  protected setAvatarBG(): void {
    const label = this.label() ?? '';
    this.generatedHSL.update(() => [...randomHSLGenerator(label)]);
  }

  protected get labelInitials(): string {
    const label = this.label() ?? 'PL';
    if (label) {
      const labelSplit = label.trim().toUpperCase().split(' ');
      return labelSplit[0][0] + (labelSplit.length > 1 ? labelSplit[1][0] : labelSplit[0].length > 1 ? labelSplit[0][1] : 'P');
    }
    return label;
  }
}
