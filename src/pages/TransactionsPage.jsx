import React, { useState, useMemo } from 'react';
import AddTransactionForm from '../components/AddTransactionForm';
import TransactionCard from '../components/TransactionCard';
import { Filter, PlusCircle } from 'lucide-react';
import DeleteTransactionModal from '../components/DeleteTransactionModal';
import MemberSelector from '../components/MemberSelector';
import * as Icons from 'lucide-react';

const TransactionTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { key: 'movimientos', label: 'Ing./Gast.' },
    { key: 'transferencias', label: 'Transferencias' },
    { key: 'internas', label: 'Ret./Dep.' },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex gap-x-2 sm:gap-x-6" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 sm:flex-initial text-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab.key
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

const TransactionsPage = ({ transactions, onAddTransactions, onUpdateTransaction, onDeleteTransaction, cajas, members, categories }) => {
  const [selectedMemberId, setSelectedMemberId] = useState('all');
  const [activeTab, setActiveTab] = useState('movimientos');
  const [transactionToEdit, setTransactionToEdit] = useState(null);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [isDeleteTransactionModalOpen, setDeleteTransactionModalOpen] = useState(false);

  const incomeCategories = useMemo(() => categories.filter(c => c.type === 'Ingreso'), [categories]);
  const expenseCategories = useMemo(() => categories.filter(c => c.type === 'Gasto'), [categories]);

  const categoryIconMap = useMemo(() => {
    return categories.reduce((acc, cat) => {
      const IconComponent = Icons[cat.icon_name] || Icons.Tag;
      acc[cat.name] = IconComponent;
      return acc;
    }, {});
  }, [categories]);

  const displayedTransactions = useMemo(() => {
    const memberFiltered = selectedMemberId === 'all'
      ? transactions
      : transactions.filter(t => String(t.member_id) === String(selectedMemberId));

    if (activeTab === 'movimientos') {
      return memberFiltered.filter(t => t.category !== 'Transferencia' && t.category !== 'Transferencia Interna');
    }
    if (activeTab === 'transferencias') {
      const transferIds = new Set();
      return memberFiltered.filter(t => {
        if (t.category === 'Transferencia' && !transferIds.has(t.transfer_id)) {
          transferIds.add(t.transfer_id);
          return true;
        }
        return false;
      });
    }
    if (activeTab === 'internas') {
      const transferIds = new Set();
      return memberFiltered.filter(t => {
        if (t.category === 'Transferencia Interna' && !transferIds.has(t.transfer_id)) {
          transferIds.add(t.transfer_id);
          return true;
        }
        return false;
      });
    }
    return [];
  }, [transactions, selectedMemberId, activeTab]);

  const handleSaveTransaction = React.useCallback((arg1, arg2, arg3, arg4) => {
    if (Array.isArray(arg1)) {
        onAddTransactions(arg1, arg3, arg4);
    } else {
        onUpdateTransaction(arg1, arg2);
    }
    setTransactionToEdit(null);
  }, [onAddTransactions, onUpdateTransaction]);

  const handleEditTransaction = React.useCallback((transaction) => {
    setTransactionToEdit(transaction);
    // Scroll to top to make form visible on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleDeleteTransactionRequest = React.useCallback((transaction) => {
    setTransactionToDelete(transaction);
    setDeleteTransactionModalOpen(true);
  }, []);

  const handleConfirmDeleteTransaction = () => {
    if (transactionToDelete) {
      onDeleteTransaction(transactionToDelete);
    }
    setTransactionToDelete(null);
    setDeleteTransactionModalOpen(false);
  };

  const handleCloseForm = () => {
    setTransactionToEdit(null);
  };

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">
                    <span className="hidden sm:inline">Registro de Transacciones</span>
                    <span className="sm:hidden">Transacciones</span>
                </h1>
                <p className="mt-1 text-slate-500">Añade, edita o elimina tus movimientos.</p>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <MemberSelector
                  members={members}
                  selectedMemberId={selectedMemberId}
                  onMemberChange={setSelectedMemberId}
                />
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <TransactionTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
            <div className="space-y-3">
              {displayedTransactions.length > 0 ? (
                displayedTransactions.map(t => (
                  <TransactionCard 
                    key={`${t.id}-${t.transfer_id}`}
                    transaction={t} 
                    cajas={cajas} 
                    categoryIconMap={categoryIconMap} 
                    onEdit={handleEditTransaction}
                    onDelete={handleDeleteTransactionRequest}
                    members={members}
                    showMemberAvatar={selectedMemberId === 'all'}
                  />
                ))
              ) : (
                <div className="text-center py-16 rounded-lg bg-white border-2 border-dashed border-slate-200">
                  <Filter className="mx-auto h-12 w-12 text-slate-400" />
                  <h3 className="mt-2 text-lg font-medium text-slate-900">No hay transacciones</h3>
                  <p className="mt-1 text-sm text-slate-500">No se encontraron movimientos para esta vista.</p>
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-1 lg:sticky lg:top-24 self-start">
             <AddTransactionForm 
                onSave={handleSaveTransaction}
                members={members.filter(m => m.role !== 'Dependiente')}
                onClose={handleCloseForm}
                cajas={cajas}
                incomeCategories={incomeCategories}
                expenseCategories={expenseCategories}
                categoryIconMap={categoryIconMap}
                transactionToEdit={transactionToEdit}
                transactions={transactions}
              />
          </div>
        </div>
      </div>
      <DeleteTransactionModal
        isOpen={isDeleteTransactionModalOpen}
        onClose={() => setDeleteTransactionModalOpen(false)}
        onConfirm={handleConfirmDeleteTransaction}
      />
    </>
  );
};

export default TransactionsPage;
