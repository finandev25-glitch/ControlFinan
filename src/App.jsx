import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AuthLayout from './components/AuthLayout';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import ReportsPage from './pages/ReportsPage';
import CajasPage from './pages/CajasPage';
import AdvancedReportsPage from './pages/AdvancedReportsPage';
import BudgetsPage from './pages/BudgetsPage';
import ArqueoPage from './pages/ArqueoPage';
import ScheduledExpensesPage from './pages/ScheduledExpensesPage';
import SettingsPage from './pages/SettingsPage';
import ConfirmExpenseModal from './components/ConfirmExpenseModal';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { supabase } from './supabaseClient';
import { Wallet, Landmark, CreditCard, University, LoaderCircle } from 'lucide-react';
import { format, isWithinInterval, addDays, startOfDay } from 'date-fns';
import { faker } from '@faker-js/faker';

const cajaIconMap = {
  'Efectivo': Wallet,
  'Cuenta Bancaria': Landmark,
  'Tarjeta de Crédito': CreditCard,
  'Préstamos': University,
};

function App() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [cajas, setCajas] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [scheduledExpenses, setScheduledExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [expenseToConfirm, setExpenseToConfirm] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchInitialData = useCallback(async (userId) => {
    if (!userId) return;
    setLoading(true);
    try {
      const [
        { data: finalMembers },
        { data: finalCajas },
        { data: finalTransactions },
        { data: finalBudgets },
        { data: finalScheduled },
        { data: finalCategories }
      ] = await Promise.all([
        supabase.from('members').select('*').eq('user_id', userId),
        supabase.from('cajas').select('*').eq('user_id', userId),
        supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('budgets').select('*').eq('user_id', userId),
        supabase.from('scheduled_expenses').select('*').eq('user_id', userId),
        supabase.from('categories').select('*').eq('user_id', userId)
      ]);

      const safeMembers = finalMembers || [];
      setMembers(safeMembers);
      setTransactions((finalTransactions || []).map(t => ({...t, memberName: safeMembers.find(m => m.id === t.member_id)?.name })) || []);
      setCajas((finalCajas || []).map(c => ({ ...c, icon: cajaIconMap[c.type] })) || []);
      setBudgets(finalBudgets || []);
      setScheduledExpenses(finalScheduled || []);
      setCategories(finalCategories || []);

    } catch (error) {
      console.error("Error loading data from Supabase:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (session) {
      fetchInitialData(session.user.id);
    }
  }, [session, fetchInitialData]);


  const handleAddTransactions = async (newTransactions, isTransfer = false, transferId = null) => {
    const transactionsToAdd = Array.isArray(newTransactions) ? newTransactions : [newTransactions];
    
    const supabaseTransactions = transactionsToAdd.map(t => ({
      date: t.date,
      description: t.description,
      member_id: t.memberId || null,
      caja_id: t.cajaId || null,
      type: t.type,
      category: t.category,
      amount: t.amount,
      transfer_id: isTransfer ? transferId : null,
      user_id: session.user.id,
    }));

    const { data, error } = await supabase.from('transactions').insert(supabaseTransactions).select();

    if (error) {
      console.error('Error adding transactions:', error);
    } else {
      const newTxsWithDetails = (data || []).map(tx => ({
          ...tx,
          memberName: members.find(m => m.id === tx.member_id)?.name || 'N/A'
      }));
      setTransactions(prev => [...newTxsWithDetails, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
    }
  };

  const handleUpdateTransaction = async (transactionId, updatedData) => {
    if (updatedData.isTransferEdit) {
      const { originalTransferId, newTransactions } = updatedData;
  
      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('transfer_id', originalTransferId);
  
      if (deleteError) {
        console.error('Error deleting old transfer during update:', deleteError);
        return;
      }
  
      setTransactions(prev => prev.filter(t => t.transfer_id !== originalTransferId));
  
      await handleAddTransactions(newTransactions, true, originalTransferId);
  
    } else {
      const supabaseData = {
        date: updatedData.date,
        description: updatedData.description,
        member_id: updatedData.memberId || null,
        caja_id: updatedData.cajaId || null,
        type: updatedData.type,
        category: updatedData.category,
        amount: updatedData.amount
      };
    
      const { data, error } = await supabase
        .from('transactions')
        .update(supabaseData)
        .eq('id', transactionId)
        .select();
    
      if (error) {
        console.error('Error updating transaction:', error);
      } else if (data && data.length > 0) {
        const updatedTx = data[0];
        setTransactions(prev => prev.map(t => 
          t.id === transactionId 
          ? { ...updatedTx, memberName: members.find(m => m.id === updatedTx.member_id)?.name } 
          : t
        ));
      }
    }
  };
  
  const handleDeleteTransaction = async (transaction) => {
    if (transaction.transfer_id) {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('transfer_id', transaction.transfer_id);

      if (error) {
        console.error('Error deleting transfer:', error);
      } else {
        setTransactions(prev => prev.filter(t => t.transfer_id !== transaction.transfer_id));
      }
    } else {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transaction.id);
      
      if (error) {
        console.error('Error deleting transaction:', error);
      } else {
        setTransactions(prev => prev.filter(t => t.id !== transaction.id));
      }
    }
  };

  const handleAddCaja = async (newCajaData) => {
    const supabaseData = {
      name: newCajaData.name,
      type: newCajaData.type,
      member_id: newCajaData.memberId || null,
      bank: newCajaData.bank,
      alias: newCajaData.alias,
      currency: newCajaData.currency,
      account_number: newCajaData.accountNumber,
      card_number: newCajaData.cardNumber,
      credit_line: newCajaData.creditLine,
      closing_day: newCajaData.closingDay,
      payment_due_date: newCajaData.paymentDueDate,
      loan_purpose: newCajaData.loanPurpose,
      total_installments: newCajaData.totalInstallments,
      paid_installments: newCajaData.paidInstallments,
      payment_day: newCajaData.paymentDay,
      monthly_payment: newCajaData.monthlyPayment,
      user_id: session.user.id,
    };

    Object.keys(supabaseData).forEach(key => {
      if (supabaseData[key] === undefined || supabaseData[key] === '') {
        delete supabaseData[key];
      }
    });

    const { data, error } = await supabase.from('cajas').insert([supabaseData]).select();
    
    if (error) {
      console.error('Error adding caja:', error);
    } else if (data && data.length > 0) {
      const newCaja = data[0];
      const newCajaWithIcon = { ...newCaja, icon: cajaIconMap[newCaja.type] };
      setCajas(prev => [...prev, newCajaWithIcon]);

      if (newCaja.type === 'Préstamos' || newCaja.type === 'Tarjeta de Crédito') {
        const isLoan = newCaja.type === 'Préstamos';
        const newExpenseData = {
          description: isLoan ? `Cuota de ${newCaja.name}` : `Pago de Tarjeta ${newCaja.name}`,
          amount: isLoan ? parseFloat(newCaja.monthly_payment) || 0 : 0,
          category: isLoan ? 'Vivienda' : 'Servicios',
          day_of_month: isLoan ? parseInt(newCaja.payment_day) || 1 : parseInt(newCaja.payment_due_date) || 1,
          member_id: newCaja.member_id,
          caja_id: null,
          is_automatic: true,
          is_credit_card_payment: !isLoan,
          credit_card_id: isLoan ? null : newCaja.id,
        };
        await handleAddScheduledExpense(newExpenseData);
      }
    }
  };

  const handleSaveBudget = async (newBudget) => {
    const budgetToSave = { ...newBudget, user_id: session.user.id };
    const { data, error } = await supabase.from('budgets').upsert(budgetToSave, { onConflict: 'user_id,category,month,year' }).select();
    
    if (error) {
      console.error('Error saving budget:', error);
    } else if (data && data.length > 0) {
      setBudgets(prev => {
        const existingIndex = prev.findIndex(b => b.category === newBudget.category && b.month === newBudget.month && b.year === newBudget.year);
        if (existingIndex > -1) {
          const updatedBudgets = [...prev];
          updatedBudgets[existingIndex] = data[0];
          return updatedBudgets;
        }
        return [...prev, data[0]];
      });
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    const { error } = await supabase.from('budgets').delete().eq('id', budgetId);
    if (error) {
      console.error('Error deleting budget:', error);
    } else {
      setBudgets(prev => prev.filter(b => b.id !== budgetId));
    }
  };

  const handleAddScheduledExpense = async (newExpenseData) => {
    const supabaseData = {
      ...newExpenseData,
      member_id: newExpenseData.member_id || null,
      caja_id: newExpenseData.caja_id || null,
      user_id: session.user.id,
    };
    const { data, error } = await supabase.from('scheduled_expenses').insert([supabaseData]).select();
    if (error) {
      console.error('Error adding scheduled expense:', error);
    } else if (data && data.length > 0) {
      setScheduledExpenses(prev => [...prev, data[0]]);
    }
  };
  
  const handleAddMember = async (newMemberData) => {
    const newMember = {
      ...newMemberData,
      avatar: faker.image.avatar(),
      user_id: session.user.id,
    };
    const { data, error } = await supabase.from('members').insert([newMember]).select();
    if (error) {
      console.error('Error adding member:', error);
    } else if (data && data.length > 0) {
      const newlyAddedMember = data[0];
      setMembers(prev => [...prev, newlyAddedMember]);

      const firstName = newlyAddedMember.name.split(' ')[0];
      const newCashBox = {
          name: `Efectivo ${firstName}`,
          type: 'Efectivo',
          member_id: newlyAddedMember.id,
          user_id: session.user.id,
      };

      const { data: cajaData, error: cajaError } = await supabase
          .from('cajas')
          .insert([newCashBox])
          .select();

      if (cajaError) {
          console.error('Error creating default cash box:', cajaError);
      } else if (cajaData && cajaData.length > 0) {
          const newCajaWithIcon = { ...cajaData[0], icon: cajaIconMap[cajaData[0].type] };
          setCajas(prev => [...prev, newCajaWithIcon]);
      }
    }
  };

  const handleDeleteMember = async (memberId) => {
    const { error: cajasError } = await supabase
      .from('cajas')
      .delete()
      .eq('member_id', memberId);

    if (cajasError) {
      console.error("Error deleting member's cash boxes:", cajasError);
      return; 
    }

    const { error: memberError } = await supabase
      .from('members')
      .delete()
      .eq('id', memberId);

    if (memberError) {
      console.error('Error deleting member:', memberError);
      return;
    }

    setMembers(prev => prev.filter(m => m.id !== memberId));
    setCajas(prev => prev.filter(c => c.member_id !== memberId));
    setTransactions(prev => prev.map(t => 
        t.member_id === memberId 
        ? { ...t, member_id: null, memberName: 'Eliminado' } 
        : t
    ));
  };

  const handleAddCategory = async (categoryData) => {
    const categoryToSave = { ...categoryData, user_id: session.user.id };
    const { data, error } = await supabase.from('categories').insert([categoryToSave]).select();
    if (error) {
      console.error('Error adding category:', error);
    } else if (data && data.length > 0) {
      setCategories(prev => [...prev, data[0]]);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const { error } = await supabase.from('categories').delete().eq('id', categoryId);
    if (error) {
      console.error('Error deleting category:', error);
    } else {
      setCategories(prev => prev.filter(c => c.id !== categoryId));
    }
  };

  const handleUpdateMemberAvatar = async (memberId, newAvatar) => {
    const { data, error } = await supabase.from('members').update({ avatar: newAvatar }).eq('id', memberId).select();
    if (error) {
      console.error('Error updating avatar:', error);
    } else if (data && data.length > 0) {
      setMembers(prev => prev.map(m => m.id === memberId ? data[0] : m));
    }
  };

  const handleOpenConfirmModal = (expense) => {
    let expenseToReview = { ...expense, amount: expense.amount, dayOfMonth: expense.day_of_month, memberId: expense.member_id };
    if (expense.is_credit_card_payment) {
        const creditCard = cajas.find(c => c.id === expense.credit_card_id);
        if (creditCard) {
            const today = new Date();
            const cycleStart = new Date(today.getFullYear(), today.getMonth() -1, creditCard.closing_day + 1);
            const cycleEnd = new Date(today.getFullYear(), today.getMonth(), creditCard.closing_day);
            
            const cycleTransactions = transactions.filter(t => 
                t.caja_id === creditCard.id &&
                t.type === 'Gasto' &&
                new Date(t.date) >= cycleStart &&
                new Date(t.date) <= cycleEnd
            );
            const cycleTotal = cycleTransactions.reduce((sum, t) => sum + t.amount, 0);
            expenseToReview.amount = cycleTotal;
        }
    }
    setExpenseToConfirm(expenseToReview);
  };

  const handleCloseConfirmModal = () => {
    setExpenseToConfirm(null);
  };

  const handleConfirmExpense = async (updatedTransactionData, scheduledExpenseId) => {
    const newTransaction = {
      ...updatedTransactionData,
      type: 'Gasto',
    };
    await handleAddTransactions([newTransaction]);

    const today = new Date();
    const periodKey = format(new Date(today.getFullYear(), today.getMonth()), 'yyyy-MM');

    const scheduledExpense = scheduledExpenses.find(e => e.id === scheduledExpenseId);
    const updatedConfirmedMonths = [...(scheduledExpense.confirmed_months || []), periodKey];

    const { error } = await supabase
      .from('scheduled_expenses')
      .update({ confirmed_months: updatedConfirmedMonths })
      .eq('id', scheduledExpenseId);

    if (error) {
      console.error('Error updating scheduled expense:', error);
    } else {
      setScheduledExpenses(prev => prev.map(exp => 
        exp.id === scheduledExpenseId 
          ? { ...exp, confirmed_months: updatedConfirmedMonths } 
          : exp
      ));
    }
    handleCloseConfirmModal();
  };

  const availableYears = useMemo(() => {
    if (transactions.length === 0) {
      return [new Date().getFullYear()];
    }
    const years = new Set(transactions.map(t => new Date(t.date).getFullYear()));
    const currentYear = new Date().getFullYear();
    years.add(currentYear);
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  const periodProps = {
    selectedYear,
    selectedMonth,
    onYearChange: setSelectedYear,
    onMonthChange: setSelectedMonth,
    availableYears,
  };

  const pendingExpenses = useMemo(() => {
    const today = startOfDay(new Date());
    const fourDaysFromNow = addDays(today, 4);
    
    return scheduledExpenses.filter(exp => {
      const currentMonthPeriodKey = format(new Date(today.getFullYear(), today.getMonth()), 'yyyy-MM');
      
      const isConfirmedForCurrentMonth = exp.confirmed_months?.includes(currentMonthPeriodKey);
      if (isConfirmedForCurrentMonth) {
        return false;
      }
      
      const dueDateThisMonth = new Date(today.getFullYear(), today.getMonth(), exp.day_of_month);

      const isDueSoon = isWithinInterval(dueDateThisMonth, {
        start: today,
        end: fourDaysFromNow
      });
      
      return isDueSoon;
    });
  }, [scheduledExpenses]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    } else {
      // Clear all local state
      setMembers([]);
      setTransactions([]);
      setCajas([]);
      setBudgets([]);
      setScheduledExpenses([]);
      setCategories([]);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <LoaderCircle className="h-12 w-12 animate-spin text-primary-600" />
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {!session ? (
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage onRegister={fetchInitialData} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Route>
        ) : (
          <Route 
            element={
              <Layout 
                pendingExpenses={pendingExpenses}
                onReviewExpense={handleOpenConfirmModal}
                members={members}
                cajas={cajas}
                onLogout={handleLogout}
                categories={categories}
              />
            }
          >
            <Route 
              path="/" 
              element={
                <DashboardPage 
                  transactions={transactions} 
                  members={members} 
                  budgets={budgets} 
                  cajas={cajas}
                  scheduledExpenses={scheduledExpenses}
                  categories={categories}
                  {...periodProps} 
                />
              } 
            />
            <Route 
              path="/transacciones" 
              element={
                <TransactionsPage 
                  transactions={transactions} 
                  onAddTransactions={handleAddTransactions} 
                  onUpdateTransaction={handleUpdateTransaction} 
                  onDeleteTransaction={handleDeleteTransaction} 
                  cajas={cajas} 
                  members={members} 
                  categories={categories} 
                />
              } 
            />
            <Route 
              path="/cajas" 
              element={<CajasPage transactions={transactions} cajas={cajas} onAddCaja={handleAddCaja} members={members} />} 
            />
            <Route 
              path="/arqueo" 
              element={<ArqueoPage transactions={transactions} cajas={cajas} onAddTransactions={handleAddTransactions} members={members} />} 
            />
            <Route 
              path="/reportes" 
              element={<ReportsPage transactions={transactions} cajas={cajas} members={members} categories={categories} />} 
            />
            <Route 
              path="/analisis" 
              element={<AdvancedReportsPage transactions={transactions} members={members} categories={categories} {...periodProps} />} 
            />
            <Route 
              path="/presupuesto" 
              element={<BudgetsPage budgets={budgets} transactions={transactions} onSaveBudget={handleSaveBudget} onDeleteBudget={handleDeleteBudget} categories={categories} {...periodProps} />} 
            />
            <Route
              path="/gastos-programados"
              element={
                <ScheduledExpensesPage
                  scheduledExpenses={scheduledExpenses}
                  onAddScheduledExpense={handleAddScheduledExpense}
                  members={members}
                  cajas={cajas}
                  transactions={transactions}
                  categories={categories}
                  {...periodProps}
                />
              }
            />
            <Route
              path="/configuracion"
              element={
                <SettingsPage
                  categories={categories}
                  members={members}
                  transactions={transactions}
                  onAddCategory={handleAddCategory}
                  onDeleteCategory={handleDeleteCategory}
                  onAddMember={handleAddMember}
                  onDeleteMember={handleDeleteMember}
                  onUpdateMemberAvatar={handleUpdateMemberAvatar}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        )}
      </Routes>
      {session && (
        <ConfirmExpenseModal
          isOpen={!!expenseToConfirm}
          onClose={handleCloseConfirmModal}
          onConfirm={handleConfirmExpense}
          expense={expenseToConfirm}
          members={members}
          cajas={cajas}
        />
      )}
    </Router>
  );
}

export default App;
