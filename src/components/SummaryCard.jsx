import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const SummaryCard = ({ title, amount, icon, colorClass, change, changeType, metricType }) => {
  const formattedAmount = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(amount);

  const changeColorMap = {
    good: 'text-green-600 bg-green-100',
    bad: 'text-red-600 bg-red-100',
    neutral: 'text-slate-600 bg-slate-100',
  };
  
  const isGood = changeType === 'good';
  let ChangeIcon;
  if (metricType === 'income') {
      ChangeIcon = isGood ? ArrowUp : ArrowDown;
  } else { // 'expense' or other
      ChangeIcon = isGood ? ArrowDown : ArrowUp;
  }

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-primary-300 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full bg-opacity-10 ${colorClass.bg}`}>
              {React.cloneElement(icon, { className: `h-6 w-6 ${colorClass.text}` })}
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">{title}</h3>
              <p className="text-2xl font-bold text-slate-800">{formattedAmount}</p>
            </div>
          </div>
        </div>
      </div>
      {change && (
        <div className="mt-4 flex items-center gap-2">
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${changeColorMap[changeType]}`}>
            <ChangeIcon size={12} />
            {change}
          </span>
          <span className="text-xs text-slate-500">vs período anterior</span>
        </div>
      )}
    </div>
  );
};

export default SummaryCard;
