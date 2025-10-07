import React from 'react';
import ExpenseChart from './ExpenseChart';
import { ArrowUp, ArrowDown, Scale, TrendingUp, TrendingDown } from 'lucide-react';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const StatLine = ({ icon: Icon, label, value, colorClass }) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${colorClass}`} />
            <span className="text-sm font-medium text-slate-600">{label}</span>
        </div>
        <span className={`text-sm font-semibold ${colorClass}`}>{formatCurrency(value)}</span>
    </div>
);

const MonthlyComparisonCard = ({ title, stats, balanceChange }) => {
  const hasBalanceChange = typeof balanceChange !== 'undefined';
  const isBalanceImproved = hasBalanceChange && balanceChange >= 0;
  
  const ChangeIcon = isBalanceImproved ? TrendingUp : TrendingDown;
  const changeColor = isBalanceImproved ? 'text-green-600' : 'text-red-600';

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col justify-center space-y-3">
            <StatLine icon={ArrowUp} label="Ingresos" value={stats.income} colorClass="text-green-600" />
            <StatLine icon={ArrowDown} label="Gastos" value={stats.expenses} colorClass="text-red-600" />
            <hr className="my-2 border-slate-200" />
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-primary-600" />
                    <span className="text-sm font-bold text-slate-800">Balance</span>
                </div>
                <span className="text-lg font-bold text-slate-800">{formatCurrency(stats.balance)}</span>
            </div>
            {hasBalanceChange && (
              <div className="flex items-center gap-2 text-xs">
                <ChangeIcon size={14} className={changeColor} />
                <span className={changeColor}>
                  {isBalanceImproved ? '+' : ''}{formatCurrency(balanceChange)}
                </span>
                <span className="text-slate-500">vs mes anterior</span>
              </div>
            )}
        </div>
        <div>
          {stats.distributionData.length > 0 ? (
            <ExpenseChart data={stats.distributionData} height="150px" />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-slate-400">
                Sin datos de gastos
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthlyComparisonCard;
