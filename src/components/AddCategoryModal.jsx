import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import * as Icons from 'lucide-react';
import { availableIcons } from '../data/availableIcons';

const AddCategoryModal = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('Gasto');
  const [iconName, setIconName] = useState(availableIcons[0]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !type || !iconName) {
      alert('Por favor, completa todos los campos.');
      return;
    }
    onSave({ name, type, icon_name: iconName });
    onClose();
    setName('');
    setType('Gasto');
    setIconName(availableIcons[0]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg m-4 relative transform transition-all" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Añadir Nueva Categoría</h2>
        <p className="text-slate-500 mb-6">Crea una nueva categoría para tus ingresos o gastos.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input 
                id="name"
                type="text"
                placeholder="Ej: Comida Rápida"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="Gasto">Gasto</option>
                <option value="Ingreso">Ingreso</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Seleccionar Ícono</label>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-lg border">
              {availableIcons.map(iconKey => {
                const Icon = Icons[iconKey];
                const isSelected = iconName === iconKey;
                return (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => setIconName(iconKey)}
                    className={`relative flex items-center justify-center p-3 rounded-lg transition-all duration-200 ${isSelected ? 'bg-primary-100 ring-2 ring-primary-500' : 'bg-white hover:bg-slate-100'}`}
                  >
                    <Icon className="h-6 w-6 text-slate-600" />
                    {isSelected && <Check size={14} className="absolute bottom-1 right-1 text-primary-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-full shadow-sm hover:bg-primary-700"
            >
              Guardar Categoría
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;
