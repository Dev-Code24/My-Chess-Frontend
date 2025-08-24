import { CommonModule } from '@angular/common';
import { Component, inject, output, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AuthForm, AuthProvider } from 'modules/auth/@interface';
import { SIGN_UP } from '../../@utils/constants';
import { COLORS } from '@shared/@utils/constants';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'mc-signup',
  imports: [ CommonModule, FontAwesomeModule, ReactiveFormsModule ],
  templateUrl: './sign-up.component.html',
})
export class SignUpComponent {
  private formBuilder = inject(FormBuilder);


  protected previewIcon = signal(faEye);
  protected passwordInputType = signal<'password' | 'text'>('password');
  protected CONSTANTS = {...SIGN_UP, ...COLORS};
  protected inputStyle: string[] = [
    'p-2', 'rounded-sm', 'border', 'border-solid', 'border border-gray-300', 'focus:outline-none',
    'w-full', 'placeholder:text-gray-400'
  ];
  protected signUpForm = this.formBuilder.nonNullable.group(
    {
      email: this.formBuilder.control<string>('', [Validators.required, Validators.email]),
      password: this.formBuilder.control<string>('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: this.formBuilder.control<string>('', [Validators.required, Validators.minLength(6)])
    },
    { validators: this.passwordValidator }
  );

  public submitSignupForm = output <AuthForm>();

  private passwordValidator(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    return pass === confirmPass ? null : { passwordMisMatch: true };
  }

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
    const signUpFormObject: AuthForm = {
      formType: 'SIGN_UP',
      payload: {
        authProvider: AuthProvider.LOCAL,
        email: this.signUpForm.controls.email.value ?? '',
        password: this.signUpForm.controls.password.value ?? '',
        username: '',
      }
    };
    this.submitSignupForm.emit(signUpFormObject);
  }
}
