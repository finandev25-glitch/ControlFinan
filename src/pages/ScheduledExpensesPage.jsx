import React, { useState, useMemo } from 'react';
import { PlusCircle } from 'lucide-react';
import AddScheduledExpenseModal from '../components/AddScheduledExpenseModal';
import PeriodSelector from '../components/PeriodSelector';
import ScheduledExpenseCard from '../components/ScheduledExpenseCard';

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
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const monthlyProjectedExpenses = useMemo(() => {
    return scheduledExpenses.map(exp => {
      let amount = exp.amount;
      if (exp.isCreditCardPayment) {
        const creditCard = cajas.find(c => c.id === exp.creditCardId);
        amount = getCreditCardDebtForCycle(creditCard, transactions, selectedYear, selectedMonth);
      }
      return { ...exp, amount };
    }).sort((a, b) => b.dayOfMonth - a.dayOfMonth); // Ordenado por día de forma descendente
  }, [scheduledExpenses, cajas, transactions, selectedYear, selectedMonth]);

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Gastos Programados del Mes</h1>
            <p className="mt-1 text-slate-500">Revisa tus compromisos financieros para el período seleccionado.</p>
          </div>
          <div className="flex items-center gap-4">
            <PeriodSelector
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
              Añadir Gasto Manual
            </button>
          </div>
        </div>

        {monthlyProjectedExpenses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {monthlyProjectedExpenses.map(expense => {
              const member = members.find(m => m.id === expense.memberId);
              const caja = cajas.find(c => c.id === expense.cajaId);
              return (
                <ScheduledExpenseCard
                  key={expense.id}
                  expense={expense}
                  member={member}
                  caja={caja}
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
      />
    </>
  );
};

export default ScheduledExpensesPage;
