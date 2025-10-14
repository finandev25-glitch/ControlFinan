import React, { useState, useMemo } from 'react';
import { PlusCircle, Banknote, Calendar, Landmark, CreditCard, University, Filter } from 'lucide-react';
import AddCajaModal from '../components/AddCajaModal';
import CreditCardDetailModal from '../components/CreditCardDetailModal';
import MemberSelector from '../components/MemberSelector';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const InfoLine = ({ icon: Icon, label, value }) => (
  <div className="flex items-center text-xs text-slate-600">
    <Icon size={14} className="mr-2 text-slate-400 flex-shrink-0" />
    <span className="font-medium">{label}:</span>
    <span className="ml-1 truncate">{value}</span>
  </div>
);

const CajasPage = ({ transactions, cajas, onAddCaja, members }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCreditCard, setSelectedCreditCard] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState('all');

  const cajasConBalance = useMemo(() => {
    const filteredCajas = selectedMemberId === 'all'
      ? cajas
      : cajas.filter(c => c.member_id === null || String(c.member_id) === String(selectedMemberId));

    return filteredCajas.map(caja => {
      const income = transactions
        .filter(t => t.caja_id === caja.id && t.type === 'Ingreso')
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = transactions
        .filter(t => t.caja_id === caja.id && t.type === 'Gasto')
        .reduce((sum, t) => sum + t.amount, 0);
      
      let balance = income - expense;
      if (caja.type === 'Tarjeta de Crédito' || caja.type === 'Préstamos') {
        balance = expense - income;
      }
      
      const owner = members.find(m => m.id === caja.member_id);
      return { ...caja, balance, owner };
    });
  }, [transactions, cajas, members, selectedMemberId]);

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                <span className="hidden sm:inline">Gestión de Cajas</span>
                <span className="sm:hidden">Cajas</span>
              </h1>
              <p className="mt-1 text-slate-500">Administra tus fuentes de dinero.</p>
            </div>
          <div className="flex items-center gap-4 flex-wrap w-full sm:w-auto">
            <MemberSelector
              members={members}
              selectedMemberId={selectedMemberId}
              onMemberChange={setSelectedMemberId}
            />
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700"
            >
              <PlusCircle size={18} />
              Añadir Caja
            </button>
          </div>
        </div>

        {cajasConBalance.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {cajasConBalance.map(caja => {
              const Icon = caja.icon;
              const progressPercentage = caja.type === 'Préstamos' ? (caja.paid_installments / caja.total_installments) * 100 : 0;
              const isClickable = caja.type === 'Tarjeta de Crédito';
              return (
                <div 
                  key={caja.id} 
                  className={`bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-lg hover:border-primary-300 transition-all duration-300 ${isClickable ? 'cursor-pointer' : ''}`}
                  onClick={() => handleOpenDetailModal(caja)}
                >
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs font-medium text-slate-500">{caja.type}</p>
                        <h3 className="text-base font-semibold text-slate-800 mt-0.5">{caja.name}</h3>
                         {caja.owner && (
                          <div className="flex items-center gap-2 mt-1">
                              <img src={caja.owner.avatar} alt={caja.owner.name} className="h-5 w-5 rounded-full" />
                              <span className="text-xs font-medium text-slate-500">{caja.owner.name}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-2 rounded-full bg-primary-100">
                        <Icon className="h-5 w-5 text-primary-600" />
                      </div>
                    </div>

                    <div className="space-y-1 mb-2">
                      {caja.type === 'Cuenta Bancaria' && (
                        <>
                          <InfoLine icon={Landmark} label="Banco" value={caja.bank} />
                          <InfoLine icon={CreditCard} label="Cuenta" value={caja.account_number} />
                        </>
                      )}
                      {caja.type === 'Tarjeta de Crédito' && (
                        <>
                          <InfoLine icon={Landmark} label="Banco" value={caja.bank} />
                          <InfoLine icon={Banknote} label="Línea" value={formatCurrency(caja.credit_line)} />
                        </>
                      )}
                       {caja.type === 'Préstamos' && (
                        <>
                          <InfoLine icon={Landmark} label="Entidad" value={caja.bank} />
                          <InfoLine icon={Banknote} label="Cuota" value={formatCurrency(caja.monthly_payment)} />
                           <div className="pt-1">
                             <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                                 <span>Progreso</span>
                                 <span>{caja.paid_installments} / {caja.total_installments}</span>
                             </div>
                             <div className="w-full bg-slate-200 rounded-full h-1.5">
                                 <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                             </div>
                           </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-2 border-t border-slate-100">
                    <p className="text-xl font-bold text-slate-800">{formatCurrency(caja.balance)}</p>
                    <p className="text-xs text-slate-500 -mt-0.5">
                      {caja.type === 'Tarjeta de Crédito' || caja.type === 'Préstamos' ? 'Deuda actual' : 'Balance actual'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-16 rounded-lg bg-white border-2 border-dashed border-slate-200">
            <Filter className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-lg font-medium text-slate-900">No hay cajas para este miembro</h3>
            <p className="mt-1 text-sm text-slate-500">Intenta seleccionando "Todos" para ver todas las cajas.</p>
          </div>
        )}
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
