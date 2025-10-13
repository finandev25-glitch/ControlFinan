import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
const formatDate = (date) => new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

const TransactionList = ({ transactions }) => {
  if (transactions.length === 0) {
    return <p className="text-center text-sm text-slate-500 py-8">No hay consumos en este período.</p>;
  }
  return (
    <div className="space-y-2">
      {transactions.map(t => (
        <div key={t.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-md">
          <div>
            <p className="text-sm font-medium text-slate-800">{t.description}</p>
            <p className="text-xs text-slate-500">{formatDate(t.date)}</p>
          </div>
          <p className="text-sm font-semibold text-red-600">{formatCurrency(t.amount)}</p>
        </div>
      ))}
    </div>
  );
};

const CreditCardDetailModal = ({ isOpen, onClose, card, transactions }) => {
  const [activeTab, setActiveTab] = useState('current');

  const { currentCycle, nextCycle } = useMemo(() => {
    if (!card) return { currentCycle: { transactions: [], total: 0 }, nextCycle: { transactions: [], total: 0 } };

    const today = new Date();
    const closingDay = card.closing_day;

    // Current billing cycle
    let currentCycleEndDate = new Date(today.getFullYear(), today.getMonth(), closingDay);
    if (today.getDate() > closingDay) {
        currentCycleEndDate = new Date(today.getFullYear(), today.getMonth() + 1, closingDay);
    }
    let currentCycleStartDate = new Date(currentCycleEndDate);
    currentCycleStartDate.setMonth(currentCycleStartDate.getMonth() - 1);
    currentCycleStartDate.setDate(currentCycleStartDate.getDate() + 1);

    // Next billing cycle (for charges made after the current cycle's end)
    let nextCycleStartDate = new Date(currentCycleEndDate);
    nextCycleStartDate.setDate(nextCycleStartDate.getDate() + 1);
    let nextCycleEndDate = new Date(nextCycleStartDate);
    nextCycleEndDate.setMonth(nextCycleEndDate.getMonth() + 1);

    const filterTransactionsForCycle = (start, end) => {
        return transactions.filter(t => {
            const txDate = new Date(t.date);
            return t.caja_id === card.id && t.type === 'Gasto' && txDate >= start && txDate <= end;
        });
    };
    
    const currentTransactions = filterTransactionsForCycle(currentCycleStartDate, currentCycleEndDate);
    const nextTransactions = filterTransactionsForCycle(nextCycleStartDate, nextCycleEndDate);

    return {
      currentCycle: {
        transactions: currentTransactions,
        total: currentTransactions.reduce((sum, t) => sum + t.amount, 0),
      },
      nextCycle: {
        transactions: nextTransactions,
        total: nextTransactions.reduce((sum, t) => sum + t.amount, 0),
      },
    };
  }, [card, transactions]);

  if (!isOpen || !card) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl m-4 relative transform transition-all" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Detalle de {card.name}</h2>
        <p className="text-slate-500 mb-6">Consumos por ciclo de facturación.</p>
        
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('current')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'current' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Facturación Actual
            </button>
            <button
              onClick={() => setActiveTab('next')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'next' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Próxima Facturación
            </button>
          </nav>
        </div>

        <div className="py-6 max-h-[50vh] overflow-y-auto pr-2">
          {activeTab === 'current' && <TransactionList transactions={currentCycle.transactions} />}
          {activeTab === 'next' && <TransactionList transactions={nextCycle.transactions} />}
        </div>
        
        <div className="mt-4 border-t border-slate-200 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-base font-bold text-slate-800">
              Total {activeTab === 'current' ? 'Facturación Actual' : 'Próxima Facturación'}:
            </span>
            <span className="text-xl font-bold text-primary-600">
              {formatCurrency(activeTab === 'current' ? currentCycle.total : nextCycle.total)}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreditCardDetailModal;
