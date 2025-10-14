import React, { useState, useMemo, useEffect } from 'react';
import { X, Wallet } from 'lucide-react';
import CategorySelector from './CategorySelector';
import * as Icons from 'lucide-react';
import SelectCajaModal from './SelectCajaModal';

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

const AddScheduledExpenseModal = ({ isOpen, onClose, onSave, members, cajas, expenseCategories, categoryIconMap }) => {
  const getInitialState = () => ({
    description: '',
    amount: '',
    category: expenseCategories[0]?.name || '',
    day_of_month: '15',
    member_id: '',
    caja_id: '',
  });

  const [formData, setFormData] = useState(getInitialState());
  const [isCajaModalOpen, setIsCajaModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialState());
    }
  }, [isOpen]);

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

  const handleSelectCaja = (caja) => {
    setFormData(prev => ({ ...prev, caja_id: caja.id, member_id: caja.member_id }));
    setIsCajaModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.caja_id) {
        alert('Por favor, selecciona una caja de origen.');
        return;
    }
    onSave({
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      day_of_month: parseInt(formData.day_of_month) || 1,
    });
    onClose();
  };
  
  const selectedCaja = cajas.find(c => String(c.id) === String(formData.caja_id));
  const selectedMember = selectedCaja ? members.find(m => String(m.id) === String(selectedCaja.member_id)) : null;
  const SelectedCajaIcon = selectedCaja?.icon || Wallet;

  return (
    <>
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
                  <FormInput id="dayOfMonth" name="day_of_month" label="Día de Pago (mes)" type="number" min="1" max="31" placeholder="15" value={formData.day_of_month} onChange={handleInputChange} />
              </div>
              <CategorySelector
                label="Categoría"
                categories={categoriesWithIcons}
                selectedCategory={formData.category}
                onSelect={handleCategoryChange}
              />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Caja de Origen</label>
                <button 
                  type="button" 
                  onClick={() => setIsCajaModalOpen(true)} 
                  className="w-full text-left flex items-center justify-between gap-3 px-3 py-3 text-base border border-slate-300 bg-slate-50 rounded-xl shadow-sm"
                >
                  <div className="flex items-center gap-3 truncate">
                    <SelectedCajaIcon className="h-5 w-5 text-slate-500 flex-shrink-0" />
                    <span className="truncate">{selectedCaja?.name || 'Seleccionar Caja'}</span>
                  </div>
                  {selectedMember && (
                    <img src={selectedMember.avatar} alt={selectedMember.name} className="h-6 w-6 rounded-full flex-shrink-0" />
                  )}
                </button>
              </div>

            <div className="pt-4 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-5 py-2 text-sm font-semibold text-slate-700 bg-slate-100 border border-transparent rounded-full hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-5 py-2 text-sm font-semibold text-white bg-primary-600 border border-transparent rounded-full shadow-sm hover:bg-primary-700"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
      <SelectCajaModal
        isOpen={isCajaModalOpen}
        onClose={() => setIsCajaModalOpen(false)}
        cajas={cajas}
        members={members}
        onSelect={handleSelectCaja}
        title="Seleccionar Caja de Origen"
      />
    </>
  );
};

export default AddScheduledExpenseModal;
