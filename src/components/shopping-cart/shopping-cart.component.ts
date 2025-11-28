import { Component, ChangeDetectionStrategy, output, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShoppingService } from '../../services/shopping.service';
import { CartItem, Product } from '../../models/shopping.model';
import { CurrencyMaskDirective } from '../../directives/currency-mask.directive';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CurrencyMaskDirective],
})
export class ShoppingCartComponent {
  completePurchase = output<void>();

  shoppingService = inject(ShoppingService);

  viewMode = signal<'list' | 'category'>('list');
  sortDirection = signal<'asc' | 'desc'>('asc');
  
  // Loading states
  updatingItemId = signal<string | null>(null);
  removingItemId = signal<string | null>(null);

  // Signals for Quick Add Modal
  isQuickAddModalOpen = signal(false);
  quickAddSearchTerm = signal('');
  quickAddSelectedProductIds = signal<string[]>([]);
  isQuickAdding = signal(false);
  
  groupedItems = computed(() => {
    const items = this.shoppingService.items();
    const categories = this.shoppingService.shoppingCategories();
    const grouped: { categoryName: string; items: CartItem[] }[] = categories.map(category => ({
      categoryName: category.name,
      items: items.filter(item => item.categoryId === category.id).sort((a,b) => a.name.localeCompare(b.name)),
    })).filter(g => g.items.length > 0);

    const uncategorizedItems = items.filter(item => !item.categoryId || !categories.some(c => c.id === item.categoryId));
    if (uncategorizedItems.length > 0) {
      grouped.push({ categoryName: 'Sem Categoria', items: uncategorizedItems.sort((a,b) => a.name.localeCompare(b.name)) });
    }
    return grouped;
  });

  sortedItems = computed(() => {
    const direction = this.sortDirection() === 'asc' ? 1 : -1;
    return [...this.shoppingService.items()].sort((a, b) => a.name.localeCompare(b.name) * direction);
  });
  
  private availableProducts = computed(() => {
    const productIdsInCart = new Set(this.shoppingService.items().map(item => item.productId));
    return this.shoppingService.products().filter(p => !productIdsInCart.has(p.id));
  });

  groupedAndFilteredQuickAddProducts = computed(() => {
    const searchTerm = this.quickAddSearchTerm().toLowerCase();
    const available = this.availableProducts();

    const filteredProducts = searchTerm
      ? available.filter(p => p.name.toLowerCase().includes(searchTerm))
      : available;

    const categories = this.shoppingService.shoppingCategories();

    return categories
      .map(category => ({
        categoryName: category.name,
        products: filteredProducts
          .filter(p => p.categoryId === category.id)
          .sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .filter(g => g.products.length > 0);
  });

  setViewMode(mode: 'list' | 'category'): void { this.viewMode.set(mode); }
  toggleSortDirection(): void { this.sortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc'); }
  
  toggleQuickAddSelection(productId: string): void {
    this.quickAddSelectedProductIds.update(ids => {
      const set = new Set(ids);
      if (set.has(productId)) {
        set.delete(productId);
      } else {
        set.add(productId);
      }
      return Array.from(set);
    });
  }
  
  confirmQuickAdd(): void {
    const selectedIds = this.quickAddSelectedProductIds();
    if (selectedIds.length === 0) return;
    
    this.isQuickAdding.set(true);
    const itemsToAdd = selectedIds.map(productId => ({ productId, quantity: 1, price: 0 }));
    
    this.shoppingService.addMultipleItems(itemsToAdd).pipe(
      finalize(() => this.isQuickAdding.set(false))
    ).subscribe(() => {
      this.quickAddSelectedProductIds.set([]);
      this.quickAddSearchTerm.set('');
      this.isQuickAddModalOpen.set(false);
    });
  }

  updateItem(item: CartItem, field: 'quantity' | 'price' | 'checked', value: number | boolean): void {
    if (value === null || value === undefined) return;
    this.updatingItemId.set(item.id);
    const updatedItem = { ...item, [field]: value };
    this.shoppingService.updateItem(updatedItem).pipe(
      finalize(() => this.updatingItemId.set(null))
    ).subscribe();
  }

  removeItem(id: string): void { 
    this.removingItemId.set(id);
    this.shoppingService.removeItem(id).pipe(
      finalize(() => this.removingItemId.set(null))
    ).subscribe();
  }

  toggleCheck(item: CartItem): void {
    this.updateItem(item, 'checked', !item.checked);
  }
  
  onCompletePurchase(): void {
    if (this.shoppingService.total() > 0) {
        if(confirm('Concluir a compra irá arquivar a lista atual e abrir o formulário de lançamento. Deseja continuar?')) {
            this.completePurchase.emit();
        }
    }
  }
  
  trackById(index: number, item: CartItem | Product): string { return item.id; }
}
