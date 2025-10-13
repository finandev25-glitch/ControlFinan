import { faker } from '@faker-js/faker';

export const members = [
  { id: 1, name: 'Elena Rodriguez', avatar: faker.image.avatar(), role: 'Aportante Principal' },
  { id: 2, name: 'Carlos Gomez', avatar: faker.image.avatar(), role: 'Aportante' },
  { id: 3, name: 'Ana Lopez', avatar: faker.image.avatar(), role: 'Dependiente' },
];

export const categories = [
  // Gastos
  { name: 'Alimentación', type: 'Gasto', icon_name: 'ShoppingBasket' },
  { name: 'Transporte', type: 'Gasto', icon_name: 'Car' },
  { name: 'Vivienda', type: 'Gasto', icon_name: 'Home' },
  { name: 'Ocio', type: 'Gasto', icon_name: 'Smile' },
  { name: 'Salud', type: 'Gasto', icon_name: 'HeartPulse' },
  { name: 'Educación', type: 'Gasto', icon_name: 'GraduationCap' },
  { name: 'Servicios', type: 'Gasto', icon_name: 'Home' },
  { name: 'Suscripciones', type: 'Gasto', icon_name: 'Smile' },
  // Ingresos
  { name: 'Nómina', type: 'Ingreso', icon_name: 'Briefcase' },
  { name: 'Beneficios', type: 'Ingreso', icon_name: 'Landmark' },
  { name: 'Ventas', type: 'Ingreso', icon_name: 'TrendingUp' },
  { name: 'Regalo', type: 'Ingreso', icon_name: 'Gift' },
  // Común
  { name: 'Otros', type: 'Ingreso', icon_name: 'MoreHorizontal' },
  { name: 'Otros', type: 'Gasto', icon_name: 'MoreHorizontal' },
];

export const cajas = [
    { 
      id: 1, 
      type: 'Efectivo',
      name: 'Billetera',
      member_id: null,
    },
    { 
      id: 2, 
      type: 'Cuenta Bancaria',
      name: 'Cuenta Sueldo BCP',
      bank: 'Banco de Crédito del Perú (BCP)',
      alias: 'Cuenta Corriente',
      currency: 'PEN',
      account_number: '191-XXXXXXXX-0-XX',
      member_id: 1,
    },
    { 
      id: 3, 
      type: 'Tarjeta de Crédito',
      name: 'Tarjeta Signature',
      bank: 'Interbank',
      card_number: '**** **** **** 5678',
      credit_line: 15000,
      closing_day: 25,
      payment_due_date: 15,
      member_id: 1,
    },
    { 
      id: 4, 
      type: 'Préstamos',
      name: 'Préstamo Vehicular',
      bank: 'BBVA Perú',
      loan_purpose: 'Compra de auto',
      total_installments: 48,
      paid_installments: 12,
      payment_day: 5,
      monthly_payment: 1200,
      member_id: 2,
    },
];

export const budgets = [
  { category: 'Alimentación', limit_amount: 1500 },
  { category: 'Transporte', limit_amount: 400 },
  { category: 'Ocio', limit_amount: 600 },
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

const incomeCategoriesNames = categories.filter(c => c.type === 'Ingreso').map(c => c.name);
const expenseCategoriesNames = categories.filter(c => c.type === 'Gasto').map(c => c.name);

export const transactions = Array.from({ length: 250 }, (_, i) => {
  const contributingMembers = members.filter(m => m.role !== 'Dependiente');
  const member = faker.helpers.arrayElement(contributingMembers);
  
  const memberCajas = cajas.map(c => ({...c, memberId: c.member_id})).filter(c => c.memberId === member.id || c.type === 'Efectivo');
  const caja = faker.helpers.arrayElement(memberCajas.length > 0 ? memberCajas : cajas);
  
  const type = faker.helpers.arrayElement(['Ingreso', 'Gasto']);
  let amount;
  let category;
  let description;

  if (type === 'Ingreso') {
    amount = faker.number.int({ min: 100, max: 1500 });
    category = faker.helpers.arrayElement(incomeCategoriesNames);
    description = 'Ingreso de ' + category.toLowerCase();
  } else {
    amount = faker.number.int({ min: 10, max: 200 });
    category = faker.helpers.arrayElement(expenseCategoriesNames);
    description = faker.commerce.productName();
  }
  
  return {
    id: i + 1,
    date: faker.date.between({ from: '2025-01-01', to: '2025-10-31' }),
    description: description,
    memberId: member.id,
    cajaId: caja.id,
    type: type,
    category: category,
    amount: amount,
  };
});
