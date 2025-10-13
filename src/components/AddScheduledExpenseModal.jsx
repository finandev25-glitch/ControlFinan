import React, { useState, useMemo, useEffect } from 'react';
import { X } from 'lucide-react';
import CategorySelector from './CategorySelector';
import * as Icons from 'lucide-react';

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

const AddScheduledExpenseModal = ({ isOpen, onClose, onSave, members, cajas, expenseCategories, categoryIconMap }) => {
  const getInitialState = () => {
    const initialMemberId = members[0]?.id || '';
    const initialCajas = cajas.filter(c => String(c.member_id) === String(initialMemberId) || c.member_id === null);
    return {
      description: '',
      amount: '',
      category: expenseCategories[0]?.name || '',
      day_of_month: '15',
      member_id: initialMemberId,
      caja_id: initialCajas[0]?.id || '',
    };
  };

  const [formData, setFormData] = useState(getInitialState());

  const availableCajas = useMemo(() => {
    if (!formData.member_id) return [];
    return cajas.filter(c => String(c.member_id) === String(formData.member_id) || c.member_id === null);
  }, [formData.member_id, cajas]);

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialState());
    }
  }, [isOpen]);
  
  useEffect(() => {
    const isCurrentCajaValid = availableCajas.some(c => c.id === formData.caja_id);
    if (!isCurrentCajaValid && availableCajas.length > 0) {
      setFormData(prev => ({ ...prev, caja_id: availableCajas[0].id }));
    } else if (availableCajas.length === 0) {
      setFormData(prev => ({ ...prev, caja_id: '' }));
    }
  }, [formData.member_id, availableCajas]);


  const categoriesWithIcons = useMemo(() => {
    if (!expenseCategories || !categoryIconMap) return [];
    return expenseCategories.map(cat => ({
      ...cat,
      icon: categoryIconMap[cat.name] || Icons.Tag,
    }));
  }, [expenseCategories, categoryIconMap]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (categoryName) => {
    setFormData(prev => ({ ...prev, category: categoryName }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      day_of_month: parseInt(formData.day_of_month) || 1,
      member_id: formData.member_id,
      caja_id: formData.caja_id,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg m-4 relative transform transition-all" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Añadir Gasto Programado</h2>
        <p className="text-slate-500 mb-6">Registra un gasto que se repite cada mes.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput id="description" name="description" label="Descripción" placeholder="Ej: Suscripción a Spotify" value={formData.description} onChange={handleInputChange} />
            <div className="grid grid-cols-2 gap-4">
                <FormInput id="amount" name="amount" label="Monto (S/)" type="number" step="0.01" placeholder="50.00" value={formData.amount} onChange={handleInputChange} />
                <FormInput id="dayOfMonth" name="day_of_month" label="Día de Pago (del mes)" type="number" min="1" max="31" placeholder="15" value={formData.day_of_month} onChange={handleInputChange} />
            </div>
            <CategorySelector
              label="Categoría"
              categories={categoriesWithIcons}
              selectedCategory={formData.category}
              onSelect={handleCategoryChange}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormSelect id="memberId" name="member_id" label="Miembro Responsable" value={formData.member_id} onChange={handleInputChange}>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </FormSelect>
                <FormSelect id="cajaId" name="caja_id" label="Caja de Origen" value={formData.caja_id} onChange={handleInputChange} disabled={availableCajas.length === 0}>
                    {availableCajas.length > 0 ? (
                      availableCajas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                    ) : (
                      <option value="" disabled>Sin cajas para este miembro</option>
                    )}
                </FormSelect>
            </div>

          <div className="pt-4 flex justify-end gap-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 border border-transparent rounded-full hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 text-sm font-semibold text-white bg-primary-600 border border-transparent rounded-full shadow-sm hover:bg-primary-700"
            >
              Guardar Gasto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddScheduledExpenseModal;
