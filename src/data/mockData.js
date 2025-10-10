import { faker } from '@faker-js/faker';
import { 
  ShoppingBasket, Car, Home, Smile, HeartPulse, GraduationCap, 
  Briefcase, TrendingUp, Gift, MoreHorizontal, Landmark
} from 'lucide-react';

// Generar miembros de la familia
export const members = [
  { id: 1, name: 'Elena Rodriguez', avatar: faker.image.avatar(), role: 'Aportante Principal' },
  { id: 2, name: 'Carlos Gomez', avatar: faker.image.avatar(), role: 'Aportante' },
  { id: 3, name: 'Ana Lopez', avatar: faker.image.avatar(), role: 'Dependiente' },
];

export const peruvianBanks = [
    'Banco de Crédito del Perú (BCP)',
    'Interbank',
    'Scotiabank Perú',
    'BBVA Perú',
    'Banco de la Nación',
    'MiBanco',
    'Banco Pichincha',
    'BanBif',
    'Caja Arequipa',
    'Caja Huancayo',
    'Caja Piura',
    'Otro'
];

export const expenseCategories = [
  { name: 'Alimentación', icon: ShoppingBasket },
  { name: 'Transporte', icon: Car },
  { name: 'Vivienda', icon: Home },
  { name: 'Ocio', icon: Smile },
  { name: 'Salud', icon: HeartPulse },
  { name: 'Educación', icon: GraduationCap },
  { name: 'Servicios', icon: Home },
  { name: 'Suscripciones', icon: Smile },
  { name: 'Otros', icon: MoreHorizontal },
];

export const incomeCategories = [
  { name: 'Nómina', icon: Briefcase },
  { name: 'Beneficios', icon: Landmark },
  { name: 'Ventas', icon: TrendingUp },
  { name: 'Regalo', icon: Gift },
  { name: 'Otros', icon: MoreHorizontal },
];

export const cajas = [
    { 
      id: 1, 
      type: 'Efectivo',
      name: 'Billetera',
      memberId: null, // Cash is general
    },
    { 
      id: 2, 
      type: 'Cuenta Bancaria',
      name: 'Cuenta Sueldo BCP',
      bank: 'Banco de Crédito del Perú (BCP)',
      alias: 'Cuenta Corriente',
      currency: 'PEN',
      accountNumber: '191-XXXXXXXX-0-XX',
      memberId: 1,
    },
    { 
      id: 3, 
      type: 'Tarjeta de Crédito',
      name: 'Tarjeta Signature',
      bank: 'Interbank',
      cardNumber: '**** **** **** 5678',
      creditLine: 15000,
      closingDay: 25,
      paymentDueDate: 15,
      memberId: 1,
    },
    { 
      id: 4, 
      type: 'Préstamos',
      name: 'Préstamo Vehicular',
      bank: 'BBVA Perú',
      loanPurpose: 'Compra de auto',
      totalInstallments: 48,
      paidInstallments: 12,
      paymentDay: 5,
      monthlyPayment: 1200,
      memberId: 2,
    },
];

export const budgets = [
  { category: 'Alimentación', limit: 1500 },
  { category: 'Transporte', limit: 400 },
  { category: 'Ocio', limit: 600 },
];

export const scheduledExpenses = [
  {
    id: 1,
    description: 'Suscripción a Netflix',
    amount: 50,
    category: 'Suscripciones',
    dayOfMonth: 15,
    memberId: 1,
    cajaId: 3,
    confirmedMonths: [],
  },
  {
    id: 2,
    description: 'Pago de Internet',
    amount: 120,
    category: 'Servicios',
    dayOfMonth: 20,
    memberId: 2,
    cajaId: 2,
    confirmedMonths: [],
  },
];

// Generar transacciones
const transactionTypes = ['Ingreso', 'Gasto'];
export const transactions = Array.from({ length: 250 }, (_, i) => {
  const contributingMembers = members.filter(m => m.role !== 'Dependiente');
  const member = faker.helpers.arrayElement(contributingMembers);
  
  const memberCajas = cajas.filter(c => c.memberId === member.id || c.type === 'Efectivo');
  const caja = faker.helpers.arrayElement(memberCajas.length > 0 ? memberCajas : cajas);
  
  const type = faker.helpers.arrayElement(transactionTypes);
  let amount;
  let category;
  let description;

  if (type === 'Ingreso') {
    amount = faker.number.int({ min: 100, max: 1500 });
    category = faker.helpers.arrayElement(incomeCategories).name;
    description = 'Ingreso de ' + category.toLowerCase();
  } else { // Gasto
    amount = faker.number.int({ min: 10, max: 200 });
    category = faker.helpers.arrayElement(expenseCategories).name;
    description = faker.commerce.productName();
  }
  
  return {
    id: i + 1,
    date: faker.date.between({ from: '2025-01-01', to: '2025-10-31' }),
    description: description,
    memberId: member.id,
    memberName: member.name,
    cajaId: caja.id,
    type: type,
    category: category,
    amount: amount,
  };
}).sort((a, b) => new Date(b.date) - new Date(a.date));
