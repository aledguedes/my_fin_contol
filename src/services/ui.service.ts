import { Injectable, signal } from '@angular/core';
import { Transaction } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class UiService {
  isTransactionModalOpen = signal(false);
  editingTransaction = signal<Partial<Transaction> | null>(null);

  openTransactionModal(transaction: Partial<Transaction> | null = null): void {
    this.editingTransaction.set(transaction);
    this.isTransactionModalOpen.set(true);
  }

  closeTransactionModal(): void {
    this.isTransactionModalOpen.set(false);
    this.editingTransaction.set(null);
  }
}
