import React from 'react';
import { X } from 'lucide-react';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
const formatDate = (date) => new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

const TransactionDetailModal = ({ isOpen, onClose, title, transactions }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl m-4 relative transform transition-all" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Detalle de Movimientos</h2>
        <p className="text-slate-500 mb-6">{title}</p>
        
        <div className="overflow-y-auto max-h-[60vh] pr-2">
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((t) => (
                <div key={t.id} className="bg-slate-50 p-4 rounded-lg flex justify-between items-center border border-slate-200">
                  <div>
                    <p className="font-medium text-slate-800">{t.description}</p>
                    <p className="text-sm text-slate-500">{t.memberName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">{formatCurrency(t.amount)}</p>
                    <p className="text-sm text-slate-500">{formatDate(t.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-10 text-slate-500">No se encontraron movimientos.</p>
          )}
        </div>

        <div className="pt-6 flex justify-end">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-6 py-2.5 text-sm font-semibold text-white bg-primary-600 border border-transparent rounded-full shadow-sm hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailModal;
