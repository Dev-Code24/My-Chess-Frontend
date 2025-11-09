import { CommonModule } from '@angular/common';
import { Component, viewChildren, output, signal, ElementRef, computed, input, afterRenderEffect, inject, model, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogConfig } from '@shared/@interface';
import { ButtonComponent } from "@shared/components/button/button";
import { DialogComponent } from "@shared/components/dialog/dialog.component";

@Component({
  selector: 'app-join-room',
  imports: [CommonModule, ButtonComponent, FormsModule, DialogComponent],
  templateUrl: './join-room.component.html',
})
export class JoinRoomComponent {
  public readonly isLoading = input.required<boolean>();
  public readonly isDialogVisible = model.required<boolean>();
  public onRoomJoin = output<string>();

  protected inputBoxes = viewChildren<ElementRef<HTMLInputElement>>('inputRef');
  protected inputValues = signal<string[]>(new Array(6).fill(''));
  protected isFormInvalid = computed<boolean>(() => {
    const roomId = this.inputValues().join('');
    return roomId.length !== 6;
  });
  protected dialogConfig: DialogConfig = {
    width: '40rem',
    height: '22rem',
    top: '50%',
    left: '50%',
    closable: true,
    backdrop: true,
  };

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    effect(() => {
      if (this.isDialogVisible()) {
        requestAnimationFrame(() => {
          const inputs = this.inputBoxes();
          inputs[0]?.nativeElement.focus();
        })
      }
    });
  }

  protected onInputChange(event: Event, index: number): void {
    const inputEl = event.target as HTMLInputElement;
    const rawValue = inputEl.value.replace(/\s+/g, '');
    const inputs = this.inputBoxes();

    if (rawValue.length > 1) {
      const chars = rawValue.split('');
      for (let i = 0; i < chars.length && (index + i) < inputs.length; i++) {
        this.updateInputs(chars[i], index + i);
      }
    } else if (rawValue.length === 1) {
      this.updateInputs(rawValue, index);
    } else {
      this.updateInputs('', index);
    }
  }


  protected onBackspace(event: KeyboardEvent, index: number): void {
    const inputEl = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !inputEl.value) {
      const prevIndex = index - 1;
      const inputs = this.inputBoxes();
      if (prevIndex >= 0) {
        this.updateInputs('', prevIndex);
        inputs[prevIndex].nativeElement.focus();
      }
    }
  }

  protected onSubmit(): void {
    const inputs = this.inputValues();
    const roomId = inputs.map(input => input).join('');
    this.onRoomJoin.emit(roomId);
  }

  protected onDialogClose(): void {
    this.router.navigate([], { relativeTo: this.route });
  }

  private updateInputs(value: string, index: number): void {
    const inputs = this.inputBoxes();

    this.inputValues.update(curr => {
      const newValues = [...curr];
      newValues[index] = value;
      return newValues;
    });

    const el = inputs[index].nativeElement;
    el.value = value;
    if (value) { el.focus(); }
  }
}
