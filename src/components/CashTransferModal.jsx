import React, { useState, useEffect } from 'react';
import { X, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';

const FormInput = ({ id, label, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <input 
            id={id}
            {...props}
            className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            required
        />
    </div>
);

const FormSelect = ({ id, label, children, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <select
            id={id}
            {...props}
            className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            required
        >
            {children}
        </select>
    </div>
);

const CashTransferModal = ({ isOpen, onClose, onSave, cajas }) => {
  const bankAccounts = cajas.filter(c => c.type === 'Cuenta Bancaria');
  const cashBoxes = cajas.filter(c => c.type === 'Efectivo');

  const getInitialState = () => ({
    fromCajaId: bankAccounts[0]?.id || '',
    toCajaId: cashBoxes[0]?.id || '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialState());
    }
  }, [isOpen, cajas]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fromCajaId || !formData.toCajaId || !formData.amount) {
      alert('Por favor, completa todos los campos.');
      return;
    }
    onSave({
      ...formData,
      fromCajaId: parseInt(formData.fromCajaId),
      toCajaId: parseInt(formData.toCajaId),
      amount: parseFloat(formData.amount),
      date: new Date(formData.date),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg m-4 relative transform transition-all" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Retiro / Depósito</h2>
        <p className="text-slate-500 mb-6">Transfiere dinero entre tus cajas.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect id="fromCajaId" name="fromCajaId" label="Desde Caja" value={formData.fromCajaId} onChange={handleInputChange}>
              <option value="" disabled>Selecciona origen</option>
              {bankAccounts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </FormSelect>
            <FormSelect id="toCajaId" name="toCajaId" label="Hacia Caja" value={formData.toCajaId} onChange={handleInputChange}>
              <option value="" disabled>Selecciona destino</option>
              {cashBoxes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </FormSelect>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput id="amount" name="amount" label="Monto (S/)" type="number" step="0.01" placeholder="100.00" value={formData.amount} onChange={handleInputChange} />
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <CalendarDays className="h-5 w-5 text-slate-400" />
                </div>
                <input type="date" name="date" id="date" value={formData.date} onChange={handleInputChange} className="block w-full rounded-xl border-slate-300 bg-slate-50 py-2.5 pl-10 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 border border-transparent rounded-full hover:bg-slate-200"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 text-sm font-semibold text-white bg-primary-600 border border-transparent rounded-full shadow-sm hover:bg-primary-700"
            >
              Realizar Transferencia
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CashTransferModal;
