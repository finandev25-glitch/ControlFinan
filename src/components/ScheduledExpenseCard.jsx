import React from 'react';
import { Calendar, User, Wallet, RefreshCw } from 'lucide-react';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const InfoLine = ({ icon: Icon, value }) => (
  <div className="flex items-center gap-1.5 text-xs text-slate-500">
    <Icon size={14} />
    <span>{value}</span>
  </div>
);

const ScheduledExpenseCard = ({ expense, member, caja, icon: Icon }) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-slate-800 flex-1 pr-2">{expense.description}</h4>
          <div className="flex items-center gap-2">
            {expense.is_automatic && (
              <span title="Automático" className="flex-shrink-0 flex items-center gap-1 text-xs font-medium bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                <RefreshCw size={12} />
              </span>
            )}
            <Icon size={18} className="text-slate-400" />
          </div>
        </div>
        <p className="text-2xl font-bold text-red-500 mb-3">
          {expense.is_credit_card_payment && expense.amount === 0 
            ? <span className="text-lg text-slate-400 italic">Por calcular</span> 
            : formatCurrency(expense.amount)}
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <InfoLine icon={Calendar} value={`Día de pago: ${expense.day_of_month}`} />
          {member && <InfoLine icon={User} value={member.name} />}
          {caja && <InfoLine icon={Wallet} value={caja.name} />}
        </div>
      </div>
    </div>
  );
};

export default ScheduledExpenseCard;
