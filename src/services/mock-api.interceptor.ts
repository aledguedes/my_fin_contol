// Fix: Import HttpInterceptorFn to resolve type error
import { HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse, HttpInterceptorFn } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import {
  MOCK_FINANCIAL_CATEGORIES, MOCK_TRANSACTIONS, MOCK_SHOPPING_LISTS,
  MOCK_PRODUCTS, MOCK_SHOPPING_CATEGORIES, MOCK_USERS
} from './mock-data';
import { Transaction, Category, MonthlyView, InstallmentPlan } from '../models/transaction.model';
import { ShoppingList, ShoppingCategory, Product, CartItem } from '../models/shopping.model';

// Clona os dados para que as modificações não afetem o mock original entre recarregamentos de página
let transactions: Transaction[] = JSON.parse(JSON.stringify(MOCK_TRANSACTIONS));
let financialCategories: Category[] = JSON.parse(JSON.stringify(MOCK_FINANCIAL_CATEGORIES));
let shoppingLists: ShoppingList[] = JSON.parse(JSON.stringify(MOCK_SHOPPING_LISTS));
let products: Product[] = JSON.parse(JSON.stringify(MOCK_PRODUCTS));
let shoppingCategories: ShoppingCategory[] = JSON.parse(JSON.stringify(MOCK_SHOPPING_CATEGORIES));

// Lógica de Negócio Simulada
const calculateMonthlyView = (year: number, month: number): MonthlyView => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  let monthlyTransactions: Transaction[] = [];
  let totalRevenue = 0;
  let totalExpense = 0;

  transactions.forEach(t => {
    if (!t.isInstallment) {
      const tDate = new Date(t.date);
      if (tDate >= startDate && tDate <= endDate) {
        monthlyTransactions.push(t);
      }
    } else if (t.installments) {
      const installmentAmount = t.amount / t.installments.totalInstallments;
      for (let i = 0; i < t.installments.totalInstallments; i++) {
        const installmentDate = new Date(t.installments.startDate);
        installmentDate.setMonth(installmentDate.getMonth() + i);
        if (installmentDate.getFullYear() === year && installmentDate.getMonth() === month - 1) {
          monthlyTransactions.push({
            ...t,
            id: `${t.id}-inst-${i + 1}`,
            amount: installmentAmount,
            description: `${t.description} (${i + 1}/${t.installments.totalInstallments})`,
            date: installmentDate.toISOString().split('T')[0],
            isInstallment: false, // Para simplificar a exibição
          });
        }
      }
    }
  });
  
  monthlyTransactions.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  monthlyTransactions.forEach(t => {
      if (t.type === 'revenue') totalRevenue += t.amount;
      else totalExpense += t.amount;
  });

  return {
    transactions: monthlyTransactions,
    summary: { totalRevenue, totalExpense, balance: totalRevenue - totalExpense }
  };
};

const calculateInstallmentPlans = (): InstallmentPlan[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return transactions
        .filter(t => t.isInstallment && t.installments)
        .map(t => {
            const inst = t.installments!;
            const installmentAmount = t.amount / inst.totalInstallments;
            const startDate = new Date(inst.startDate);
            const endDate = new Date(startDate);
            endDate.setMonth(startDate.getMonth() + inst.totalInstallments - 1);

            let paidInstallments = 0;
            for (let i = 0; i < inst.totalInstallments; i++) {
                const dueDate = new Date(inst.startDate);
                dueDate.setMonth(dueDate.getMonth() + i);
                if (dueDate < today) {
                    paidInstallments++;
                }
            }
            
            const paidAmount = paidInstallments * installmentAmount;
            const pendingAmount = t.amount - paidAmount;
            
            let status: 'ativo' | 'concluído' | 'atrasado' = 'ativo';
            if (paidInstallments >= inst.totalInstallments) {
                status = 'concluído';
            } else {
                 const nextDueDate = new Date(inst.startDate);
                 nextDueDate.setMonth(nextDueDate.getMonth() + paidInstallments);
                 if (nextDueDate < today) {
                     status = 'atrasado';
                 }
            }

            return {
                id: t.id,
                description: t.description,
                paymentMethod: t.paymentMethod,
                totalAmount: t.amount,
                startDate: inst.startDate,
                endDate: endDate.toISOString().split('T')[0],
                totalInstallments: inst.totalInstallments,
                paidInstallments: paidInstallments,
                pendingInstallments: inst.totalInstallments - paidInstallments,
                paidAmount: paidAmount,
                pendingAmount: pendingAmount,
                status: status,
                category: financialCategories.find(c => c.id === t.categoryId)!
            };
        });
};


export const mockApiInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {

  const { url, method, body, params } = req;
  const API_PREFIX = '/api/v1';

  const handleRequest = () => {
    const response = (data: any, status = 200) => of(new HttpResponse({ status, body: data })).pipe(delay(500));
    const error = (message: string, status = 400) => throwError(() => new HttpResponse({ status, statusText: message }));

    // AUTH
    if (url.endsWith(`${API_PREFIX}/auth/login`)) {
      const { username, password } = body;
      const user = MOCK_USERS.find(u => u.username === username && u.password === password);
      if (user || (username === 'admin' && password === 'admin')) {
         const fakeToken = `fake-token.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + (60 * 60) }))}.fake-signature`;
         return response({ token: fakeToken });
      }
      return error('Invalid credentials', 401);
    }
    if (url.endsWith(`${API_PREFIX}/auth/google-login`)) {
        const fakeToken = `fake-token.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + (60 * 60) }))}.fake-signature`;
        return response({ token: fakeToken });
    }

    // FINANCIAL
    if (url.endsWith(`${API_PREFIX}/financial/categories`) && method === 'GET') return response(financialCategories);
    if (url.endsWith(`${API_PREFIX}/financial/categories`) && method === 'POST') {
        const newCategory: Category = { ...body, id: uuidv4() };
        financialCategories.push(newCategory);
        return response(newCategory, 201);
    }
    if (url.endsWith(`${API_PREFIX}/financial/transactions`) && method === 'GET') return response(transactions);
    if (url.endsWith(`${API_PREFIX}/financial/transactions`) && method === 'POST') {
        const newTransaction: Transaction = { ...body, id: uuidv4() };
        transactions.push(newTransaction);
        return response(newTransaction, 201);
    }
    if (url.match(`${API_PREFIX}/financial/transactions/`)) {
        const id = url.split('/').pop()!;
        if (method === 'PUT') {
            transactions = transactions.map(t => t.id === id ? { ...body, id } : t);
            return response(body);
        }
        if (method === 'DELETE') {
            transactions = transactions.filter(t => t.id !== id);
            return response(null, 204);
        }
    }
    if (url.includes(`${API_PREFIX}/financial/summary/monthly-view`)) {
        const year = parseInt(params.get('year')!, 10);
        const month = parseInt(params.get('month')!, 10);
        return response(calculateMonthlyView(year, month));
    }
    if (url.endsWith(`${API_PREFIX}/financial/summary/installment-plans`)) {
        return response(calculateInstallmentPlans());
    }

    // SHOPPING
    if (url.endsWith(`${API_PREFIX}/shopping/categories`) && method === 'GET') return response(shoppingCategories);
    if (url.endsWith(`${API_PREFIX}/shopping/categories`) && method === 'POST') {
        const newCategory: ShoppingCategory = { ...body, id: uuidv4() };
        shoppingCategories.push(newCategory);
        return response(newCategory, 201);
    }
    if (url.match(`${API_PREFIX}/shopping/categories/`)) {
        const id = url.split('/').pop()!;
        if (method === 'PUT') {
            shoppingCategories = shoppingCategories.map(c => c.id === id ? { ...body, id } : c);
            return response(body);
        }
        if (method === 'DELETE') {
            shoppingCategories = shoppingCategories.filter(c => c.id !== id);
            return response(null, 204);
        }
    }
    if (url.endsWith(`${API_PREFIX}/shopping/products`) && method === 'GET') return response(products);
    if (url.endsWith(`${API_PREFIX}/shopping/products`) && method === 'POST') {
        const newProduct: Product = { ...body, id: uuidv4() };
        products.push(newProduct);
        return response(newProduct, 201);
    }
    if (url.match(`${API_PREFIX}/shopping/products/`)) {
        const id = url.split('/').pop()!;
        if (method === 'PUT') {
            products = products.map(p => p.id === id ? { ...body, id } : p);
            return response(body);
        }
        if (method === 'DELETE') {
            products = products.filter(p => p.id !== id);
            return response(null, 204);
        }
    }
    if (url.endsWith(`${API_PREFIX}/shopping/lists`) && method === 'GET') return response(shoppingLists.map(({ items, ...list }) => list)); // Return summary
    if (url.match(`${API_PREFIX}/shopping/lists/`) && !url.includes('items') && !url.includes('complete')) {
        const id = url.split('/').pop()!;
        const list = shoppingLists.find(l => l.id === id);
        if (method === 'GET') return list ? response(list) : error('List not found', 404);
        if (method === 'DELETE') {
            shoppingLists = shoppingLists.filter(l => l.id !== id);
            return response(null, 204);
        }
    }
    if (url.endsWith(`${API_PREFIX}/shopping/lists`) && method === 'POST') {
        const { name, items: initialProductIds = [] } = body;
        const initialItems: CartItem[] = (initialProductIds || []).map((productId: string) => {
            const product = products.find(p => p.id === productId);
            if (!product) return null;
            return {
                id: uuidv4(),
                productId: product.id,
                name: product.name,
                quantity: 1,
                price: 0,
                checked: false,
                categoryId: product.categoryId,
                unit: product.unit
            };
        }).filter((item: CartItem | null): item is CartItem => item !== null);

        const newList: ShoppingList = {
            name,
            id: uuidv4(),
            createdAt: new Date().toISOString().split('T')[0],
            items: initialItems,
            status: 'andamento'
        };
        shoppingLists.push(newList);
        return response(newList, 201);
    }
    if (url.includes(`/complete`)) {
      const listId = url.split('/').slice(-2, -1)[0];
      const list = shoppingLists.find(l => l.id === listId);
      if (list) {
        list.status = 'finalizada';
        list.completedAt = new Date().toISOString().split('T')[0];
        list.totalAmount = list.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        // Create financial transaction
        const newTransaction: Transaction = {
          id: uuidv4(),
          type: 'expense',
          amount: list.totalAmount,
          date: list.completedAt,
          description: `Compras: ${list.name}`,
          categoryId: 'c4', // Default 'Alimentação'
          paymentMethod: 'Débito',
          isInstallment: false,
        };
        transactions.unshift(newTransaction);
        return response(list);
      }
      return error('List not found', 404);
    }
    if (url.includes('/items')) {
        const parts = url.split('/');
        const listId = parts[parts.indexOf('lists') + 1];
        const itemId = parts[parts.indexOf('items') + 1];
        const list = shoppingLists.find(l => l.id === listId);
        if (!list) return error('List not found', 404);
        
        if (method === 'POST') {
            // Handle both single item and batch add
            const itemsToAdd = Array.isArray(body) ? body : [body];
            const newItems: CartItem[] = [];

            for (const itemData of itemsToAdd) {
              const product = products.find(p => p.id === itemData.productId);
              if(!product) return error('Product not found', 404);
              const newItem: CartItem = { 
                  id: uuidv4(), 
                  ...itemData, 
                  name: product.name,
                  categoryId: product.categoryId,
                  unit: product.unit,
                  checked: false 
              };
              list.items.push(newItem);
              newItems.push(newItem);
            }
            
            return response(Array.isArray(body) ? newItems : newItems[0], 201);
        }
        if (method === 'PUT') {
            let updatedItem: CartItem | undefined;
            list.items = list.items.map(i => {
                if (i.id === itemId) {
                    updatedItem = { ...i, ...body };
                    return updatedItem;
                }
                return i;
            });
            return response(updatedItem);
        }
        if (method === 'DELETE') {
            list.items = list.items.filter(i => i.id !== itemId);
            return response(null, 204);
        }
    }

    return next(req);
  };
  
  if (url.startsWith('/api/v1')) {
      return handleRequest();
  }

  return next(req);
};