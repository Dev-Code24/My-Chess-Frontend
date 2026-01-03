import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MyChessLogoIconComponent } from "@shared/components";
import { IconSize } from '@shared/@interface';

@Component({
  selector: 'MyChessLogo',
  standalone: true,
  imports: [ MyChessLogoIconComponent, CommonModule, RouterLink ],
  template: `
    <div [ngClass]="[ getPaddings[0], 'text-lime-500 ml-4 select-none', getSizeClass ]" >
      <a routerLink="/">
        <MyChessLogoIcon [size]="size()" />
        <span [ngClass]="getPaddings[1]">MyChess</span>
      </a>
    </div>
  `
})
export class MyChessLogoComponent {
  public size = input<IconSize>('md');
  public paddings = input<[string, string]>();

  protected get getSizeClass(): string {
    const map = {
      sm: 'text-3xl',
      md: 'text-5xl',
      xl: 'text-6xl',
    } as const;
    return map[this.size()];
  }

  protected get getPaddings(): [string, string] {
    const paddings = this.paddings();
    if (paddings) {
      return paddings;
    }

    const defaultPaddings: Record<'sm' | 'md' | 'xl', [string, string]> = {
      sm: ['pl-[0.9rem]', 'pl-[1.8rem]'],
      md: ['pl-[1.4rem]', 'pl-[3rem]'],
      xl: ['pl-[1.8rem]', 'pl-[3.5rem]'],
    };

    return defaultPaddings[this.size()];
  }
}
