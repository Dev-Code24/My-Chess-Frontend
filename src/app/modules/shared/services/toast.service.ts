import { Injectable, signal } from '@angular/core';
import { ToastItem, ToastVariant } from '../@interface';

@Injectable({ providedIn: 'root' })
export class ToastService {
  public static toasts = signal<ToastItem[]>([]);
  private static idCounter = 0;
  private static timers = new Map<number, { startTime: number; remainingTime: number }>();
  private static dismissTimeouts = new Map<number, ReturnType<typeof setTimeout>>();
  private static animationFrames = new Map<number, number>();

  public maxToasts = 3;
  public defaultDuration = 5000;

  public show(message: string, variant: ToastVariant = 'default', duration?: number): number {
    const id = ++ToastService.idCounter;
    const toastDuration = duration ?? this.defaultDuration;

    const toast: ToastItem = {
      id,
      message,
      variant,
      duration: toastDuration,
      createdAt: Date.now(),
      paused: false,
      visible: true
    };

    // Add new toast at the beginning (top)
    ToastService.toasts.update(t => {
      const newList = [toast, ...t];

      // If we exceed maxToasts, dismiss the oldest one
      if (newList.length > this.maxToasts) {
        const oldestToast = newList[newList.length - 1];
        setTimeout(() => this.dismiss(oldestToast.id), 0);
      }

      return newList;
    });

    ToastService.timers.set(id, { startTime: Date.now(), remainingTime: toastDuration });
    this.startTimer(id);
    return id;
  }

  public pause(id: number) {
    const timer = ToastService.timers.get(id);
    if (timer) {
      const elapsed = Date.now() - timer.startTime;
      timer.remainingTime = Math.max(0, timer.remainingTime - elapsed);
    }

    ToastService.toasts.update(list =>
      list.map(t => (t.id === id ? { ...t, paused: true } : t))
    );
  }

  public resume(id: number) {
    const timer = ToastService.timers.get(id);
    if (timer) {
      timer.startTime = Date.now();
    }

    ToastService.toasts.update(list =>
      list.map(t => (t.id === id ? { ...t, paused: false } : t))
    );
  }

  public dismiss(id: number) {
    const frameId = ToastService.animationFrames.get(id);
    if (frameId) {
      cancelAnimationFrame(frameId);
      ToastService.animationFrames.delete(id);
    }

    ToastService.toasts.update(list =>
      list.map(t => (t.id === id ? { ...t, visible: false } : t))
    );

    // Remove after animation (300ms for fade out animation)
    const timeoutId = setTimeout(() => {
      ToastService.toasts.update(list => list.filter(t => t.id !== id));
      ToastService.timers.delete(id);
      ToastService.dismissTimeouts.delete(id);

      if (ToastService.toasts().length === 0) {
        ToastService.idCounter = 0;
      }
    }, 300);
    ToastService.dismissTimeouts.set(id, timeoutId);
  }

  private startTimer(id: number) {
    const tick = () => {
      const toastList = ToastService.toasts();
      const toast = toastList.find(t => t.id === id);
      const timer = ToastService.timers.get(id);

      if (!toast || !toast.visible || !timer) return;

      if (toast.paused) {
        requestAnimationFrame(tick);
        return;
      }

      const elapsed = Date.now() - timer.startTime;
      if (elapsed >= timer.remainingTime) {
        this.dismiss(id);
      } else {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }
}
