import React, { useState, useMemo, useEffect } from 'react';
import { X } from 'lucide-react';
import CategorySelector from './CategorySelector';
import * as Icons from 'lucide-react';

const AddBudgetModal = ({ isOpen, onClose, onSave, existingBudgets, expenseCategories, categoryIconMap, budgetToEdit }) => {
  const isEditing = !!budgetToEdit;

  const availableCategories = useMemo(() => {
    if (isEditing) {
      return expenseCategories;
    }
    return expenseCategories.filter(
      cat => !existingBudgets.some(b => b.category === cat.name)
    );
  }, [expenseCategories, existingBudgets, isEditing]);

  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setCategory(budgetToEdit.category);
        setLimit(budgetToEdit.limit_amount);
      } else {
        setCategory(availableCategories[0]?.name || '');
        setLimit('');
      }
    }
  }, [isOpen, isEditing, budgetToEdit, availableCategories]);

  const categoriesWithIcons = useMemo(() => {
    if (!availableCategories || !categoryIconMap) return [];
    return availableCategories.map(cat => ({
      ...cat,
      icon: categoryIconMap[cat.name] || Icons.Tag,
    }));
  }, [availableCategories, categoryIconMap]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!category || !limit || parseFloat(limit) <= 0) {
      alert('Por favor, selecciona una categoría y un límite válido.');
      return;
    }
    onSave({ category, limit_amount: parseFloat(limit) });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md m-4 relative transform transition-all" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{isEditing ? 'Editar Presupuesto' : 'Crear Presupuesto'}</h2>
        <p className="text-slate-500 mb-6">{isEditing ? 'Actualiza el límite de gasto para esta categoría.' : 'Establece un límite de gasto para una categoría.'}</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <CategorySelector
              label="Categoría"
              categories={categoriesWithIcons}
              selectedCategory={category}
              onSelect={setCategory}
              disabled={isEditing}
            />
             {!isEditing && availableCategories.length === 0 && (
                <p className="text-xs text-slate-500 mt-2">Ya has creado presupuestos para todas las categorías disponibles.</p>
             )}
          </div>
          
          <div>
            <label htmlFor="limit" className="block text-sm font-medium text-slate-700 mb-1">Monto Límite (S/)</label>
            <input 
              id="limit"
              type="number"
              step="1"
              min="1"
              placeholder="1500"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              required
            />
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
              disabled={!isEditing && availableCategories.length === 0}
            >
              {isEditing ? 'Actualizar' : 'Guardar'} Presupuesto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBudgetModal;
