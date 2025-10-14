import React, { useState, useEffect } from 'react';
import ToggleSwitch from './ToggleSwitch';
import CategorySelector from './CategorySelector';
import { CalendarDays, Clock, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { faker } from '@faker-js/faker';
import SelectCajaModal from './SelectCajaModal';

const AddTransactionForm = ({ onSave, members, selectedMemberId, onClose, cajas, incomeCategories, expenseCategories, categoryIconMap, transactionToEdit, transactions }) => {
  const isEditing = !!transactionToEdit;
  const [isCajaModalOpen, setIsCajaModalOpen] = useState(false);
  const [cajaSelectionContext, setCajaSelectionContext] = useState(null); // 'from', 'to', or 'standard'

  const getNewFormState = () => {
    const now = new Date();
    return {
      description: '',
      amount: '',
      type: 'Ingreso',
      memberId: '',
      fromMemberId: '',
      toMemberId: '',
      fromCajaId: '',
      toCajaId: '',
      cajaId: '',
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
  
  const handleOpenCajaModal = (context) => {
    setCajaSelectionContext(context);
    setIsCajaModalOpen(true);
  };

  const handleSelectCaja = (caja) => {
    if (cajaSelectionContext === 'from') {
      setFormData(prev => ({ ...prev, fromCajaId: caja.id, fromMemberId: caja.member_id }));
    } else if (cajaSelectionContext === 'to') {
      setFormData(prev => ({ ...prev, toCajaId: caja.id, toMemberId: caja.member_id }));
    } else if (cajaSelectionContext === 'standard') {
      setFormData(prev => ({ ...prev, cajaId: caja.id, memberId: caja.member_id }));
    }
    setIsCajaModalOpen(false);
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
        const fromMemberId = formData.fromMemberId;
        const toMemberId = formData.toMemberId;

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

  const categoriesWithIcons = categoriesForSelector.map(cat => ({
    ...cat,
    icon: categoryIconMap[cat.name],
  }));
  
  const FromCajaIcon = cajas.find(c => String(c.id) === String(formData.fromCajaId))?.icon || Wallet;
  const ToCajaIcon = cajas.find(c => String(c.id) === String(formData.toCajaId))?.icon || Wallet;
  const StandardCajaIcon = cajas.find(c => String(c.id) === String(formData.cajaId))?.icon || Wallet;

  const fromCaja = cajas.find(c => String(c.id) === String(formData.fromCajaId));
  const fromMember = fromCaja ? members.find(m => String(m.id) === String(fromCaja.member_id)) : null;

  const toCaja = cajas.find(c => String(c.id) === String(formData.toCajaId));
  const toMember = toCaja ? members.find(m => String(m.id) === String(toCaja.member_id)) : null;
  
  const standardCaja = cajas.find(c => String(c.id) === String(formData.cajaId));
  const standardMember = standardCaja ? members.find(m => String(m.id) === String(standardCaja.member_id)) : null;

  const typeLabels = {
    'Ingreso': 'Ingreso',
    'Gasto': 'Gasto',
    'Transferencia': 'Transferencia',
    'Interna': 'Retiro/Depósito',
  };

  return (
    <>
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-lg">
        <h2 className="text-xl font-bold text-slate-800 mb-4">{isEditing ? 'Editar Transacción' : 'Añadir Transacción'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isEditing ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Transacción</label>
              <div className="p-1 bg-gray-100 rounded-full">
                <div className="w-full py-2.5 text-sm font-medium leading-5 rounded-full bg-primary-600 text-white shadow text-center">
                  {typeLabels[formData.type]}
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1 text-center">El tipo de transacción no se puede cambiar.</p>
            </div>
          ) : (
            <ToggleSwitch selectedType={formData.type} onChange={handleTypeChange} />
          )}

          <div>
              <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1">Monto (PEN)</label>
              <input 
                  type="number" name="amount" id="amount" value={formData.amount} onChange={handleInputChange} 
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-center text-lg" 
                  placeholder="0.00" required step="0.01" 
              />
          </div>
          
          {isStandardTransaction && (
            <>
              <CategorySelector
                label={`Categoría de ${formData.type === 'Ingreso' ? 'ingreso' : 'gasto'}`}
                categories={categoriesWithIcons}
                selectedCategory={formData.category}
                onSelect={handleCategoryChange}
              />
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Caja</label>
                  <button type="button" onClick={() => handleOpenCajaModal('standard')} className="w-full text-left flex items-center justify-between gap-3 px-3 py-3 text-base border-slate-300 bg-slate-50 rounded-xl shadow-sm">
                      <div className="flex items-center gap-3 truncate">
                          <StandardCajaIcon className="h-5 w-5 text-slate-500 flex-shrink-0" />
                          <span className="truncate">{standardCaja?.name || 'Seleccionar Caja'}</span>
                      </div>
                      {standardMember && (
                          <img src={standardMember.avatar} alt={standardMember.name} className="h-6 w-6 rounded-full flex-shrink-0" />
                      )}
                  </button>
              </div>
            </>
          )}

          {(isTransfer || isInternalTransfer) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Desde Caja</label>
                  <button type="button" onClick={() => handleOpenCajaModal('from')} className="w-full text-left flex items-center justify-between gap-3 px-3 py-3 text-base border-slate-300 bg-slate-50 rounded-xl shadow-sm">
                      <div className="flex items-center gap-3 truncate">
                          <FromCajaIcon className="h-5 w-5 text-slate-500 flex-shrink-0" />
                          <span className="truncate">{fromCaja?.name || 'Seleccionar Origen'}</span>
                      </div>
                      {fromMember && (
                          <img src={fromMember.avatar} alt={fromMember.name} className="h-6 w-6 rounded-full flex-shrink-0" />
                      )}
                  </button>
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hacia Caja</label>
                  <button type="button" onClick={() => handleOpenCajaModal('to')} className="w-full text-left flex items-center justify-between gap-3 px-3 py-3 text-base border-slate-300 bg-slate-50 rounded-xl shadow-sm">
                      <div className="flex items-center gap-3 truncate">
                          <ToCajaIcon className="h-5 w-5 text-slate-500 flex-shrink-0" />
                          <span className="truncate">{toCaja?.name || 'Seleccionar Destino'}</span>
                      </div>
                      {toMember && (
                          <img src={toMember.avatar} alt={toMember.name} className="h-6 w-6 rounded-full flex-shrink-0" />
                      )}
                  </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-5 gap-4">
              <div className="col-span-3">
                  <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                  <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <CalendarDays className="h-5 w-5 text-slate-400" />
                      </div>
                      <input type="date" name="date" id="date" value={formData.date} onChange={handleInputChange} className="block w-full rounded-xl border-slate-300 bg-slate-50 py-3 pl-10 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                  </div>
              </div>
              <div className="col-span-2">
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
      <SelectCajaModal
        isOpen={isCajaModalOpen}
        onClose={() => setIsCajaModalOpen(false)}
        cajas={cajas}
        members={members}
        onSelect={handleSelectCaja}
        title={`Seleccionar Caja`}
        excludeMemberId={cajaSelectionContext === 'to' && formData.type === 'Transferencia' ? formData.fromMemberId : null}
      />
    </>
  );
};

export default AddTransactionForm;
