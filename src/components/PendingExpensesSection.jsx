import React from 'react';
import { Bell, CheckCircle } from 'lucide-react';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const PendingExpensesSection = ({ pendingExpenses, onReviewExpense, members }) => {
  if (!pendingExpenses || pendingExpenses.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm text-center h-full flex flex-col justify-center">
        <Bell className="mx-auto h-10 w-10 text-slate-400" />
        <h3 className="mt-2 text-md font-medium text-slate-900">Todo en orden</h3>
        <p className="mt-1 text-sm text-slate-500">No hay gastos programados por confirmar.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Gastos por Confirmar</h2>
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {pendingExpenses.map(expense => {
          const member = members.find(m => m.id === expense.member_id);
          return (
            <div key={expense.id} className="bg-slate-50 p-3 rounded-lg flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-800 text-sm">{expense.description}</p>
                <p className="text-xs text-slate-500">
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
