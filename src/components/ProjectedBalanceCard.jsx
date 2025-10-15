import React from 'react';
import { Scale, CalendarClock, Wallet, List } from 'lucide-react';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const StatLine = ({ icon: Icon, label, value, colorClass, onClick }) => (
    <div className={`flex items-center justify-between py-2 ${onClick ? 'cursor-pointer hover:bg-slate-50 -mx-2 px-2 rounded-lg' : ''}`} onClick={onClick}>
        <div className="flex items-center gap-3">
            <Icon className={`h-5 w-5 ${colorClass}`} />
            <span className="text-sm font-medium text-slate-600">{label}</span>
        </div>
        <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${colorClass}`}>{formatCurrency(value)}</span>
            {onClick && <List size={14} className="text-slate-400" />}
        </div>
    </div>
);

const ProjectedBalanceCard = ({ data, onDetailsClick }) => {
  if (!data) return null;

  const { currentBalance, projectedExpenses, availableBalance } = data;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm h-full flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Proyección del Mes</h2>
        <div className="space-y-1">
            <StatLine icon={Scale} label="Balance Actual" value={currentBalance} colorClass="text-slate-800" />
            <StatLine 
              icon={CalendarClock} 
              label="Gastos Futuros" 
              value={-projectedExpenses} 
              colorClass="text-amber-600" 
              onClick={onDetailsClick}
            />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
        <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold text-slate-600">Saldo Disponible</span>
            <span className={`text-3xl font-bold ${availableBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(availableBalance)}
            </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectedBalanceCard;
