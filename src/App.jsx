import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import MembersPage from './pages/MembersPage';
import ReportsPage from './pages/ReportsPage';
import CajasPage from './pages/CajasPage';
import AdvancedReportsPage from './pages/AdvancedReportsPage';
import BudgetsPage from './pages/BudgetsPage';
import ArqueoPage from './pages/ArqueoPage';
import ScheduledExpensesPage from './pages/ScheduledExpensesPage';
import SettingsPage from './pages/SettingsPage';
import ConfirmExpenseModal from './components/ConfirmExpenseModal';
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
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const { data: membersData } = await supabase.from('members').select('*');
        
        if (membersData && membersData.length === 0) {
          await seedDatabase();
        }

        const [
          { data: finalMembers },
          { data: finalCajas },
          { data: finalTransactions },
          { data: finalBudgets },
          { data: finalScheduled },
          { data: finalCategories }
        ] = await Promise.all([
          supabase.from('members').select('*'),
          supabase.from('cajas').select('*'),
          supabase.from('transactions').select('*').order('date', { ascending: false }),
          supabase.from('budgets').select('*'),
          supabase.from('scheduled_expenses').select('*'),
          supabase.from('categories').select('*')
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
    };

    fetchInitialData();
  }, []);

  const seedDatabase = async () => {
    console.log("Database is empty. Seeding data...");
    const { members: mockMembers, cajas: mockCajas, transactions: mockTransactions, budgets: mockBudgets, scheduledExpenses: mockScheduled, categories: mockCategories } = await import('./data/seed.js');
    
    await supabase.from('members').insert(mockMembers);
    
    const cajasToInsert = mockCajas.map(({ icon, ...rest }) => rest);
    await supabase.from('cajas').insert(cajasToInsert);

    const transactionsToInsert = mockTransactions.map(({ memberName, ...rest }) => ({
        ...rest,
        member_id: rest.memberId,
        caja_id: rest.cajaId,
    }));
    await supabase.from('transactions').insert(transactionsToInsert);
    
    await supabase.from('budgets').insert(mockBudgets);

    const scheduledToInsert = mockScheduled.map(({ ...rest }) => ({
        ...rest,
        member_id: rest.memberId,
        caja_id: rest.cajaId,
        day_of_month: rest.dayOfMonth,
        confirmed_months: rest.confirmedMonths,
    }));
    await supabase.from('scheduled_expenses').insert(scheduledToInsert);
    
    await supabase.from('categories').insert(mockCategories);
    console.log("Seeding complete.");
  };

  const handleAddTransactions = async (newTransactions) => {
    const transactionsToAdd = Array.isArray(newTransactions) ? newTransactions : [newTransactions];
    
    const supabaseTransactions = transactionsToAdd.map(t => ({
      date: t.date,
      description: t.description,
      member_id: t.memberId,
      caja_id: t.cajaId,
      type: t.type,
      category: t.category,
      amount: t.amount
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

  const handleAddCaja = async (newCajaData) => {
    const supabaseData = {
      name: newCajaData.name,
      type: newCajaData.type,
      member_id: newCajaData.memberId,
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
    const { data, error } = await supabase.from('budgets').upsert(newBudget, { onConflict: 'category' }).select();
    
    if (error) {
      console.error('Error saving budget:', error);
    } else if (data && data.length > 0) {
      setBudgets(prev => {
        const existingIndex = prev.findIndex(b => b.category === newBudget.category);
        if (existingIndex > -1) {
          const updatedBudgets = [...prev];
          updatedBudgets[existingIndex] = data[0];
          return updatedBudgets;
        }
        return [...prev, data[0]];
      });
    }
  };

  const handleAddScheduledExpense = async (newExpenseData) => {
    const { data, error } = await supabase.from('scheduled_expenses').insert([newExpenseData]).select();
    if (error) {
      console.error('Error adding scheduled expense:', error);
    } else if (data && data.length > 0) {
      setScheduledExpenses(prev => [...prev, data[0]]);
    }
  };
  
  const handleAddMember = async (newMemberData) => {
    const newMember = {
      ...newMemberData,
      avatar: faker.image.avatar()
    };
    const { data, error } = await supabase.from('members').insert([newMember]).select();
    if (error) {
      console.error('Error adding member:', error);
    } else if (data && data.length > 0) {
      const newlyAddedMember = data[0];
      setMembers(prev => [...prev, newlyAddedMember]);

      const newCashBox = {
          name: `Efectivo ${newlyAddedMember.name}`,
          type: 'Efectivo',
          member_id: newlyAddedMember.id,
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
    const { data, error } = await supabase.from('categories').insert([categoryData]).select();
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

  const periodProps = {
    selectedYear,
    selectedMonth,
    onYearChange: setSelectedYear,
    onMonthChange: setSelectedMonth,
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

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <LoaderCircle className="h-12 w-12 animate-spin text-primary-600" />
          <p className="text-slate-600">Conectando con la base de datos...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Layout 
        pendingExpenses={pendingExpenses}
        onReviewExpense={handleOpenConfirmModal}
        members={members}
        cajas={cajas}
        categories={categories}
      >
        <Routes>
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
            path="/miembros" 
            element={<MembersPage transactions={transactions} onAddTransactions={handleAddTransactions} cajas={cajas} members={members} onAddMember={handleAddMember} onDeleteMember={handleDeleteMember} categories={categories} />} 
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
            element={<BudgetsPage budgets={budgets} transactions={transactions} onSaveBudget={handleSaveBudget} categories={categories} {...periodProps} />} 
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
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
                onUpdateMemberAvatar={handleUpdateMemberAvatar}
              />
            }
          />
        </Routes>
      </Layout>
      <ConfirmExpenseModal
        isOpen={!!expenseToConfirm}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmExpense}
        expense={expenseToConfirm}
        members={members}
        cajas={cajas}
      />
    </Router>
  );
}

export default App;
