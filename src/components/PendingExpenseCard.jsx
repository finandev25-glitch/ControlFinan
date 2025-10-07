import React from 'react';
import { CheckCircle, Tag, Calendar, User, Wallet } from 'lucide-react';
import { expenseCategories } from '../data/mockData';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const InfoLine = ({ icon: Icon, value }) => (
  <div className="flex items-center gap-1.5 text-xs text-slate-500">
    <Icon size={12} />
    <span>{value}</span>
  </div>
);

const PendingExpenseCard = ({ expense, onConfirm, member, caja }) => {
  const category = expenseCategories.find(c => c.name === expense.category);
  const CategoryIcon = category?.icon || Tag;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-2">
            <h4 className="font-bold text-slate-800">{expense.description}</h4>
            <CategoryIcon size={18} className="text-slate-400" />
        </div>
        <p className="text-xl font-bold text-red-500 mb-3">{formatCurrency(expense.amount)}</p>
        <div className="space-y-1.5">
            <InfoLine icon={Calendar} value={`Vence el día ${expense.dayOfMonth}`} />
            {member && <InfoLine icon={User} value={member.name} />}
            {caja && <InfoLine icon={Wallet} value={caja.name} />}
        </div>
      </div>
      <button
        onClick={() => onConfirm(expense.id)}
        className="w-full mt-4 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500"
      >
        <CheckCircle size={16} />
        Confirmar Gasto
      </button>
    </div>
  );
};

export default PendingExpenseCard;
