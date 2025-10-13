import React, { useState, useMemo } from 'react';
import AddTransactionForm from '../components/AddTransactionForm';
import TransactionCard from '../components/TransactionCard';
import { Filter, PlusCircle, Trash2 } from 'lucide-react';
import AddMemberModal from '../components/AddMemberModal';
import DeleteMemberModal from '../components/DeleteMemberModal';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const MembersPage = ({ transactions, onAddTransactions, cajas, members, onAddMember, onDeleteMember, incomeCategories, expenseCategories, categoryIconMap }) => {
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  const memberSummary = useMemo(() => {
    return members.map(member => {
      const income = transactions.filter(t => t.member_id === member.id && t.type === 'Ingreso').reduce((s, t) => s + t.amount, 0);
      const expenses = transactions.filter(t => t.member_id === member.id && t.type === 'Gasto').reduce((s, t) => s + t.amount, 0);
      return { ...member, balance: income - expenses };
    });
  }, [transactions, members]);

  const selectedMemberTransactions = useMemo(() => {
    if (!selectedMemberId) return [];
    return transactions
      .filter(t => t.member_id === selectedMemberId)
      .map(t => {
        const member = members.find(m => m.id === t.member_id);
        return { ...t, memberAvatar: member?.avatar };
      });
  }, [transactions, selectedMemberId, members]);
  
  const handleSaveTransaction = (data) => {
    const transactionDate = data.date;
    const amount = parseFloat(data.amount);

    if (data.type === 'Transferencia') {
        const fromCaja = cajas.find(c => c.id === parseInt(data.fromCajaId));
        const toCaja = cajas.find(c => c.id === parseInt(data.toCajaId));
        
        const expenseTx = {
            date: transactionDate,
            description: data.description || `Transferencia a ${toCaja.name}`,
            memberId: data.fromMemberId,
            cajaId: fromCaja.id,
            type: 'Gasto',
            category: 'Transferencia',
            amount: amount,
        };

        const incomeTx = {
            date: transactionDate,
            description: data.description || `Transferencia de ${fromCaja.name}`,
            memberId: data.toMemberId,
            cajaId: toCaja.id,
            type: 'Ingreso',
            category: 'Transferencia',
            amount: amount,
        };
        onAddTransactions([expenseTx, incomeTx]);

    } else if (data.type === 'Interna') {
        const fromCaja = cajas.find(c => c.id === parseInt(data.fromCajaId));
        const toCaja = cajas.find(c => c.id === parseInt(data.toCajaId));
        
        const expenseTx = {
            date: transactionDate,
            description: data.description || `Retiro a ${toCaja.name}`,
            memberId: fromCaja.member_id,
            cajaId: fromCaja.id,
            type: 'Gasto',
            category: 'Transferencia Interna',
            amount: amount,
        };

        const incomeTx = {
            date: transactionDate,
            description: data.description || `Depósito desde ${fromCaja.name}`,
            memberId: toCaja.member_id,
            cajaId: toCaja.id,
            type: 'Ingreso',
            category: 'Transferencia Interna',
            amount: amount,
        };
        onAddTransactions([expenseTx, incomeTx]);

    } else {
      const transactionToAdd = {
        date: transactionDate,
        description: data.description,
        memberId: data.memberId,
        cajaId: parseInt(data.cajaId),
        type: data.type,
        amount: amount,
        category: data.category,
      };
      onAddTransactions([transactionToAdd]);
    }
    setIsFormVisible(false);
  };

  const handleSaveMember = (data) => {
    onAddMember(data);
    setIsAddMemberModalOpen(false);
  };

  const handleOpenDeleteModal = (member) => {
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (memberToDelete) {
      onDeleteMember(memberToDelete.id);
      if (selectedMemberId === memberToDelete.id) {
        const remainingMembers = members.filter(m => m.id !== memberToDelete.id);
        setSelectedMemberId(remainingMembers[0]?.id || null);
      }
    }
    setIsDeleteModalOpen(false);
    setMemberToDelete(null);
  };

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestión de Miembros y Registros</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm self-start">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Miembros</h2>
              <button
                onClick={() => setIsAddMemberModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700"
              >
                <PlusCircle size={14} />
                Añadir
              </button>
            </div>
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
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold text-sm ${member.balance >= 0 ? 'text-slate-700' : 'text-red-600'}`}>{formatCurrency(member.balance)}</p>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDeleteModal(member);
                        }}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-full hover:bg-red-100 transition-colors"
                        title={`Eliminar a ${member.name}`}
                    >
                        <Trash2 size={16} />
                    </button>
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
                  incomeCategories={incomeCategories}
                  expenseCategories={expenseCategories}
                  categoryIconMap={categoryIconMap}
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
                      <TransactionCard key={`${t.id}-${t.date}`} transaction={t} cajas={cajas} categoryIconMap={categoryIconMap} />
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
      <AddMemberModal 
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onSave={handleSaveMember}
      />
      <DeleteMemberModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        memberName={memberToDelete?.name}
      />
    </>
  );
};

export default MembersPage;
