import React from 'react';
import { Tag, Calendar, User, Wallet } from 'lucide-react';
import { expenseCategories } from '../data/mockData';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const InfoLine = ({ icon: Icon, value }) => (
  <div className="flex items-center gap-1.5 text-sm text-slate-600">
    <Icon size={14} className="text-slate-400" />
    <span>{value}</span>
  </div>
);

const ScheduledExpenseCard = ({ expense, member, caja }) => {
  const category = expenseCategories.find(c => c.name === expense.category);
  const CategoryIcon = category?.icon || Tag;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-primary-300 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">{expense.description}</h3>
          <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(expense.amount)}</p>
        </div>
        <div className="p-3 rounded-full bg-primary-100">
          <CategoryIcon className="h-6 w-6 text-primary-600" />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
        <InfoLine icon={Calendar} value={`Día de pago: ${expense.dayOfMonth} de cada mes`} />
        {member && <InfoLine icon={User} value={`Responsable: ${member.name}`} />}
        {caja && <InfoLine icon={Wallet} value={`Caja: ${caja.name}`} />}
      </div>
    </div>
  );
};

export default ScheduledExpenseCard;
