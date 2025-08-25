import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  private push(toast: Omit<Toast, 'id'>) {
    const id = Date.now() + Math.random();
    const next = [...this.toastsSubject.value, { ...toast, id }];
    this.toastsSubject.next(next);
    setTimeout(() => this.dismiss(id), toast.duration);
  }

  success(message: string, duration = 3000) {
    this.push({ message, type: 'success', duration });
  }
  error(message: string, duration = 4000) {
    this.push({ message, type: 'error', duration });
  }
  info(message: string, duration = 3000) {
    this.push({ message, type: 'info', duration });
  }
  warning(message: string, duration = 3500) {
    this.push({ message, type: 'warning', duration });
  }

  dismiss(id: number) {
    this.toastsSubject.next(this.toastsSubject.value.filter(t => t.id !== id));
  }
}