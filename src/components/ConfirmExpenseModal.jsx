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


const ConfirmExpenseModal = ({ isOpen, onClose, onConfirm, expense, members, cajas }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (expense) {
      const today = new Date();
      const availableCajas = cajas.filter(c => c.type !== 'Tarjeta de Crédito' && c.type !== 'Préstamos');
      setFormData({
        description: expense.description,
        amount: expense.amount,
        date: format(new Date(today.getFullYear(), today.getMonth(), expense.dayOfMonth), 'yyyy-MM-dd'),
        category: expense.category,
        memberId: expense.memberId,
        cajaId: expense.caja_id || availableCajas[0]?.id || '',
      });
    }
  }, [expense, cajas]);

  if (!isOpen || !expense) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = {
        ...formData,
        amount: parseFloat(formData.amount),
        memberId: formData.memberId,
        cajaId: formData.cajaId,
        date: new Date(formData.date),
    };
    onConfirm(finalData, expense.id);
  };

  const member = members.find(m => m.id === expense.memberId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg m-4 relative transform transition-all" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Confirmar Gasto Programado</h2>
        <p className="text-slate-500 mb-6">Revisa y ajusta los detalles antes de confirmar.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput id="description" name="description" label="Descripción" value={formData.description || ''} onChange={handleInputChange} />
            <div className="grid grid-cols-2 gap-4">
                <FormInput id="amount" name="amount" label="Monto (S/)" type="number" step="0.01" value={formData.amount || ''} onChange={handleInputChange} />
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <CalendarDays className="h-5 w-5 text-slate-400" />
                        </div>
                        <input type="date" name="date" id="date" value={formData.date || ''} onChange={handleInputChange} className="block w-full rounded-xl border-slate-300 bg-slate-50 py-2.5 pl-10 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                    </div>
                </div>
            </div>

            <FormSelect id="cajaId" name="cajaId" label="Pagar desde Caja" value={formData.cajaId} onChange={handleInputChange}>
              {cajas.filter(c => c.type !== 'Tarjeta de Crédito' && c.type !== 'Préstamos').map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </FormSelect>

            <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="font-medium text-slate-500">Categoría</p>
                    <p className="font-semibold text-slate-800">{expense.category}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="font-medium text-slate-500">Miembro</p>
                    <p className="font-semibold text-slate-800">{member?.name || 'N/A'}</p>
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
              className="px-6 py-2.5 text-sm font-semibold text-white bg-green-600 border border-transparent rounded-full shadow-sm hover:bg-green-700"
            >
              Confirmar Gasto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfirmExpenseModal;
