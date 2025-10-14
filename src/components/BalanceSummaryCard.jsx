import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, Scale, ArrowLeftRight, List } from 'lucide-react';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const StatLine = ({ icon: Icon, label, value, colorClass, onClick }) => (
    <div className={`flex items-center justify-between ${onClick ? 'cursor-pointer hover:bg-slate-50 -mx-2 px-2 py-1 rounded-lg' : ''}`} onClick={onClick}>
        <div className="flex items-center gap-3">
            <Icon className={`h-6 w-6 ${colorClass}`} />
            <span className="text-sm font-medium text-slate-600">{label}</span>
        </div>
        <div className="flex items-center gap-2">
            <span className={`text-base font-semibold ${colorClass}`}>{formatCurrency(value)}</span>
            {onClick && <List size={16} className="text-slate-400" />}
        </div>
    </div>
);

const BalanceSummaryCard = ({ summary, onDetailsClick }) => {
  if (!summary) return null;
  const { totalIncome, totalExpenses, netTransfers, balance } = summary;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm h-full flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Balance General</h2>
        <div className="space-y-3">
            <StatLine icon={ArrowUpCircle} label="Ingresos Totales" value={totalIncome} colorClass="text-green-600" />
            <StatLine icon={ArrowDownCircle} label="Gastos Totales" value={totalExpenses} colorClass="text-red-600" />
            <hr className="my-2 border-slate-200/60" />
            <StatLine 
              icon={ArrowLeftRight} 
              label="Transferencias Netas" 
              value={netTransfers} 
              colorClass={netTransfers >= 0 ? "text-sky-600" : "text-orange-600"}
              onClick={onDetailsClick}
            />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Scale className="h-6 w-6 text-primary-600" />
                <span className="text-base font-bold text-slate-800">Balance General</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-slate-800">{formatCurrency(balance)}</span>
        </div>
      </div>
    </div>
  );
};

export default BalanceSummaryCard;
