import React from 'react';
import { Tag, Calendar } from 'lucide-react';
import { expenseCategories, incomeCategories } from '../data/constants';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
const formatDate = (date) => new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });

const typeDetails = {
  'Ingreso': {
    textColor: 'text-green-600',
    sign: '+'
  },
  'Gasto': {
    textColor: 'text-red-600',
    sign: '-'
  }
};

const categoryIconMap = [...expenseCategories, ...incomeCategories].reduce((acc, cat) => {
    acc[cat.name] = cat.icon;
    return acc;
}, {});

const TransactionCard = ({ transaction, cajas }) => {
  const cajaMap = React.useMemo(() => cajas.reduce((acc, caja) => {
      acc[caja.id] = caja;
      return acc;
  }, {}), [cajas]);

  const details = typeDetails[transaction.tipo];
  if (!details) return null;

  const CategoryIcon = categoryIconMap[transaction.categoria] || Tag;
  const caja = cajaMap[transaction.caja_id];
  const CajaIcon = caja?.icon || Tag;

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-4 hover:shadow-md hover:border-primary-300 transition-all duration-300">
      <div className="flex items-center gap-4 flex-grow min-w-0">
        <img src={transaction.memberAvatar} alt={transaction.memberName} className="h-10 w-10 rounded-full flex-shrink-0" />
        <div className="flex-grow min-w-0">
          <p className="font-bold text-slate-800 text-md truncate">{transaction.descripcion}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              {formatDate(transaction.fecha)}
            </span>
            {transaction.categoria && transaction.categoria !== 'Transferencia' && (
              <span className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-2 py-0.5 font-medium rounded-md border border-slate-200">
                <CategoryIcon size={12} />
                {transaction.categoria}
              </span>
            )}
             {caja && (
              <span className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-2 py-0.5 font-medium rounded-md border border-slate-200">
                <CajaIcon size={12} />
                {caja.name}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="text-right flex-shrink-0 pl-2">
        <p className={`font-bold text-lg ${details.textColor}`}>
          {details.sign}{formatCurrency(transaction.monto)}
        </p>
        <p className="text-xs text-slate-500">{transaction.memberName}</p>
      </div>
    </div>
  );
};

export default TransactionCard;
