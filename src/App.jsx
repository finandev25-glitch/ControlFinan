import React, { useState, useEffect, useMemo } from 'react';
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
import MembersPage from './pages/MembersPage';
import FamilyPage from './pages/FamilyPage';
import ConfirmExpenseModal from './components/ConfirmExpenseModal';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { supabase } from './supabaseClient';
import { useStore } from './store/useStore';
import { LoaderCircle } from 'lucide-react';
import { format, isWithinInterval, addDays, startOfDay } from 'date-fns';

// Main App component that now uses Zustand
function App() {
  const session = useStore(state => state.session);
  const loading = useStore(state => state.loading);
  const family = useStore(state => state.family);
  const setSession = useStore(state => state.setSession);
  const fetchInitialData = useStore(state => state.fetchInitialData);
  const clearData = useStore(state => state.clearData);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const [expenseToConfirm, setExpenseToConfirm] = useState(null);
  const { cajas, members, transactions, scheduledExpenses, confirmScheduledExpense } = useStore();

  useEffect(() => {
    // Set initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, [setSession]);

  useEffect(() => {
    if (session?.user) {
      fetchInitialData(session.user);
    } else {
      // If there is no session, ensure we are not in a loading state
      clearData();
    }
  }, [session, fetchInitialData, clearData]);

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

  const handleCloseConfirmModal = () => setExpenseToConfirm(null);

  const handleConfirmExpense = async (updatedTransactionData, scheduledExpenseId) => {
    await confirmScheduledExpense(updatedTransactionData, scheduledExpenseId);
    handleCloseConfirmModal();
  };

  const pendingExpenses = useMemo(() => {
    const today = startOfDay(new Date());
    const fourDaysFromNow = addDays(today, 4);
    
    return scheduledExpenses.filter(exp => {
      const currentMonthPeriodKey = format(new Date(today.getFullYear(), today.getMonth()), 'yyyy-MM');
      if (exp.confirmed_months?.includes(currentMonthPeriodKey)) return false;
      const dueDateThisMonth = new Date(today.getFullYear(), today.getMonth(), exp.day_of_month);
      return isWithinInterval(dueDateThisMonth, { start: today, end: fourDaysFromNow });
    });
  }, [scheduledExpenses]);

  const { selectedYear, selectedMonth, setSelectedYear, setSelectedMonth, categories, familyMembers, updateFamilyMemberRole, deleteFamilyMember } = useStore();
  const availableYears = useMemo(() => {
    if (transactions.length === 0) return [new Date().getFullYear()];
    const years = new Set(transactions.map(t => new Date(t.date).getFullYear()));
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  const periodProps = { selectedYear, selectedMonth, onYearChange: setSelectedYear, onMonthChange: setSelectedMonth, availableYears };

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

  if (session && !loading && !family) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50 p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <LoaderCircle className="h-12 w-12 animate-spin text-primary-600" />
          <h2 className="text-xl font-semibold text-slate-700 mt-4">Configurando tu cuenta familiar...</h2>
          <p className="text-slate-500 max-w-sm">Estamos preparando todo. Si esto tarda más de unos segundos, por favor, intenta refrescar la página.</p>
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
            <Route path="/register" element={<RegisterPage />} />
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
                family={family}
              />
            }
          >
            <Route path="/" element={<DashboardPage {...periodProps} {...useStore()} />} />
            <Route path="/transacciones" element={<TransactionsPage {...useStore()} />} />
            <Route path="/cajas" element={<CajasPage {...useStore()} />} />
            <Route path="/arqueo" element={<ArqueoPage {...useStore()} />} />
            <Route path="/reportes" element={<ReportsPage {...useStore()} />} />
            <Route path="/analisis" element={<AdvancedReportsPage {...periodProps} {...useStore()} />} />
            <Route path="/presupuesto" element={<BudgetsPage {...periodProps} {...useStore()} />} />
            <Route path="/gastos-programados" element={<ScheduledExpensesPage {...periodProps} {...useStore()} />} />
            <Route path="/miembros" element={<MembersPage {...useStore()} />} />
            <Route path="/familia" element={<FamilyPage familyMembers={familyMembers} family={family} onUpdateRole={updateFamilyMemberRole} onDeleteMember={deleteFamilyMember} currentUserId={session?.user?.id} />} />
            <Route path="/configuracion" element={<SettingsPage {...useStore()} />} />
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
