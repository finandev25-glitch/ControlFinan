import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { peruvianBanks } from '../data/mockData';

const creatableCajaTypes = [
    'Cuenta Bancaria',
    'Tarjeta de Crédito',
    'Préstamos',
];

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

const AddCajaModal = ({ isOpen, onClose, onSave, members }) => {
  const [type, setType] = useState(creatableCajaTypes[0]);
  const [formData, setFormData] = useState({ memberId: members[0]?.id || '' });

  useEffect(() => {
    // Reset form data when type changes, but keep memberId
    setFormData(prev => ({ memberId: prev.memberId || members[0]?.id || '' }));
  }, [type, members]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, type, memberId: parseInt(formData.memberId) });
    onClose();
    setFormData({ memberId: members[0]?.id || '' });
    setType(creatableCajaTypes[0]);
  };

  const renderFormFields = () => {
    switch (type) {
      case 'Cuenta Bancaria':
        return (
          <>
            <FormInput id="name" name="name" label="Alias de la Cuenta" placeholder="Ej: Cuenta Sueldo" value={formData.name || ''} onChange={handleInputChange} />
            <FormSelect id="bank" name="bank" label="Banco" value={formData.bank || ''} onChange={handleInputChange}>
                <option value="" disabled>Selecciona un banco</option>
                {peruvianBanks.map(b => <option key={b} value={b}>{b}</option>)}
            </FormSelect>
            <FormInput id="accountNumber" name="accountNumber" label="Número de Cuenta / CCI" placeholder="002191..." value={formData.accountNumber || ''} onChange={handleInputChange} />
            <FormInput id="currency" name="currency" label="Moneda" placeholder="PEN" value={formData.currency || 'PEN'} onChange={handleInputChange} />
          </>
        );
      case 'Tarjeta de Crédito':
        return (
          <>
            <FormInput id="name" name="name" label="Alias de la Tarjeta" placeholder="Ej: Visa Signature" value={formData.name || ''} onChange={handleInputChange} />
            <FormSelect id="bank" name="bank" label="Banco Emisor" value={formData.bank || ''} onChange={handleInputChange}>
                <option value="" disabled>Selecciona un banco</option>
                {peruvianBanks.map(b => <option key={b} value={b}>{b}</option>)}
            </FormSelect>
            <FormInput id="cardNumber" name="cardNumber" label="Últimos 4 dígitos" placeholder="1234" maxLength="4" value={formData.cardNumber || ''} onChange={handleInputChange} />
            <FormInput id="creditLine" name="creditLine" label="Línea de Crédito (S/)" type="number" step="100" placeholder="10000" value={formData.creditLine || ''} onChange={handleInputChange} />
            <FormInput id="paymentDay" name="paymentDay" label="Día de Cierre (del mes)" type="number" min="1" max="31" placeholder="28" value={formData.paymentDay || ''} onChange={handleInputChange} />
          </>
        );
      case 'Préstamos':
        return (
          <>
            <FormInput id="name" name="name" label="Nombre del Préstamo" placeholder="Ej: Préstamo Vehicular" value={formData.name || ''} onChange={handleInputChange} />
            <FormInput id="loanPurpose" name="loanPurpose" label="Motivo del Préstamo" placeholder="Compra de vehículo" value={formData.loanPurpose || ''} onChange={handleInputChange} />
            <FormSelect id="bank" name="bank" label="Entidad Financiera" value={formData.bank || ''} onChange={handleInputChange}>
                <option value="" disabled>Selecciona una entidad</option>
                {peruvianBanks.map(b => <option key={b} value={b}>{b}</option>)}
            </FormSelect>
             <FormInput id="monthlyPayment" name="monthlyPayment" label="Monto Cuota Mensual (S/)" type="number" step="0.01" placeholder="1200.00" value={formData.monthlyPayment || ''} onChange={handleInputChange} />
            <div className="grid grid-cols-2 gap-4">
              <FormInput id="totalInstallments" name="totalInstallments" label="Cuotas Totales" type="number" min="1" placeholder="48" value={formData.totalInstallments || ''} onChange={handleInputChange} />
              <FormInput id="paidInstallments" name="paidInstallments" label="Cuotas Pagadas" type="number" min="0" placeholder="0" value={formData.paidInstallments || ''} onChange={handleInputChange} />
            </div>
            <FormInput id="paymentDay" name="paymentDay" label="Día de Pago (del mes)" type="number" min="1" max="31" placeholder="5" value={formData.paymentDay || ''} onChange={handleInputChange} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg m-4 relative transform transition-all" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Añadir Nueva Caja</h2>
        <p className="text-slate-500 mb-6">Selecciona el tipo y completa los detalles.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormSelect id="cajaType" label="Tipo de Caja" value={type} onChange={(e) => setType(e.target.value)}>
                {creatableCajaTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </FormSelect>
              <FormSelect id="memberId" name="memberId" label="Propietario" value={formData.memberId} onChange={handleInputChange}>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </FormSelect>
            </div>
          
          <div className="space-y-4 border-t border-slate-200 pt-4">
            {renderFormFields()}
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
              className="px-6 py-2.5 text-sm font-semibold text-white bg-primary-600 border border-transparent rounded-full shadow-sm hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500"
            >
              Guardar Caja
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCajaModal;
