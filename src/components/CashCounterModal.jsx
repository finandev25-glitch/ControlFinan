import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const denominations = [
  { type: 'billete', value: 200 },
  { type: 'billete', value: 100 },
  { type: 'billete', value: 50 },
  { type: 'billete', value: 20 },
  { type: 'billete', value: 10 },
  { type: 'moneda', value: 5 },
  { type: 'moneda', value: 2 },
  { type: 'moneda', value: 1 },
  { type: 'moneda', value: 0.50 },
  { type: 'moneda', value: 0.20 },
  { type: 'moneda', value: 0.10 },
];

const DenominationRow = ({ item, count, onChange }) => {
  const subtotal = (parseInt(count) || 0) * item.value;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-16 text-right font-medium text-slate-600">
        S/ {item.value.toFixed(2)}
      </span>
      <input
        type="number"
        value={count}
        onChange={(e) => onChange(item.value, e.target.value)}
        className="w-20 text-center px-1 py-1 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        placeholder="0"
      />
      <span className="w-20 text-right font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
    </div>
  );
};

const CashCounterModal = ({ isOpen, onClose, onConfirm }) => {
  const [counts, setCounts] = useState({});

  const total = useMemo(() => {
    return denominations.reduce((acc, item) => {
      const quantity = parseInt(counts[item.value]) || 0;
      return acc + quantity * item.value;
    }, 0);
  }, [counts]);

  const billetes = denominations.filter(d => d.type === 'billete');
  const monedas = denominations.filter(d => d.type === 'moneda');

  if (!isOpen) return null;

  const handleCountChange = (value, quantity) => {
    setCounts(prev => ({
      ...prev,
      [value]: quantity,
    }));
  };

  const handleConfirm = () => {
    onConfirm(total);
    setCounts({});
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xl m-4 relative transform transition-all" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors">
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold text-slate-800 mb-1">Contador de Efectivo</h2>
        <p className="text-sm text-slate-500 mb-4">Cuenta tus billetes y monedas.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 max-h-[50vh] overflow-y-auto pr-4">
          {/* Columna de Billetes */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-700 text-center border-b pb-1 mb-2">Billetes</h3>
            {billetes.map(item => (
              <DenominationRow 
                key={item.value}
                item={item}
                count={counts[item.value] || ''}
                onChange={handleCountChange}
              />
            ))}
          </div>

          {/* Columna de Monedas */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-700 text-center border-b pb-1 mb-2">Monedas</h3>
            {monedas.map(item => (
              <DenominationRow 
                key={item.value}
                item={item}
                count={counts[item.value] || ''}
                onChange={handleCountChange}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 border-t border-slate-200 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-slate-800">Total Contado:</span>
            <span className="text-lg font-bold text-primary-600">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 border border-transparent rounded-full hover:bg-slate-200"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            onClick={handleConfirm} 
            className="px-5 py-2 text-xs font-semibold text-white bg-primary-600 border border-transparent rounded-full shadow-sm hover:bg-primary-700"
          >
            Confirmar Total
          </button>
        </div>
      </div>
    </div>
  );
};

export default CashCounterModal;
