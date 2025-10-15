import React from 'react';
import { Bell, CheckCircle } from 'lucide-react';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const PendingExpensesSection = ({ pendingExpenses, onReviewExpense, members }) => {
  if (!pendingExpenses || pendingExpenses.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm text-center h-full flex flex-col justify-center items-center">
        <div className="p-4 bg-green-100 rounded-full">
            <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="mt-4 text-md font-semibold text-slate-900">Todo en Orden</h3>
        <p className="mt-1 text-sm text-slate-500">No hay gastos programados por confirmar.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm h-full flex flex-col">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Acciones Rápidas</h2>
      <div className="space-y-3 flex-grow overflow-y-auto pr-2">
        {pendingExpenses.map(expense => {
          const member = members.find(m => m.id === expense.member_id);
          return (
            <div key={expense.id} className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-amber-900 text-sm">{expense.description}</p>
                <p className="text-xs text-amber-700">
                  {member ? member.name : 'General'} - {formatCurrency(expense.amount)}
                </p>
              </div>
              <button
                onClick={() => onReviewExpense(expense)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-full shadow-sm hover:bg-green-700"
              >
                <CheckCircle size={14} />
                Confirmar
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PendingExpensesSection;
