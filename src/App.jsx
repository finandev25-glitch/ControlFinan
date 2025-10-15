import React, { useEffect, useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import Layout from './components/Layout';
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
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SetupPage from './pages/SetupPage';
import { useStore } from './store/useStore';
import { supabase } from './supabaseClient';
import { LoaderCircle, WifiOff, Database, ShieldAlert, ClipboardCopy, Check, AlertTriangle } from 'lucide-react';
import ConfirmExpenseModal from './components/ConfirmExpenseModal';

const NetworkErrorScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 text-center">
    <div className="max-w-2xl w-full">
      <WifiOff className="mx-auto h-16 w-16 text-red-500" />
      <h1 className="mt-4 text-2xl font-bold text-slate-800">Error de Conexión</h1>
      <p className="mt-2 text-slate-600">
        No se pudo establecer la conexión con el servidor. Esto suele ocurrir por un problema de red o una configuración incorrecta de CORS en tu proyecto de Supabase.
      </p>
      <div className="mt-6 text-left bg-slate-100 p-6 rounded-lg border border-slate-200">
        <h2 className="font-semibold text-slate-800">¿Cómo solucionarlo? (Error de CORS)</h2>
        <p className="mt-2 text-sm text-slate-600">
          Para permitir que tu aplicación se comunique con Supabase, necesitas añadir la URL de esta página a la lista de orígenes permitidos.
        </p>
        <ol className="list-decimal list-inside mt-4 space-y-2 text-sm text-slate-600">
          <li>Ve a la configuración de tu proyecto en <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 font-semibold hover:underline">Supabase</a>.</li>
          <li>Navega a <strong>Settings &gt; API</strong>.</li>
          <li>En la sección <strong>CORS Configuration</strong>, añade la siguiente URL al campo <strong>"Additional allowed origins"</strong>:</li>
          <li className="p-2 bg-slate-200 rounded-md">
            <code className="font-mono text-xs break-all">{window.location.origin}</code>
          </li>
          <li>Guarda los cambios y <strong>refresca esta página</strong>.</li>
        </ol>
      </div>
    </div>
  </div>
);

const DatabaseProblemScreen = ({ errorType, errorMessage, onLogout }) => {
  const [copied, setCopied] = useState(false);
  const projectRef = import.meta.env.VITE_SUPABASE_URL?.split('.')[0].replace('https://', '');
  const sqlEditorUrl = `https://app.supabase.com/project/${projectRef}/sql`;

  const problemSource = errorMessage?.match(/'([^']+)'/)?.[1] || 'desconocida';
  const isTimeout = errorType === 'DATABASE_TIMEOUT_ERROR';
  
  const title = isTimeout ? "La Consulta a la Base de Datos Expiró" : "Error Crítico en la Base de Datos";
  const explanation = isTimeout 
    ? `La consulta a la tabla o vista '${problemSource}' tardó demasiado en responder y fue cancelada. Esto generalmente indica una vista o un trigger ineficiente que consume demasiados recursos.`
    : `Se ha detectado un error crítico de recursión infinita en la tabla o vista '${problemSource}'. Esto ocurre cuando una vista se llama a sí misma en un bucle sin fin.`;

  const sqlScriptExample = `-- SCRIPT DE DIAGNÓSTICO PARA '${problemSource}'

-- PASO 1: Comprueba si '${problemSource}' es una TABLA o una VISTA.
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = '${problemSource}';

-- Si es una VISTA (VIEW), procede al PASO 2.
-- Si es una TABLA BASE (BASE TABLE), el problema puede ser un TRIGGER.
-- Revisa los triggers asociados a esta tabla en el panel de Supabase.

-- PASO 2: Si es una VISTA, examina su definición para encontrar el bucle o la ineficiencia.
SELECT view_definition
FROM information_schema.views
WHERE table_name = '${problemSource}' AND table_schema = 'public';

-- Busca si la vista se llama a sí misma o si hace un JOIN muy costoso.
`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlScriptExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 text-center">
      <div className="max-w-3xl w-full">
        <Database className="mx-auto h-16 w-16 text-amber-500" />
        <h1 className="mt-4 text-2xl font-bold text-slate-800">{title}</h1>
        <p className="mt-2 text-slate-600 px-4">
          {explanation}
        </p>
        <div className="mt-6 text-left bg-slate-100 p-6 rounded-lg border border-slate-200">
          <h2 className="font-semibold text-slate-800">¿Cómo solucionarlo?</h2>
          <p className="mt-2 text-sm text-slate-600">
            Este error debe ser corregido en tu base de datos. Usa el siguiente script en el editor SQL de Supabase para diagnosticar el problema.
          </p>
          <ol className="list-decimal list-inside mt-4 space-y-3 text-sm text-slate-600">
            <li>
              Copia el script de diagnóstico.
              <div className="mt-2 ml-4 p-3 bg-slate-800 text-white rounded-lg font-mono text-xs overflow-x-auto">
                <pre><code>{sqlScriptExample}</code></pre>
              </div>
              <button
                onClick={handleCopySql}
                className="mt-2 ml-4 w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 border border-transparent rounded-full shadow-sm hover:bg-primary-700"
              >
                {copied ? <Check size={16} /> : <ClipboardCopy size={16} />}
                {copied ? '¡Script Copiado!' : 'Copiar Script de Diagnóstico'}
              </button>
            </li>
            <li>
              Ve al editor SQL de tu proyecto en Supabase.
               <a href={sqlEditorUrl} target="_blank" rel="noopener noreferrer" className="mt-2 ml-4 inline-block text-primary-600 font-semibold hover:underline">
                Ir al Editor SQL de Supabase &rarr;
              </a>
            </li>
            <li>Ejecuta el script y analiza la definición de la vista o los triggers para encontrar la causa del problema.</li>
            <li>Una vez corregido, vuelve a esta página y haz clic en <strong>"Refrescar Página"</strong>.</li>
          </ol>
        </div>
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-green-600 border border-transparent rounded-full shadow-sm hover:bg-green-700"
          >
            Refrescar Página
          </button>
          <button
            onClick={onLogout}
            className="px-6 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 border border-transparent rounded-full hover:bg-slate-200"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};


const AuthSessionErrorScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 text-center">
    <div className="max-w-md w-full">
      <ShieldAlert className="mx-auto h-16 w-16 text-amber-500" />
      <h1 className="mt-4 text-2xl font-bold text-slate-800">Error de Sesión</h1>
      <p className="mt-2 text-slate-600">
        Se detectó un problema con tu sesión guardada. Se cerrará la sesión para solucionarlo. Por favor, inicia sesión de nuevo.
      </p>
       <LoaderCircle className="animate-spin h-8 w-8 text-primary-600 mx-auto mt-6" />
    </div>
  </div>
);

const LoadingScreen = ({ message }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <LoaderCircle className="animate-spin h-12 w-12 text-primary-600" />
    <p className="mt-4 text-lg font-semibold text-slate-700">{message}</p>
  </div>
);

const AuthGuard = ({ children, setupGuard = false }) => {
  const { session, loading, error, errorMessage, family, handleLogout } = useStore();

  if (loading) {
    return <LoadingScreen message="Cargando tus datos..." />;
  }

  if (error === 'NETWORK_ERROR') return <NetworkErrorScreen />;
  if (error === 'DATABASE_RECURSION_ERROR' || error === 'DATABASE_TIMEOUT_ERROR') return <DatabaseProblemScreen errorType={error} errorMessage={errorMessage} onLogout={handleLogout} />;
  if (error === 'AUTH_SESSION_ERROR') return <AuthSessionErrorScreen />;

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  const userHasFamily = !!family;

  if (setupGuard) { // For /setup route
    return userHasFamily ? <Navigate to="/" replace /> : children;
  } else { // For all other private routes
    return userHasFamily ? children : <Navigate to="/setup" replace />;
  }
};


function App() {
  const store = useStore();
  const { fetchInitialData, setSession, clearData, scheduledExpenses, members, cajas } = store;
  
  const [expenseToConfirm, setExpenseToConfirm] = useState(null);
  const isConfirmModalOpen = !!expenseToConfirm;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchInitialData();
      } else {
        clearData();
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchInitialData, setSession, clearData]);

  const handleReviewExpense = (expense) => {
    setExpenseToConfirm(expense);
  };

  const handleCloseConfirmModal = () => {
    setExpenseToConfirm(null);
  };

  const handleConfirmExpense = (transactionData, scheduledExpenseId) => {
    store.confirmScheduledExpense(transactionData, scheduledExpenseId);
    handleCloseConfirmModal();
  };

  const pendingExpenses = useMemo(() => {
    if (!scheduledExpenses) return [];
    const periodKey = format(new Date(), 'yyyy-MM');
    return scheduledExpenses.filter(exp => !exp.confirmed_months?.includes(periodKey));
  }, [scheduledExpenses]);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/setup"
            element={
              <AuthGuard setupGuard={true}>
                <SetupPage {...store} />
              </AuthGuard>
            }
          />
          <Route 
            path="/*"
            element={
              <AuthGuard>
                <Layout {...store} pendingExpenses={pendingExpenses} onReviewExpense={handleReviewExpense}>
                  <Routes>
                    <Route path="/" element={<DashboardPage {...store} onReviewExpense={handleReviewExpense} />} />
                    <Route path="/transacciones" element={<TransactionsPage {...store} />} />
                    <Route path="/cajas" element={<CajasPage {...store} />} />
                    <Route path="/arqueo" element={<ArqueoPage {...store} />} />
                    <Route path="/reportes" element={<ReportsPage {...store} />} />
                    <Route path="/analisis" element={<AdvancedReportsPage {...store} />} />
                    <Route path="/presupuesto" element={<BudgetsPage {...store} />} />
                    <Route path="/gastos-programados" element={<ScheduledExpensesPage {...store} />} />
                    <Route path="/miembros" element={<MembersPage {...store} />} />
                    <Route path="/configuracion" element={<SettingsPage {...store} />} />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </Layout>
              </AuthGuard>
            }
          />
        </Routes>
      </Router>
      <ConfirmExpenseModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmExpense}
        expense={expenseToConfirm}
        members={members}
        cajas={cajas}
      />
    </>
  );
}

export default App;
