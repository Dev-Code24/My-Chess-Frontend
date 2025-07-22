import { CommonModule } from '@angular/common';
import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { LOGIN } from '../../@constants/constants';
import { COLORS } from '@shared/utils/constants';
import { AuthForm } from './../../@interface/interface';

@Component({
  selector: 'mc-login',
  imports: [ CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private formBuilder = inject(FormBuilder);

  public submit = output <AuthForm>();

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
    if (this.loginForm.valid) {
      const loginFormObject: AuthForm = {
        'formType': 'LOGIN'
      };
      Object.entries(this.loginForm.controls).forEach((field) => {
        const key = field[0], control = field[1];
        loginFormObject[key] = control.get(key)!.value;
      })
      this.submit.emit(loginFormObject);
    }
  }
}
