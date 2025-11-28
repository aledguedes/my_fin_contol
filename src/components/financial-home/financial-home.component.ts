import { Component, ChangeDetectionStrategy, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { InstallmentsComponent } from '../installments/installments.component';
import { CategoriesComponent } from '../categories/categories.component';
import { DataService } from '../../services/data.service';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-financial-home',
  templateUrl: './financial-home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DashboardComponent, InstallmentsComponent, CategoriesComponent],
  standalone: true,
})
export class FinancialHomeComponent {
  activeView = signal<'dashboard' | 'installments' | 'categories'>('dashboard');

  private dataService = inject(DataService);
  private uiService = inject(UiService);

  constructor() {
    effect(() => {
      if (this.dataService.navigateToInstallments()) {
        this.setView('installments');
        this.dataService.resetInstallmentsNavigation();
      }
    });
  }

  setView(view: 'dashboard' | 'installments' | 'categories'): void {
    this.activeView.set(view);
  }

  onNewTransaction(): void {
    this.uiService.openTransactionModal(null);
  }
}
