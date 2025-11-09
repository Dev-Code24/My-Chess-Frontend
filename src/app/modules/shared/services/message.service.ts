import { inject, Injectable } from '@angular/core';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class MyChessMessageService {
  private toastService = inject(ToastService);

  public showSuccess(message: string): void {
    this.toastService.show(message, 'success');
  }

  public showError(message: string): void {
    this.toastService.show(message, 'error');
  }

  public showWarning(message: string): void {
    this.toastService.show(message, 'warning');
  }

  public showInfo(message: string): void {
    this.toastService.show(message, 'info');
  }

  public showMessage(message: string): void {
    this.toastService.show(message);
  }
}
