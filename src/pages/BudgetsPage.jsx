import React, { useState, useMemo } from 'react';
import { PlusCircle, Tag } from 'lucide-react';
import BudgetCard from '../components/BudgetCard';
import AddBudgetModal from '../components/AddBudgetModal';
import PeriodSelector from '../components/PeriodSelector';
import { startOfMonth, endOfMonth } from 'date-fns';
import * as Icons from 'lucide-react';
import DeleteBudgetModal from '../components/DeleteBudgetModal';

const BudgetsPage = ({ budgets, transactions, onSaveBudget, onDeleteBudget, categories, selectedYear, selectedMonth, onYearChange, onMonthChange, availableYears }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState(null);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const expenseCategories = useMemo(() => categories.filter(c => c.type === 'Gasto'), [categories]);

  const categoryIconMap = useMemo(() => {
    return categories.reduce((acc, cat) => {
      const IconComponent = Icons[cat.icon_name] || Icons.Tag;
      acc[cat.name] = IconComponent;
      return acc;
    }, {});
  }, [categories]);

  const budgetsWithSpending = useMemo(() => {
    const selectedDate = new Date(selectedYear, selectedMonth);
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);

    const monthlyTransactions = transactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate >= monthStart && txDate <= monthEnd;
    });

    const monthlyBudgets = budgets.filter(b => b.year === selectedYear && b.month === selectedMonth);

    return monthlyBudgets.map(budget => {
      const spent = monthlyTransactions
        .filter(t => t.type === 'Gasto' && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return { ...budget, spent };
    });
  }, [budgets, transactions, selectedYear, selectedMonth]);

  const handleOpenEditModal = (budget) => {
    setBudgetToEdit(budget);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (budget) => {
    setBudgetToDelete(budget);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (budgetToDelete) {
      onDeleteBudget(budgetToDelete.id);
    }
    setIsDeleteModalOpen(false);
    setBudgetToDelete(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setBudgetToEdit(null);
  };

  const handleSave = (data) => {
    const budgetData = {
      ...data,
      year: selectedYear,
      month: selectedMonth,
    };
    if (budgetToEdit) {
      budgetData.id = budgetToEdit.id;
    }
    onSaveBudget(budgetData);
    handleCloseModal();
  };

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              <span className="hidden sm:inline">Presupuestos Mensuales</span>
              <span className="sm:hidden">Presupuestos</span>
            </h1>
            <p className="mt-1 text-slate-500">Define límites y monitorea tus gastos por mes.</p>
          </div>
          <div className="flex items-center gap-4">
            <PeriodSelector availableYears={availableYears} selectedYear={selectedYear} selectedMonth={selectedMonth} onYearChange={onYearChange} onMonthChange={onMonthChange} />
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
            <BudgetCard 
              key={budget.id} 
              budget={budget} 
              categoryIconMap={categoryIconMap}
              onEdit={() => handleOpenEditModal(budget)}
              onDelete={() => handleOpenDeleteModal(budget)}
            />
          ))}
           {budgetsWithSpending.length === 0 && (
            <div className="md:col-span-2 xl:col-span-3 text-center py-16 rounded-lg bg-slate-50 border-2 border-dashed border-slate-200">
                <h3 className="text-lg font-medium text-slate-900">Aún no hay presupuestos</h3>
                <p className="mt-1 text-sm text-slate-500">Empieza creando uno para monitorear tus gastos.</p>
            </div>
           )}
        </div>
      </div>
      <AddBudgetModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        existingBudgets={budgetsWithSpending}
        expenseCategories={expenseCategories}
        categoryIconMap={categoryIconMap}
        budgetToEdit={budgetToEdit}
      />
      <DeleteBudgetModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        budgetName={budgetToDelete?.category}
      />
    </>
  );
};

export default BudgetsPage;
