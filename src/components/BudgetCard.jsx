import React from 'react';
import { Target } from 'lucide-react';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const BudgetCard = ({ budget, categoryIconMap }) => {
  const { category, limit_amount: limit, spent } = budget;
  
  const remaining = limit - spent;
  const progress = limit > 0 ? (spent / limit) * 100 : 0;
  const Icon = categoryIconMap[category] || Target;

  let progressBarColor = 'bg-green-500';
  if (progress > 85) {
    progressBarColor = 'bg-red-500';
  } else if (progress > 50) {
    progressBarColor = 'bg-amber-500';
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-primary-300 transition-all duration-300">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 rounded-full bg-primary-100">
          <Icon className="h-6 w-6 text-primary-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">{category}</h3>
      </div>

      <div className="space-y-3">
        <div className="w-full bg-slate-200 rounded-full h-2.5">
          <div 
            className={`${progressBarColor} h-2.5 rounded-full transition-all duration-500`} 
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="font-medium text-slate-500">Gastado</span>
          <span className="font-semibold text-slate-800">{formatCurrency(spent)}</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="font-medium text-slate-500">Presupuestado</span>
          <span className="font-semibold text-slate-800">{formatCurrency(limit)}</span>
        </div>

        <hr className="border-slate-200" />

        <div className="flex justify-between items-center text-sm">
          <span className="font-bold text-slate-600">Restante</span>
          <span className={`font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(remaining)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BudgetCard;
