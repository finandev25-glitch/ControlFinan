import React, { useState, useEffect } from 'react';
import { incomeCategories, expenseCategories } from '../data/constants';
import ToggleSwitch from './ToggleSwitch';
import CategorySelector from './CategorySelector';
import { CalendarDays, Clock } from 'lucide-react';
import { format } from 'date-fns';

const AddTransactionForm = ({ onSave, members, selectedMemberId, onClose, cajas }) => {
  const getInitialFormState = () => {
    const now = new Date();
    return {
      description: '',
      amount: '',
      type: 'Ingreso',
      fromMemberId: selectedMemberId || members[0]?.id || '',
      toMemberId: members.find(m => m.id !== (selectedMemberId || members[0]?.id))?.id || '',
      cajaId: cajas[0]?.id || '',
      category: incomeCategories[0].name,
      date: format(now, 'yyyy-MM-dd'),
      time: format(now, 'HH:mm'),
    };
  };

  const [formData, setFormData] = useState(getInitialFormState());

  useEffect(() => {
    const initialMemberId = selectedMemberId || members[0]?.id || '';
    const initialCaja = cajas.find(c => c.miembro_id === initialMemberId || c.type === 'Efectivo') || cajas[0];
    setFormData(prev => ({
      ...getInitialFormState(),
      fromMemberId: initialMemberId,
      cajaId: initialCaja?.id || '',
    }));
  }, [selectedMemberId, members, cajas]);

  useEffect(() => {
    if (formData.cajaId) {
      const selectedCaja = cajas.find(c => c.id === parseInt(formData.cajaId));
      if (selectedCaja && selectedCaja.miembro_id && formData.type !== 'Transferencia') {
        setFormData(prev => ({...prev, fromMemberId: selectedCaja.miembro_id}));
      }
    }
  }, [formData.cajaId, cajas, formData.type]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      type,
      category: type === 'Ingreso' ? incomeCategories[0].name : expenseCategories[0].name,
    }));
  };

  const handleCategoryChange = (categoryName) => {
    setFormData(prev => ({ ...prev, category: categoryName }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount) {
      alert('Por favor, ingresa un monto.');
      return;
    }
    if (formData.type === 'Transferencia' && formData.fromMemberId === formData.toMemberId) {
      alert('El miembro de origen y destino no pueden ser el mismo.');
      return;
    }

    const transactionDate = new Date(`${formData.date}T${formData.time}`);

    const dataToSave = {
        ...formData,
        date: transactionDate,
    };

    onSave(dataToSave);
  };
  
  const categories = formData.type === 'Ingreso' ? incomeCategories : expenseCategories;
  const isTransfer = formData.type === 'Transferencia';
  const memberSelectDisabled = !isTransfer && !!cajas.find(c => c.id === parseInt(formData.cajaId))?.miembro_id;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div>
            <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1">Monto (PEN)</label>
            <input 
                type="number" 
                name="amount" 
                id="amount" 
                value={formData.amount} 
                onChange={handleInputChange} 
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-center text-lg" 
                placeholder="0.00" 
                required 
                step="0.01" 
            />
        </div>

        <ToggleSwitch selectedType={formData.type} onChange={handleTypeChange} />
        
        {!isTransfer && (
            <CategorySelector
              label={`Categoría de ${formData.type === 'Ingreso' ? 'ingreso' : 'gasto'}`}
              categories={categories}
              selectedCategory={formData.category}
              onSelect={handleCategoryChange}
            />
        )}

        {isTransfer ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="fromMemberId" className="block text-sm font-medium text-slate-700">De</label>
              <select name="fromMemberId" id="fromMemberId" value={formData.fromMemberId} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-slate-300 bg-slate-50 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-xl">
                {members.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="toMemberId" className="block text-sm font-medium text-slate-700">Para</label>
              <select name="toMemberId" id="toMemberId" value={formData.toMemberId} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-slate-300 bg-slate-50 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-xl">
                {members.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
              </select>
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor="memberId" className="block text-sm font-medium text-slate-700">Miembro</label>
            <select name="fromMemberId" id="memberId" value={formData.fromMemberId} onChange={handleInputChange} disabled={memberSelectDisabled} className={`mt-1 block w-full pl-3 pr-10 py-3 text-base border-slate-300 bg-slate-50 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-xl ${memberSelectDisabled ? 'opacity-70 cursor-not-allowed' : ''}`}>
              {members.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
            </select>
          </div>
        )}

        <div>
            <label htmlFor="cajaId" className="block text-sm font-medium text-slate-700">Caja</label>
            <select name="cajaId" id="cajaId" value={formData.cajaId} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-slate-300 bg-slate-50 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-xl">
              {cajas.map(caja => <option key={caja.id} value={caja.id}>{caja.name}</option>)}
            </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <CalendarDays className="h-5 w-5 text-slate-400" />
                    </div>
                    <input type="date" name="date" id="date" value={formData.date} onChange={handleInputChange} className="block w-full rounded-xl border-slate-300 bg-slate-50 py-3 pl-10 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                </div>
            </div>
            <div>
                <label htmlFor="time" className="block text-sm font-medium text-slate-700 mb-1">Hora</label>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Clock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input type="time" name="time" id="time" value={formData.time} onChange={handleInputChange} className="block w-full rounded-xl border-slate-300 bg-slate-50 py-3 pl-10 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                </div>
            </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
          <input type="text" name="description" id="description" value={formData.description} onChange={handleInputChange} className="block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" required />
        </div>

        <div className="pt-2 flex flex-col items-center gap-3">
          <button
            type="submit"
            className="w-full px-4 py-3 text-base font-semibold text-white bg-primary-600 border border-transparent rounded-full shadow-sm hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500"
          >
            Agregar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-slate-600 hover:text-primary-600"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTransactionForm;
