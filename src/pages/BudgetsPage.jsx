import React, { useState, useMemo } from 'react';
import { PlusCircle } from 'lucide-react';
import { expenseCategories } from '../data/constants';
import BudgetCard from '../components/BudgetCard';
import AddBudgetModal from '../components/AddBudgetModal';
import PeriodSelector from '../components/PeriodSelector';
import { startOfMonth, endOfMonth } from 'date-fns';

const BudgetsPage = ({ budgets, transactions, onSaveBudget, selectedYear, selectedMonth, onYearChange, onMonthChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const budgetsWithSpending = useMemo(() => {
    const selectedDate = new Date(selectedYear, selectedMonth);
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);

    const monthlyTransactions = transactions.filter(t => {
        const txDate = new Date(t.fecha);
        return txDate >= monthStart && txDate <= monthEnd;
    });

    return budgets.map(budget => {
      const spent = monthlyTransactions
        .filter(t => t.tipo === 'Gasto' && t.categoria === budget.categoria)
        .reduce((sum, t) => sum + t.monto, 0);
      
      const categoryInfo = expenseCategories.find(c => c.name === budget.categoria);

      return {
        ...budget,
        spent,
        icon: categoryInfo?.icon,
      };
    });
  }, [budgets, transactions, selectedYear, selectedMonth]);

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Presupuestos Mensuales</h1>
            <p className="mt-1 text-slate-500">Define límites y monitorea tus gastos por mes.</p>
          </div>
          <div className="flex items-center gap-4">
            <PeriodSelector selectedYear={selectedYear} selectedMonth={selectedMonth} onYearChange={onYearChange} onMonthChange={onMonthChange} />
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500"
            >
              <PlusCircle size={18} />
              Crear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {budgetsWithSpending.map(budget => (
            <BudgetCard key={budget.categoria} budget={budget} />
          ))}
           {budgets.length === 0 && (
            <div className="md:col-span-2 xl:col-span-3 text-center py-16 rounded-lg bg-slate-50 border-2 border-dashed border-slate-200">
                <h3 className="text-lg font-medium text-slate-900">Aún no hay presupuestos</h3>
                <p className="mt-1 text-sm text-slate-500">Empieza creando uno para monitorear tus gastos.</p>
            </div>
           )}
        </div>
      </div>
      <AddBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveBudget}
        existingBudgets={budgets}
      />
    </>
  );
};

export default BudgetsPage;
