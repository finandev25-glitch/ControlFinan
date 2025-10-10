import React, { useState, useMemo } from 'react';
import { PlusCircle, Banknote, Calendar, Landmark, CreditCard, University } from 'lucide-react';
import AddCajaModal from '../components/AddCajaModal';
import CreditCardDetailModal from '../components/CreditCardDetailModal';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const InfoLine = ({ icon: Icon, label, value }) => (
  <div className="flex items-center text-sm text-slate-600">
    <Icon size={14} className="mr-2 text-slate-400" />
    <span className="font-medium">{label}:</span>
    <span className="ml-1">{value}</span>
  </div>
);

const CajasPage = ({ transactions, cajas, onAddCaja, members }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCreditCard, setSelectedCreditCard] = useState(null);

  const cajasConBalance = useMemo(() => {
    return cajas.map(caja => {
      const income = transactions
        .filter(t => t.cajaId === caja.id && t.type === 'Ingreso')
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = transactions
        .filter(t => t.cajaId === caja.id && t.type === 'Gasto')
        .reduce((sum, t) => sum + t.amount, 0);
      
      let balance = income - expense;
      if (caja.type === 'Tarjeta de Crédito') {
        balance = expense - income;
      }
      
      const owner = members.find(m => m.id === caja.memberId);
      return { ...caja, balance, owner };
    });
  }, [transactions, cajas, members]);

  const handleOpenDetailModal = (caja) => {
    if (caja.type === 'Tarjeta de Crédito') {
      setSelectedCreditCard(caja);
      setIsDetailModalOpen(true);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedCreditCard(null);
  };

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Gestión de Cajas</h1>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500"
          >
            <PlusCircle size={18} />
            Añadir Caja
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cajasConBalance.map(caja => {
            const Icon = caja.icon;
            const progressPercentage = caja.type === 'Préstamos' ? (caja.paidInstallments / caja.totalInstallments) * 100 : 0;
            const isClickable = caja.type === 'Tarjeta de Crédito';
            return (
              <div 
                key={caja.id} 
                className={`bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-lg hover:border-primary-300 transition-all duration-300 ${isClickable ? 'cursor-pointer' : ''}`}
                onClick={() => handleOpenDetailModal(caja)}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{caja.type}</p>
                      <h3 className="text-lg font-semibold text-slate-800 mt-1">{caja.name}</h3>
                       {caja.owner && (
                        <div className="flex items-center gap-2 mt-2">
                            <img src={caja.owner.avatar} alt={caja.owner.name} className="h-6 w-6 rounded-full" />
                            <span className="text-xs font-medium text-slate-500">{caja.owner.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3 rounded-full bg-primary-100">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {caja.type === 'Cuenta Bancaria' && (
                      <>
                        <InfoLine icon={Landmark} label="Banco" value={caja.bank} />
                        <InfoLine icon={Banknote} label="Moneda" value={caja.currency} />
                        <InfoLine icon={CreditCard} label="Cuenta" value={caja.accountNumber} />
                      </>
                    )}
                    {caja.type === 'Tarjeta de Crédito' && (
                      <>
                        <InfoLine icon={Landmark} label="Banco" value={caja.bank} />
                        <InfoLine icon={Banknote} label="Línea" value={formatCurrency(caja.creditLine)} />
                        <InfoLine icon={Calendar} label="Día de Cierre" value={caja.closingDay} />
                        <InfoLine icon={Calendar} label="Día de Pago" value={caja.paymentDueDate} />
                      </>
                    )}
                     {caja.type === 'Préstamos' && (
                      <>
                        <InfoLine icon={Landmark} label="Entidad" value={caja.bank} />
                        <InfoLine icon={University} label="Motivo" value={caja.loanPurpose} />
                        <InfoLine icon={Banknote} label="Cuota Mensual" value={formatCurrency(caja.monthlyPayment)} />
                         <div className="pt-2">
                           <div className="flex justify-between text-sm font-medium text-slate-600 mb-1">
                               <span>Progreso del Préstamo</span>
                               <span>{caja.paidInstallments} / {caja.totalInstallments}</span>
                           </div>
                           <div className="w-full bg-slate-200 rounded-full h-2.5">
                               <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                           </div>
                         </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-100">
                  <p className="text-3xl font-bold text-slate-800">{formatCurrency(caja.balance)}</p>
                  <p className="text-xs text-slate-500">
                    {caja.type === 'Tarjeta de Crédito' ? 'Deuda acumulada' : 'Balance actual'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <AddCajaModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={onAddCaja}
        members={members.filter(m => m.role !== 'Dependiente')}
      />
      <CreditCardDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        card={selectedCreditCard}
        transactions={transactions}
      />
    </>
  );
};

export default CajasPage;
