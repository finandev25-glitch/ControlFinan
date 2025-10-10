import React from 'react';
import { X, Calendar } from 'lucide-react';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const ProjectedExpensesModal = ({ isOpen, onClose, expenses }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg m-4 relative transform transition-all" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Detalle de Gastos Proyectados</h2>
        <p className="text-slate-500 mb-6">Estos son los gastos programados pendientes para el período seleccionado.</p>
        
        <div className="overflow-y-auto max-h-[60vh] pr-2">
          {expenses && expenses.length > 0 ? (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div key={expense.id} className="bg-slate-50 p-4 rounded-lg flex justify-between items-center border border-slate-200">
                  <div>
                    <p className="font-medium text-slate-800">{expense.description}</p>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                        <Calendar size={14} />
                        <span>Vence el día {expense.dayOfMonth}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">{formatCurrency(expense.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-10 text-slate-500">No se encontraron gastos proyectados.</p>
          )}
        </div>

        <div className="pt-6 flex justify-end">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-6 py-2.5 text-sm font-semibold text-white bg-primary-600 border border-transparent rounded-full shadow-sm hover:bg-primary-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectedExpensesModal;
