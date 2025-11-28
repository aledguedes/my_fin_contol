import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error';

export interface Notification {
  message: string;
  type: NotificationType;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  notification = signal<Notification | null>(null);
  private timer: ReturnType<typeof setTimeout> | null = null;

  show(message: string, type: NotificationType = 'success', duration: number = 4000): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    
    this.notification.set({ message, type });

    this.timer = setTimeout(() => {
      this.hide();
    }, duration);
  }

  hide(): void {
    this.notification.set(null);
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}