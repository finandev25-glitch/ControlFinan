import React from 'react';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
const formatDate = (date) => new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' });

const DetailedExpenseTable = ({ transactions }) => {
  if (transactions.length === 0) {
    return <p className="text-center text-slate-500 py-10">No hay gastos para mostrar con los filtros seleccionados.</p>;
  }

  return (
    <div className="overflow-y-auto h-[300px] pr-2">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50 sticky top-0">
          <tr>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha</th>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Descripción</th>
            <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Monto</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {transactions.map((t) => (
            <tr key={t.id} className="hover:bg-slate-50">
              <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500">{formatDate(t.date)}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-slate-800 truncate" title={t.description}>{t.description}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-semibold text-red-600">
                {formatCurrency(t.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DetailedExpenseTable;
