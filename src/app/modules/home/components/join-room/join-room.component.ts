import { CommonModule } from '@angular/common';
import { Component, viewChildren, output, signal, ElementRef, computed, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from "@shared/components/button/button";

@Component({
  selector: 'app-join-room',
  imports: [CommonModule, ButtonComponent, FormsModule],
  templateUrl: './join-room.component.html',
})
export class JoinRoomComponent {
  public isLoading = input.required<boolean>();
  public onRoomJoin = output<string>();
  protected inputBoxes = viewChildren<ElementRef<HTMLInputElement>>('inputRef');
  protected inputValues = signal<string[]>(new Array(6).fill(''));
  protected isFormInvalid = computed<boolean>(() => {
    const roomId = this.inputValues().join('');
    return roomId.length !== 6;
  });

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
