import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../service/toast-service/toast-service';
import { AsyncPipe, NgFor } from '@angular/common';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, NgFor, AsyncPipe],
  templateUrl: './toast-container.html',
  styleUrls: ['./toast-container.css']
})
export class ToastContainer {
  toasts$: typeof this.toastService.toasts$;

  constructor(private toastService: ToastService) {
    this.toasts$ = this.toastService.toasts$;
  }

  dismiss(id: number) { this.toastService.dismiss(id); }
  trackById(_i: number, t: Toast) { return t.id; }
}