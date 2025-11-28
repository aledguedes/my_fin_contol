import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (notificationService.notification(); as notification) {
      <div 
        role="alert"
        class="fixed top-5 right-5 z-50 flex items-start p-4 w-full max-w-sm rounded-lg shadow-2xl transition-all duration-300 animate-slide-in"
        [class.bg-emerald-50]="notification.type === 'success'"
        [class.text-emerald-900]="notification.type === 'success'"
        [class.bg-rose-50]="notification.type === 'error'">
        
        <div class="flex-shrink-0">
          @if (notification.type === 'success') {
            <svg class="h-6 w-6 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          @if (notification.type === 'error') {
            <svg class="h-6 w-6 text-rose-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        </div>
        
        <div class="ml-3 w-0 flex-1 pt-0.5">
          <p class="text-sm font-medium" [class.text-emerald-800]="notification.type === 'success'" [class.text-rose-800]="notification.type === 'error'">
            {{ notification.type === 'success' ? 'Sucesso!' : 'Erro!' }}
          </p>
          <p class="mt-1 text-sm" [class.text-emerald-700]="notification.type === 'success'" [class.text-rose-700]="notification.type === 'error'">
            {{ notification.message }}
          </p>
        </div>

        <div class="ml-4 flex-shrink-0 flex">
          <button (click)="notificationService.hide()" class="rounded-md inline-flex text-neutral-400 hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <span class="sr-only">Fechar</span>
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

      </div>
    }
  `,
  styles: [`
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .animate-slide-in {
      animation: slideIn 0.3s ease-out forwards;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationComponent {
  notificationService = inject(NotificationService);
}