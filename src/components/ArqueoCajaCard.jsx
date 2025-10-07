import React from 'react';
import { Calculator } from 'lucide-react';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const ArqueoCajaCard = ({ caja, realBalance, onRealBalanceChange, onAdjust, onOpenCounter }) => {
  const { id, name, icon: Icon, calculatedBalance, type } = caja;
  const real = parseFloat(realBalance) || 0;
  const difference = real - calculatedBalance;

  let differenceColor = 'text-slate-500';
  if (difference > 0) differenceColor = 'text-green-600';
  if (difference < 0) differenceColor = 'text-red-600';

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-primary-100">
            <Icon className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">{name}</h3>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="font-medium text-slate-500">Saldo Calculado</span>
          <span className="font-bold text-slate-800 text-base">{formatCurrency(calculatedBalance)}</span>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor={`real-balance-${id}`} className="block text-sm font-medium text-slate-500">Saldo Real (S/)</label>
            {type === 'Efectivo' && (
              <button onClick={() => onOpenCounter(id)} className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-800">
                <Calculator size={14} />
                Contar Dinero
              </button>
            )}
          </div>
          <input
            type="number"
            id={`real-balance-${id}`}
            value={realBalance}
            onChange={(e) => onRealBalanceChange(id, e.target.value)}
            placeholder="0.00"
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>

        <div className="flex justify-between items-center border-t border-slate-200 pt-3">
          <span className="font-bold text-slate-600">Diferencia</span>
          <span className={`font-bold text-base ${differenceColor}`}>{formatCurrency(difference)}</span>
        </div>
      </div>

      <button
        onClick={() => onAdjust(id)}
        disabled={difference === 0}
        className="w-full mt-2 px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 border border-transparent rounded-lg shadow-sm hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 disabled:bg-slate-300 disabled:cursor-not-allowed"
      >
        Ajustar
      </button>
    </div>
  );
};

export default ArqueoCajaCard;
