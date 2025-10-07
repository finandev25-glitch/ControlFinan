import React from 'react';
import { Wallet, Landmark, CreditCard, University } from 'lucide-react';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const iconMap = {
  'Efectivo': Wallet,
  'Cuenta Bancaria': Landmark,
  'Tarjeta de Crédito': CreditCard,
  'Préstamos': University,
};

const BalanceLine = ({ icon: Icon, label, value }) => (
    <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
            <Icon className="h-6 w-6 text-slate-500" />
            <span className="text-sm font-medium text-slate-600">{label}</span>
        </div>
        <span className={`text-base font-semibold ${value >= 0 ? 'text-slate-800' : 'text-red-600'}`}>{formatCurrency(value)}</span>
    </div>
);

const CajaBalancesCard = ({ balances }) => {
  if (!balances) return null;

  const order = ['Efectivo', 'Cuenta Bancaria', 'Tarjeta de Crédito', 'Préstamos'];
  const sortedBalances = Object.entries(balances).sort(([a], [b]) => order.indexOf(a) - order.indexOf(b));

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm h-full flex flex-col">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Saldo por Tipo de Caja</h2>
      <div className="flex-grow flex flex-col justify-center">
        <div className="space-y-2">
            {sortedBalances.map(([type, balance]) => {
                const Icon = iconMap[type] || Wallet;
                return <BalanceLine key={type} icon={Icon} label={type} value={balance} />;
            })}
        </div>
      </div>
    </div>
  );
};

export default CajaBalancesCard;
