import React, { useState, useMemo } from 'react';
import { PlusCircle, Tag } from 'lucide-react';
import AddScheduledExpenseModal from '../components/AddScheduledExpenseModal';
import PeriodSelector from '../components/PeriodSelector';
import ScheduledExpenseCard from '../components/ScheduledExpenseCard';
import * as Icons from 'lucide-react';

const getCreditCardDebtForCycle = (creditCard, transactions, year, month) => {
  if (!creditCard) return 0;
  const closingDay = creditCard.closingDay;
  const cycleEndDate = new Date(year, month, closingDay);
  const cycleStartDate = new Date(cycleEndDate);
  cycleStartDate.setMonth(cycleStartDate.getMonth() - 1);
  cycleStartDate.setDate(cycleStartDate.getDate() + 1);

  const cycleTransactions = transactions.filter(t => {
      const txDate = new Date(t.date);
      return t.cajaId === creditCard.id &&
             t.type === 'Gasto' &&
             txDate >= cycleStartDate &&
             txDate <= cycleEndDate;
  });
  return cycleTransactions.reduce((s, t) => s + t.amount, 0);
};

const ScheduledExpensesPage = ({ 
  scheduledExpenses, 
  onAddScheduledExpense, 
  members, 
  cajas,
  transactions,
  categories,
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
  availableYears
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const expenseCategories = useMemo(() => categories.filter(c => c.type === 'Gasto'), [categories]);

  const categoryIconMap = useMemo(() => {
    return categories.reduce((acc, cat) => {
      const IconComponent = Icons[cat.icon_name] || Icons.Tag;
      acc[cat.name] = IconComponent;
      return acc;
    }, {});
  }, [categories]);

  const monthlyProjectedExpenses = useMemo(() => {
    return scheduledExpenses.map(exp => {
      let amount = exp.amount;
      if (exp.is_credit_card_payment) {
        const creditCard = cajas.find(c => c.id === exp.credit_card_id);
        amount = getCreditCardDebtForCycle(creditCard, transactions, selectedYear, selectedMonth);
      }
      return { ...exp, amount };
    }).sort((a, b) => b.day_of_month - a.day_of_month);
  }, [scheduledExpenses, cajas, transactions, selectedYear, selectedMonth]);

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              <span className="hidden sm:inline">Gastos Programados del Mes</span>
              <span className="sm:hidden">Gastos Programados</span>
            </h1>
            <p className="mt-1 text-slate-500">Revisa tus compromisos financieros para el período seleccionado.</p>
          </div>
          <div className="flex items-center gap-4">
            <PeriodSelector
              availableYears={availableYears}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onYearChange={onYearChange}
              onMonthChange={onMonthChange}
            />
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500"
            >
              <PlusCircle size={18} />
              Añadir Manual
            </button>
          </div>
        </div>

        {monthlyProjectedExpenses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {monthlyProjectedExpenses.map(expense => {
              const member = members.find(m => m.id === expense.member_id);
              const caja = cajas.find(c => c.id === expense.caja_id);
              const Icon = categoryIconMap[expense.category] || Tag;
              return (
                <ScheduledExpenseCard
                  key={expense.id}
                  expense={expense}
                  member={member}
                  caja={caja}
                  icon={Icon}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center p-16 rounded-lg bg-white border-2 border-dashed border-slate-200">
            <h3 className="text-lg font-medium text-slate-900">No hay gastos programados</h3>
            <p className="mt-1 text-sm text-slate-500">No se encontraron compromisos para este mes.</p>
          </div>
        )}
      </div>
      <AddScheduledExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onAddScheduledExpense}
        members={members.filter(m => m.role !== 'Dependiente')}
        cajas={cajas}
        expenseCategories={expenseCategories}
        categoryIconMap={categoryIconMap}
      />
    </>
  );
};

export default ScheduledExpensesPage;
