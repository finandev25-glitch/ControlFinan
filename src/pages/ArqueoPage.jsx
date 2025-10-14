import React, { useState, useMemo } from 'react';
import ArqueoCajaCard from '../components/ArqueoCajaCard';
import CashCounterModal from '../components/CashCounterModal';

const ArqueoPage = ({ transactions, cajas, onAddTransactions, members }) => {
  const [realBalances, setRealBalances] = useState({});
  const [isCounterOpen, setIsCounterOpen] = useState(false);
  const [activeCajaId, setActiveCajaId] = useState(null);

  const cajasConBalance = useMemo(() => {
    return cajas.map(caja => {
      const income = transactions
        .filter(t => t.caja_id === caja.id && t.type === 'Ingreso')
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = transactions
        .filter(t => t.caja_id === caja.id && t.type === 'Gasto')
        .reduce((sum, t) => sum + t.amount, 0);
      
      let balance = income - expense;
      if (caja.type === 'Tarjeta de Crédito') {
        balance = expense - income;
      }
      
      return { ...caja, calculatedBalance: balance };
    });
  }, [transactions, cajas]);

  const handleRealBalanceChange = (cajaId, value) => {
    setRealBalances(prev => ({
      ...prev,
      [cajaId]: value,
    }));
  };

  const handleAdjust = (cajaId) => {
    const caja = cajasConBalance.find(c => c.id === cajaId);
    if (!caja) return;

    const realBalance = parseFloat(realBalances[cajaId] || '0');
    const calculatedBalance = caja.calculatedBalance;
    const difference = realBalance - calculatedBalance;

    if (difference === 0) {
      alert('No hay diferencia para ajustar.');
      return;
    }

    const adjustmentType = difference > 0 ? 'Ingreso' : 'Gasto';
    const amount = Math.abs(difference);

    const memberId = caja.member_id || members.find(m => m.role.includes('Principal'))?.id || members[0].id;
    const member = members.find(m => m.id === memberId);

    const adjustmentTransaction = {
      id: Date.now(),
      date: new Date(),
      description: 'Ajuste de arqueo',
      memberId: memberId,
      memberName: member.name,
      cajaId: cajaId,
      type: adjustmentType,
      category: 'Otros',
      amount: amount,
    };

    onAddTransactions([adjustmentTransaction]);
    
    setRealBalances(prev => ({
      ...prev,
      [cajaId]: '',
    }));
  };

  const handleOpenCounter = (cajaId) => {
    setActiveCajaId(cajaId);
    setIsCounterOpen(true);
  };

  const handleCloseCounter = () => {
    setIsCounterOpen(false);
    setActiveCajaId(null);
  };

  const handleConfirmCount = (total) => {
    if (activeCajaId !== null) {
      handleRealBalanceChange(activeCajaId, total.toString());
    }
    handleCloseCounter();
  };

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            <span className="hidden sm:inline">Arqueo de Cajas</span>
            <span className="sm:hidden">Arqueo</span>
          </h1>
          <p className="mt-1 text-slate-500">Compara el saldo real de tus cajas con el saldo calculado y ajústalo si es necesario.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cajasConBalance.map(caja => (
            <ArqueoCajaCard 
              key={caja.id}
              caja={caja}
              realBalance={realBalances[caja.id] || ''}
              onRealBalanceChange={handleRealBalanceChange}
              onAdjust={handleAdjust}
              onOpenCounter={handleOpenCounter}
            />
          ))}
        </div>
      </div>
      <CashCounterModal 
        isOpen={isCounterOpen}
        onClose={handleCloseCounter}
        onConfirm={handleConfirmCount}
      />
    </>
  );
};

export default ArqueoPage;
