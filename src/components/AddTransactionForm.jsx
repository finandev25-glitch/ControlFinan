import React, { useState, useEffect } from 'react';
import ToggleSwitch from './ToggleSwitch';
import CategorySelector from './CategorySelector';
import { CalendarDays, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { faker } from '@faker-js/faker';

const FormSelect = ({ id, label, children, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <select
            id={id}
            {...props}
            className="block w-full px-3 py-3 text-base border-slate-300 bg-slate-50 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-xl"
            required
        >
            {children}
        </select>
    </div>
);

const AddTransactionForm = ({ onSave, members, selectedMemberId, onClose, cajas, incomeCategories, expenseCategories, categoryIconMap, transactionToEdit, transactions }) => {
  const isEditing = !!transactionToEdit;

  const getNewFormState = () => {
    const now = new Date();
    const initialMemberId = selectedMemberId || members[0]?.id || '';
    const availableCajas = cajas.filter(c => String(c.member_id) === String(initialMemberId) || c.member_id === null);
    return {
      description: '',
      amount: '',
      type: 'Ingreso',
      memberId: initialMemberId,
      fromMemberId: initialMemberId,
      toMemberId: members.find(m => String(m.id) !== String(initialMemberId))?.id || '',
      fromCajaId: '',
      toCajaId: '',
      cajaId: availableCajas[0]?.id || '',
      category: incomeCategories[0]?.name || '',
      date: format(now, 'yyyy-MM-dd'),
      time: format(now, 'HH:mm'),
    };
  };

  const getInitialFormState = (editingTx) => {
    if (editingTx) {
      if (editingTx.transfer_id) {
        const pair = transactions.find(t => t.transfer_id === editingTx.transfer_id && t.id !== editingTx.id);
        if (!pair) {
          console.error("Could not find pair for transfer edit");
          return getNewFormState();
        }

        const expensePart = editingTx.type === 'Gasto' ? editingTx : pair;
        const incomePart = editingTx.type === 'Ingreso' ? editingTx : pair;

        const isInternal = String(expensePart.member_id) === String(incomePart.member_id);
        
        return {
          description: expensePart.description.startsWith('Transferencia a') || expensePart.description.startsWith('Retiro a') ? '' : expensePart.description,
          amount: expensePart.amount,
          type: isInternal ? 'Interna' : 'Transferencia',
          memberId: '',
          cajaId: '',
          category: 'Transferencia',
          date: format(new Date(editingTx.date), 'yyyy-MM-dd'),
          time: format(new Date(editingTx.date), 'HH:mm'),
          fromMemberId: expensePart.member_id,
          toMemberId: incomePart.member_id,
          fromCajaId: expensePart.caja_id,
          toCajaId: incomePart.caja_id,
        };
      } else { // It's a simple Ingreso/Gasto
        const txDate = new Date(editingTx.date);
        return {
          description: editingTx.description,
          amount: editingTx.amount,
          type: editingTx.type,
          memberId: editingTx.member_id,
          cajaId: editingTx.caja_id,
          category: editingTx.category,
          date: format(txDate, 'yyyy-MM-dd'),
          time: format(txDate, 'HH:mm'),
          fromMemberId: '',
          toMemberId: '',
          fromCajaId: '',
          toCajaId: '',
        };
      }
    }
    return getNewFormState();
  };

  const [formData, setFormData] = useState(getInitialFormState(transactionToEdit));

  useEffect(() => {
    setFormData(getInitialFormState(transactionToEdit));
  }, [transactionToEdit, selectedMemberId, members, cajas, transactions]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (type) => {
    setFormData(prev => ({
      ...getNewFormState(),
      type,
      category: type === 'Ingreso' ? incomeCategories[0]?.name : expenseCategories[0]?.name,
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
    
    const transactionDate = new Date(`${formData.date}T${formData.time}`);
    const amount = parseFloat(formData.amount);

    // Handle transfer creation or edit
    if (formData.type === 'Transferencia' || formData.type === 'Interna') {
        if (formData.fromCajaId === formData.toCajaId) {
            alert('La caja de origen y destino no pueden ser la misma.');
            return;
        }
        
        const fromCaja = cajas.find(c => String(c.id) === String(formData.fromCajaId));
        const toCaja = cajas.find(c => String(c.id) === String(formData.toCajaId));
        const fromMemberId = formData.type === 'Transferencia' ? formData.fromMemberId : fromCaja?.member_id;
        const toMemberId = formData.type === 'Transferencia' ? formData.toMemberId : toCaja?.member_id;

        const expenseTx = {
            date: transactionDate,
            description: formData.description || `${formData.type === 'Interna' ? 'Retiro a' : 'Transferencia a'} ${toCaja.name}`,
            memberId: fromMemberId,
            cajaId: formData.fromCajaId,
            type: 'Gasto',
            category: formData.type === 'Interna' ? 'Transferencia Interna' : 'Transferencia',
            amount: amount,
        };

        const incomeTx = {
            date: transactionDate,
            description: formData.description || `${formData.type === 'Interna' ? 'Depósito de' : 'Transferencia de'} ${fromCaja.name}`,
            memberId: toMemberId,
            cajaId: formData.toCajaId,
            type: 'Ingreso',
            category: formData.type === 'Interna' ? 'Transferencia Interna' : 'Transferencia',
            amount: amount,
        };

        if (isEditing && transactionToEdit.transfer_id) {
            const payload = {
                isTransferEdit: true,
                originalTransferId: transactionToEdit.transfer_id,
                newTransactions: [expenseTx, incomeTx]
            };
            onSave(transactionToEdit.id, payload);
        } else {
            const transferId = faker.string.uuid();
            onSave([expenseTx, incomeTx], null, true, transferId);
        }
        return;
    }

    // Handle simple transaction creation or edit
    const dataToSave = {
        date: transactionDate,
        description: formData.description,
        memberId: formData.memberId,
        cajaId: formData.cajaId,
        type: formData.type,
        amount: amount,
        category: formData.category,
    };

    if (isEditing) {
        onSave(transactionToEdit.id, dataToSave);
    } else {
        onSave([dataToSave]);
    }
  };
  
  const categoriesForSelector = formData.type === 'Ingreso' ? incomeCategories : expenseCategories;
  const isTransfer = formData.type === 'Transferencia';
  const isInternalTransfer = formData.type === 'Interna';
  const isStandardTransaction = formData.type === 'Ingreso' || formData.type === 'Gasto';

  const fromMemberCajas = cajas.filter(c => 
    (c.type === 'Cuenta Bancaria' || c.type === 'Efectivo') && 
    (String(c.member_id) === String(formData.fromMemberId) || c.member_id === null)
  );
  const toMemberCajas = cajas.filter(c => 
    (c.type === 'Cuenta Bancaria' || c.type === 'Efectivo') && 
    (String(c.member_id) === String(formData.toMemberId) || c.member_id === null)
  );
  const bankAccounts = cajas.filter(c => c.type === 'Cuenta Bancaria');
  const cashBoxes = cajas.filter(c => c.type === 'Efectivo');
  const standardCajas = cajas.filter(c => String(c.member_id) === String(formData.memberId) || c.member_id === null);

  const categoriesWithIcons = categoriesForSelector.map(cat => ({
    ...cat,
    icon: categoryIconMap[cat.name],
  }));

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-lg">
      <h2 className="text-xl font-bold text-slate-800 mb-4">{isEditing ? 'Editar Transacción' : 'Añadir Transacción'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div>
            <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1">Monto (PEN)</label>
            <input 
                type="number" name="amount" id="amount" value={formData.amount} onChange={handleInputChange} 
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-center text-lg" 
                placeholder="0.00" required step="0.01" 
            />
        </div>

        <ToggleSwitch selectedType={formData.type} onChange={handleTypeChange} />
        
        {isStandardTransaction && (
          <>
            <CategorySelector
              label={`Categoría de ${formData.type === 'Ingreso' ? 'ingreso' : 'gasto'}`}
              categories={categoriesWithIcons}
              selectedCategory={formData.category}
              onSelect={handleCategoryChange}
            />
            <FormSelect id="memberId" name="memberId" label="Miembro" value={formData.memberId} onChange={handleInputChange}>
              {members.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
            </FormSelect>
            <FormSelect id="cajaId" name="cajaId" label="Caja" value={formData.cajaId} onChange={handleInputChange}>
               {standardCajas.map(caja => <option key={caja.id} value={caja.id}>{caja.name}</option>)}
            </FormSelect>
          </>
        )}

        {isTransfer && (
          <div className="grid grid-cols-2 gap-4">
            <FormSelect id="fromMemberId" name="fromMemberId" label="De Miembro" value={formData.fromMemberId} onChange={handleInputChange}>
              {members.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
            </FormSelect>
             <FormSelect id="fromCajaId" name="fromCajaId" label="Desde Caja" value={formData.fromCajaId} onChange={handleInputChange}>
                <option value="" disabled>Selecciona origen</option>
                {fromMemberCajas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </FormSelect>
            <FormSelect id="toMemberId" name="toMemberId" label="Para Miembro" value={formData.toMemberId} onChange={handleInputChange}>
              {members.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
            </FormSelect>
             <FormSelect id="toCajaId" name="toCajaId" label="Hacia Caja" value={formData.toCajaId} onChange={handleInputChange}>
                <option value="" disabled>Selecciona destino</option>
                {toMemberCajas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </FormSelect>
          </div>
        )}

        {isInternalTransfer && (
          <div className="grid grid-cols-2 gap-4">
            <FormSelect id="fromCajaId" name="fromCajaId" label="Desde Caja (Banco)" value={formData.fromCajaId} onChange={handleInputChange}>
              <option value="" disabled>Selecciona origen</option>
              {bankAccounts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </FormSelect>
            <FormSelect id="toCajaId" name="toCajaId" label="Hacia Caja (Efectivo)" value={formData.toCajaId} onChange={handleInputChange}>
              <option value="" disabled>Selecciona destino</option>
              {cashBoxes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </FormSelect>
          </div>
        )}

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
          <input type="text" name="description" id="description" value={formData.description} onChange={handleInputChange} className="block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
        </div>

        <div className="pt-2 flex flex-col items-center gap-3">
          <button
            type="submit"
            className="w-full px-4 py-3 text-base font-semibold text-white bg-primary-600 border border-transparent rounded-full shadow-sm hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500"
          >
            {isEditing ? 'Actualizar' : 'Agregar'}
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
