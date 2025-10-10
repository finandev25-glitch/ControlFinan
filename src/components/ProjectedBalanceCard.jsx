import React from 'react';
import { Scale, CalendarClock, Wallet, List } from 'lucide-react';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const StatLine = ({ icon: Icon, label, value, colorClass, isBold = false, onClick }) => (
    <div className={`flex items-center justify-between ${onClick ? 'cursor-pointer hover:bg-slate-50 -mx-2 px-2 py-1 rounded-lg' : ''}`} onClick={onClick}>
        <div className="flex items-center gap-3">
            <Icon className={`h-6 w-6 ${colorClass}`} />
            <span className={`text-sm font-medium ${isBold ? 'text-slate-800 font-bold' : 'text-slate-600'}`}>{label}</span>
        </div>
        <div className="flex items-center gap-2">
            <span className={`text-base font-semibold ${colorClass} ${isBold ? 'text-lg font-bold' : ''}`}>{formatCurrency(value)}</span>
            {onClick && <List size={16} className="text-slate-400" />}
        </div>
    </div>
);

const ProjectedBalanceCard = ({ data, onDetailsClick }) => {
  if (!data) return null;

  const { currentBalance, projectedExpenses, availableBalance } = data;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm h-full flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Saldo Proyectado</h2>
        <div className="space-y-3">
            <StatLine icon={Scale} label="Balance Actual" value={currentBalance} colorClass="text-slate-800" />
            <StatLine 
              icon={CalendarClock} 
              label="Gastos Proyectados" 
              value={-projectedExpenses} 
              colorClass="text-red-600" 
              onClick={onDetailsClick}
            />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-200">
        <StatLine 
            icon={Wallet} 
            label="Saldo Disponible" 
            value={availableBalance} 
            colorClass={availableBalance >= 0 ? "text-green-600" : "text-red-600"} 
            isBold={true} 
        />
      </div>
    </div>
  );
};

export default ProjectedBalanceCard;
