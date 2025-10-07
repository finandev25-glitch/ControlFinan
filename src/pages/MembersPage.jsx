import React, { useState, useMemo } from 'react';
import AddTransactionForm from '../components/AddTransactionForm';
import TransactionCard from '../components/TransactionCard';
import { Filter, PlusCircle } from 'lucide-react';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const MembersPage = ({ transactions, onAddTransactions, cajas, members }) => {
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const memberSummary = useMemo(() => {
    return members.map(member => {
      const income = transactions.filter(t => t.memberId === member.id && t.type === 'Ingreso').reduce((s, t) => s + t.amount, 0);
      const expenses = transactions.filter(t => t.memberId === member.id && t.type === 'Gasto').reduce((s, t) => s + t.amount, 0);
      return { ...member, balance: income - expenses };
    });
  }, [transactions, members]);

  const selectedMemberTransactions = useMemo(() => {
    if (!selectedMemberId) return [];
    return transactions
      .filter(t => t.memberId === selectedMemberId)
      .map(t => {
        const member = members.find(m => m.id === t.memberId);
        return { ...t, memberAvatar: member?.avatar };
      });
  }, [transactions, selectedMemberId, members]);
  
  const handleSaveTransaction = (data) => {
    const transactionDate = data.date;
    const amount = parseFloat(data.amount);
    const cajaId = parseInt(data.cajaId);

    if (data.type === 'Transferencia') {
      const fromMember = members.find(m => m.id === parseInt(data.fromMemberId));
      const toMember = members.find(m => m.id === parseInt(data.toMemberId));

      const expenseTx = {
        id: Date.now(),
        date: transactionDate,
        description: `Transferencia a ${toMember.name}`,
        memberId: fromMember.id,
        memberName: fromMember.name,
        cajaId: cajaId,
        type: 'Gasto',
        category: 'Transferencia',
        amount: amount,
      };

      const incomeTx = {
        id: Date.now() + 1,
        date: transactionDate,
        description: `Transferencia de ${fromMember.name}`,
        memberId: toMember.id,
        memberName: toMember.name,
        cajaId: cajaId,
        type: 'Ingreso',
        category: 'Transferencia',
        amount: amount,
      };
      
      onAddTransactions([expenseTx, incomeTx]);

    } else {
      const member = members.find(m => m.id === parseInt(data.fromMemberId));
      const transactionToAdd = {
        id: Date.now(),
        date: transactionDate,
        description: data.description,
        memberId: member.id,
        memberName: member.name,
        cajaId: cajaId,
        type: data.type,
        amount: amount,
        category: data.category,
      };
      onAddTransactions([transactionToAdd]);
    }
    setIsFormVisible(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestión de Miembros y Registros</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm self-start">
          <h2 className="text-lg font-semibold mb-4">Miembros</h2>
          <div className="space-y-2">
            {memberSummary.map(member => (
              <div 
                key={member.id} 
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${selectedMemberId === member.id ? 'bg-primary-100 ring-2 ring-primary-500' : 'hover:bg-gray-100'}`}
                onClick={() => setSelectedMemberId(member.id)}
              >
                <div className="flex items-center gap-4">
                  <img src={member.avatar} alt={member.name} className="h-10 w-10 rounded-full" />
                  <div>
                    <p className="font-semibold text-sm">{member.name}</p>
                    <p className="text-xs text-slate-500">{member.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm ${member.balance >= 0 ? 'text-slate-700' : 'text-red-600'}`}>{formatCurrency(member.balance)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          {isFormVisible ? (
            <div className="mb-8">
              <AddTransactionForm 
                onSave={handleSaveTransaction}
                members={members.filter(m => m.role !== 'Dependiente')}
                selectedMemberId={selectedMemberId}
                onClose={() => setIsFormVisible(false)}
                cajas={cajas}
              />
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  Transacciones de {members.find(m => m.id === selectedMemberId)?.name || ''}
                </h2>
                <button
                  onClick={() => setIsFormVisible(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500"
                >
                  <PlusCircle size={18} />
                  Añadir Transacción
                </button>
              </div>
              <div className="space-y-3">
                {selectedMemberTransactions.length > 0 ? (
                  selectedMemberTransactions.map(t => (
                    <TransactionCard key={`${t.id}-${t.date}`} transaction={t} cajas={cajas} />
                  ))
                ) : (
                  <div className="text-center py-10 rounded-lg bg-slate-50 border-2 border-dashed border-slate-200">
                    <Filter className="mx-auto h-10 w-10 text-slate-400" />
                    <h3 className="mt-2 text-sm font-medium text-slate-900">No hay transacciones</h3>
                    <p className="mt-1 text-sm text-slate-500">No se encontraron movimientos para este miembro.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MembersPage;
