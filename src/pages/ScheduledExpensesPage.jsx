import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import ScheduledExpenseCard from '../components/ScheduledExpenseCard';
import AddScheduledExpenseModal from '../components/AddScheduledExpenseModal';

const ScheduledExpensesPage = ({ scheduledExpenses, onAddScheduledExpense, members, cajas }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Gastos Programados</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500"
          >
            <PlusCircle size={18} />
            Añadir Gasto
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {scheduledExpenses.map(expense => (
            <ScheduledExpenseCard
              key={expense.id}
              expense={expense}
              member={members.find(m => m.id === expense.memberId)}
              caja={cajas.find(c => c.id === expense.cajaId)}
            />
          ))}
          {scheduledExpenses.length === 0 && (
            <div className="md:col-span-2 xl:col-span-3 text-center py-16 rounded-lg bg-slate-50 border-2 border-dashed border-slate-200">
              <h3 className="text-lg font-medium text-slate-900">No hay gastos programados</h3>
              <p className="mt-1 text-sm text-slate-500">Añade tus gastos recurrentes para empezar a monitorearlos.</p>
            </div>
          )}
        </div>
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
