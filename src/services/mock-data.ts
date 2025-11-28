import { Transaction, Category } from '../models/transaction.model';
import { ShoppingList, ShoppingCategory, Product } from '../models/shopping.model';

export const MOCK_USERS = [
  { id: 'user-1', username: 'admin', password: 'admin', email: 'admin@test.com' },
  { id: 'user-2', username: 'alex', password: '123', email: 'alexandredguedes@gmail.com' },
];

export const MOCK_FINANCIAL_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Salário', type: 'revenue' },
  { id: 'c2', name: 'Freelance', type: 'revenue' },
  { id: 'c3', name: 'Moradia', type: 'expense' },
  { id: 'c4', name: 'Alimentação', type: 'expense' },
  { id: 'c5', name: 'Transporte', type: 'expense' },
  { id: 'c6', name: 'Lazer', type: 'expense' },
  { id: 'c7', name: 'Educação', type: 'expense' },
  { id: 'c8', name: 'Saúde', type: 'expense' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  // Receitas
  {
    id: 't1', type: 'revenue', amount: 5000, date: '2024-07-05',
    description: 'Salário Mensal', categoryId: 'c1', paymentMethod: 'Transferência', isInstallment: false,
  },
  // Despesas à vista
  {
    id: 't2', type: 'expense', amount: 1500, date: '2024-07-10',
    description: 'Aluguel', categoryId: 'c3', paymentMethod: 'Boleto', isInstallment: false,
  },
  {
    id: 't3', type: 'expense', amount: 800, date: '2024-07-15',
    description: 'Compras do Mês', categoryId: 'c4', paymentMethod: 'Crédito', isInstallment: false,
  },
  // Despesa Parcelada
  {
    id: 't4', type: 'expense', amount: 2400, date: '2024-05-20',
    description: 'Curso de Inglês', categoryId: 'c7', paymentMethod: 'Carnê', isInstallment: true,
    installments: { totalInstallments: 12, paidInstallments: 0, startDate: '2024-06-10' },
  },
   // Despesa Recorrente
  {
    id: 't7', type: 'expense', amount: 49.90, date: '2024-07-20',
    description: 'Assinatura Streaming', categoryId: 'c6', paymentMethod: 'Crédito', isInstallment: false, isRecurrent: true,
  },
];

export const MOCK_SHOPPING_CATEGORIES: ShoppingCategory[] = [
    { id: 'sc1', name: 'Mercearia' },
    { id: 'sc2', name: 'Higiene' },
    { id: 'sc3', name: 'Hortifruti' },
    { id: 'sc4', name: 'Açougue' },
];

export const MOCK_PRODUCTS: Product[] = [
    { id: 'p1', name: 'Arroz Integral 5kg', categoryId: 'sc1', unit: 'un' },
    { id: 'p2', name: 'Feijão Carioca 1kg', categoryId: 'sc1', unit: 'un' },
    { id: 'p3', name: 'Sabonete', categoryId: 'sc2', unit: 'un' },
    { id: 'p4', name: 'Maçã', categoryId: 'sc3', unit: 'kg' },
    { id: 'p5', name: 'Patinho moído', categoryId: 'sc4', unit: 'kg' },
    { id: 'p6', name: 'Shampoo', categoryId: 'sc2', unit: 'un' },
    { id: 'p7', name: 'Alface Crespa', categoryId: 'sc3', unit: 'un' },
];

export const MOCK_SHOPPING_LISTS: ShoppingList[] = [
    {
        id: 'sl1', name: 'Compras da Semana', status: 'andamento', createdAt: '2024-07-22',
        items: [
            { id: 'i1', productId: 'p1', name: 'Arroz Integral 5kg', quantity: 1, price: 25.50, checked: true, categoryId: 'sc1', unit: 'un' },
            { id: 'i2', productId: 'p4', name: 'Maçã', quantity: 1.5, price: 8.99, checked: false, categoryId: 'sc3', unit: 'kg' },
        ]
    },
    {
        id: 'sl2', name: 'Compras de Junho', status: 'finalizada', createdAt: '2024-06-15', completedAt: '2024-06-16', totalAmount: 157.80,
        items: []
    }
];