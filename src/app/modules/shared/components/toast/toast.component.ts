import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ToastService } from '@shared/services/toast.service';
import { ToastVariant } from '@shared/@interface';

@Component({
  selector: 'mc-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styles: [`
    :host {
      display: contents;
    }
  `]
})
export class ToastComponent {
  protected toastList = computed(() => ToastService.toasts());
  private toastService = inject(ToastService);

  protected pause(id: number) { this.toastService.pause(id); }

  protected resume(id: number) { this.toastService.resume(id); }

  protected dismiss(id: number) { this.toastService.dismiss(id); }

  protected variantClass(variant: ToastVariant): string {
    switch (variant) {
      case 'success': return 'border-green-200 bg-green-50 text-green-800';
      case 'error': return 'border-red-200 bg-red-50 text-red-800';
      case 'warning': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'info': return 'border-blue-200 bg-blue-50 text-blue-800';
      default: return 'border-gray-200 bg-white text-gray-800';
    }
  }

  protected variantIcon(variant: ToastVariant): string {
    switch (variant) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return '';
    }
  }
}
