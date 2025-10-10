import React from 'react';
import { Tag, Calendar, User, Wallet, RefreshCw } from 'lucide-react';
import { expenseCategories } from '../data/constants';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const InfoLine = ({ icon: Icon, value }) => (
  <div className="flex items-center gap-1.5 text-xs text-slate-500">
    <Icon size={14} />
    <span>{value}</span>
  </div>
);

const ScheduledExpenseCard = ({ expense, member, caja }) => {
  const category = expenseCategories.find(c => c.name === expense.categoria);
  const CategoryIcon = category?.icon || Tag;

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-slate-800 flex-1 pr-2">{expense.descripcion}</h4>
          <div className="flex items-center gap-2">
            {expense.es_automatico && (
              <span title="Automático" className="flex-shrink-0 flex items-center gap-1 text-xs font-medium bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                <RefreshCw size={12} />
              </span>
            )}
            <CategoryIcon size={18} className="text-slate-400" />
          </div>
        </div>
        <p className="text-2xl font-bold text-red-500 mb-3">
          {expense.es_pago_tarjeta && expense.monto === 0 
            ? <span className="text-lg text-slate-400 italic">Por calcular</span> 
            : formatCurrency(expense.monto)}
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <InfoLine icon={Calendar} value={`Día de pago: ${expense.dia_del_mes}`} />
          {member && <InfoLine icon={User} value={member.name} />}
          {caja && <InfoLine icon={Wallet} value={caja.name} />}
        </div>
      </div>
    </div>
  );
};

export default ScheduledExpenseCard;
