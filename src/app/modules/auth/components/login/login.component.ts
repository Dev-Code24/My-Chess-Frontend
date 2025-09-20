import { CommonModule } from '@angular/common';
import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AuthForm } from '../../@interface';
import { LOGIN } from '../../@utils/constants';
import { COLORS } from '@shared/@utils/constants';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { ButtonComponent } from "@shared/components/button/button";

@Component({
  selector: 'mc-login',
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule, ButtonComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private formBuilder = inject(FormBuilder);

  protected previewIcon = signal(faEye);
  protected passwordInputType = signal<'password' | 'text'>('password');
  protected CONSTANTS = { ...LOGIN, ...COLORS };
  protected inputStyle: string[] = [
    'p-2', 'rounded-sm', 'border', 'border-solid', 'border border-gray-300', 'focus:outline-none',
    'w-full', 'placeholder:text-gray-400'
  ];
  protected loginForm = this.formBuilder.nonNullable.group({
    email: this.formBuilder.control<string>('', [Validators.required, Validators.email]),
    password: this.formBuilder.control<string>('', [Validators.required, Validators.minLength(6)])
  });

  public submitLoginForm = output <AuthForm>();

  protected togglePassword(): void {
    this.passwordInputType.update((value) => {
      if (value === 'password') {
        this.previewIcon.set(faEyeSlash);
        return 'text';
      } else {
        this.previewIcon.set(faEye);
        return 'password';
      }
    });
  }

  protected onSubmit(): void {
    const loginFormObject: AuthForm = {
      formType: 'LOGIN',
      payload: {
        email: this.loginForm.controls.email.value ?? '',
        password: this.loginForm.controls.password.value ?? '',
      }
    };
    this.submitLoginForm.emit(loginFormObject);
  }
}
