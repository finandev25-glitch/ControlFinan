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
import ConfirmExpenseModal from './components/ConfirmExpenseModal';
import { supabase } from './supabaseClient';
import { Wallet, Landmark, CreditCard, University, LoaderCircle } from 'lucide-react';
import { format, isWithinInterval, addDays, startOfDay } from 'date-fns';

const iconMap = {
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
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [expenseToConfirm, setExpenseToConfirm] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const { data: membersData } = await supabase.from('miembros').select('*');
        
        if (membersData && membersData.length === 0) {
          // Database is empty, let's seed it.
          await seedDatabase();
        }

        const [
          { data: finalMembers },
          { data: finalCajas },
          { data: finalTransactions },
          { data: finalBudgets },
          { data: finalScheduled }
        ] = await Promise.all([
          supabase.from('miembros').select('*'),
          supabase.from('cajas').select('*'),
          supabase.from('transacciones').select('*').order('fecha', { ascending: false }),
          supabase.from('presupuestos').select('*'),
          supabase.from('gastos_programados').select('*')
        ]);

        const safeMembers = finalMembers || [];
        setMembers(safeMembers);
        setTransactions((finalTransactions || []).map(t => ({...t, memberName: safeMembers.find(m => m.id === t.miembro_id)?.name })) || []);
        setCajas((finalCajas || []).map(c => ({ ...c, icon: iconMap[c.type] })) || []);
        setBudgets(finalBudgets || []);
        setScheduledExpenses(finalScheduled || []);

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
    const { members: mockMembers, cajas: mockCajas, transactions: mockTransactions, budgets: mockBudgets, scheduledExpenses: mockScheduled } = await import('./data/seed.js');
    
    await supabase.from('miembros').insert(mockMembers);
    
    const cajasToInsert = mockCajas.map(({ icon, ...rest }) => rest);
    await supabase.from('cajas').insert(cajasToInsert);

    const transactionsToInsert = mockTransactions.map(({ memberName, ...rest }) => ({
        ...rest,
        miembro_id: rest.memberId,
        caja_id: rest.cajaId,
    }));
    await supabase.from('transacciones').insert(transactionsToInsert);
    
    await supabase.from('presupuestos').insert(mockBudgets);

    const scheduledToInsert = mockScheduled.map(({ ...rest }) => ({
        ...rest,
        miembro_id: rest.memberId,
        caja_id: rest.cajaId,
        dia_del_mes: rest.dayOfMonth,
        meses_confirmados: rest.confirmedMonths,
    }));
    await supabase.from('gastos_programados').insert(scheduledToInsert);
    console.log("Seeding complete.");
  };

  const handleAddTransactions = async (newTransactions) => {
    const transactionsToAdd = Array.isArray(newTransactions) ? newTransactions : [newTransactions];
    
    const supabaseTransactions = transactionsToAdd.map(t => ({
      fecha: t.date,
      descripcion: t.description,
      miembro_id: t.memberId,
      caja_id: t.cajaId,
      tipo: t.type,
      categoria: t.category,
      monto: t.amount
    }));

    const { data, error } = await supabase.from('transacciones').insert(supabaseTransactions).select();

    if (error) {
      console.error('Error adding transactions:', error);
    } else {
      const newTxsWithDetails = (data || []).map(tx => ({
          ...tx,
          memberName: members.find(m => m.id === tx.miembro_id)?.name || 'N/A'
      }));
      setTransactions(prev => [...newTxsWithDetails, ...prev].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
    }
  };

  const handleAddCaja = async (newCajaData) => {
    const { data, error } = await supabase.from('cajas').insert([newCajaData]).select();
    
    if (error) {
      console.error('Error adding caja:', error);
    } else if (data && data.length > 0) {
      const newCaja = data[0];
      const newCajaWithIcon = { ...newCaja, icon: iconMap[newCaja.type] };
      setCajas(prev => [...prev, newCajaWithIcon]);

      if (newCaja.type === 'Préstamos' || newCaja.type === 'Tarjeta de Crédito') {
        const isLoan = newCaja.type === 'Préstamos';
        const newExpenseData = {
          descripcion: isLoan ? `Cuota de ${newCaja.name}` : `Pago de Tarjeta ${newCaja.name}`,
          monto: isLoan ? parseFloat(newCaja.monto_cuota_mensual) || 0 : 0,
          categoria: isLoan ? 'Vivienda' : 'Servicios',
          dia_del_mes: isLoan ? parseInt(newCaja.dia_pago) : parseInt(newCaja.dia_pago_limite),
          miembro_id: newCaja.miembro_id,
          caja_id: null,
          es_automatico: true,
          es_pago_tarjeta: !isLoan,
          tarjeta_credito_id: isLoan ? null : newCaja.id,
        };
        await handleAddScheduledExpense(newExpenseData);
      }
    }
  };

  const handleSaveBudget = async (newBudget) => {
    const { data, error } = await supabase.from('presupuestos').upsert(newBudget, { onConflict: 'categoria' }).select();
    
    if (error) {
      console.error('Error saving budget:', error);
    } else if (data && data.length > 0) {
      setBudgets(prev => {
        const existingIndex = prev.findIndex(b => b.categoria === newBudget.categoria);
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
    const { data, error } = await supabase.from('gastos_programados').insert([newExpenseData]).select();
    if (error) {
      console.error('Error adding scheduled expense:', error);
    } else if (data && data.length > 0) {
      setScheduledExpenses(prev => [...prev, data[0]]);
    }
  };
  
  const handleOpenConfirmModal = (expense) => {
    let expenseToReview = { ...expense, amount: expense.monto, dayOfMonth: expense.dia_del_mes, memberId: expense.miembro_id };
    if (expense.es_pago_tarjeta) {
        const creditCard = cajas.find(c => c.id === expense.tarjeta_credito_id);
        if (creditCard) {
            const today = new Date();
            const cycleStart = new Date(today.getFullYear(), today.getMonth() -1, creditCard.dia_cierre + 1);
            const cycleEnd = new Date(today.getFullYear(), today.getMonth(), creditCard.dia_cierre);
            
            const cycleTransactions = transactions.filter(t => 
                t.caja_id === creditCard.id &&
                t.tipo === 'Gasto' &&
                new Date(t.fecha) >= cycleStart &&
                new Date(t.fecha) <= cycleEnd
            );
            const cycleTotal = cycleTransactions.reduce((sum, t) => sum + t.monto, 0);
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
    const updatedConfirmedMonths = [...(scheduledExpense.meses_confirmados || []), periodKey];

    const { error } = await supabase
      .from('gastos_programados')
      .update({ meses_confirmados: updatedConfirmedMonths })
      .eq('id', scheduledExpenseId);

    if (error) {
      console.error('Error updating scheduled expense:', error);
    } else {
      setScheduledExpenses(prev => prev.map(exp => 
        exp.id === scheduledExpenseId 
          ? { ...exp, meses_confirmados: updatedConfirmedMonths } 
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
      
      const isConfirmedForCurrentMonth = exp.meses_confirmados?.includes(currentMonthPeriodKey);
      if (isConfirmedForCurrentMonth) {
        return false;
      }
      
      const dueDateThisMonth = new Date(today.getFullYear(), today.getMonth(), exp.dia_del_mes);

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
                {...periodProps} 
              />
            } 
          />
          <Route 
            path="/miembros" 
            element={<MembersPage transactions={transactions} onAddTransactions={handleAddTransactions} cajas={cajas} members={members} />} 
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
            element={<ReportsPage transactions={transactions} cajas={cajas} members={members} />} 
          />
           <Route 
            path="/analisis" 
            element={<AdvancedReportsPage transactions={transactions} members={members} {...periodProps} />} 
          />
          <Route 
            path="/presupuesto" 
            element={<BudgetsPage budgets={budgets} transactions={transactions} onSaveBudget={handleSaveBudget} {...periodProps} />} 
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
                {...periodProps}
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
