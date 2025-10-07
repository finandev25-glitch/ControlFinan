import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { expenseCategories } from '../data/mockData';

const AddTransactionModal = ({ isOpen, onClose, onSave, members }) => {
  const initialFormState = {
    description: '',
    amount: '',
    type: 'Gasto',
    memberId: members[0]?.id || '',
    category: expenseCategories[0]
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.memberId) {
      alert('Por favor, completa todos los campos.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md m-4 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800">
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold text-slate-800 mb-6">Añadir Transacción</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-slate-700">Tipo</label>
              <select name="type" id="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                <option>Gasto</option>
                <option>Ingreso</option>
                <option>Entrega a Rendir</option>
              </select>
            </div>
             <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700">Descripción</label>
              <input type="text" name="description" id="description" value={formData.description} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" required />
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-slate-700">Monto</label>
              <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="0.00" required step="0.01" />
            </div>
            {formData.type === 'Gasto' && (
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-700">Categoría</label>
                <select name="category" id="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                  {expenseCategories.map(cat => <option key={cat}>{cat}</option>)}
                </select>
              </div>
            )}
            <div>
              <label htmlFor="memberId" className="block text-sm font-medium text-slate-700">Miembro</label>
              <select name="memberId" id="memberId" value={formData.memberId} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                {members.map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-transparent rounded-md hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
