import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Mail, Lock, LoaderCircle } from 'lucide-react';

const seedDatabase = async (userId) => {
    console.log("New user, seeding database...");
    const { members: mockMembers, cajas: mockCajas, categories, budgets, scheduledExpenses, transactions: mockTransactions } = await import('../data/seed.js');
    
    // 1. Insert Members
    const membersToInsert = mockMembers.map(({ id, ...rest }) => ({ ...rest, user_id: userId }));
    const { data: insertedMembers, error: membersError } = await supabase.from('members').insert(membersToInsert).select();
    if (membersError) throw membersError;

    const memberIdMap = mockMembers.reduce((acc, mockMember, index) => {
        acc[mockMember.id] = insertedMembers[index].id;
        return acc;
    }, {});
    
    const aportantePrincipalMockId = mockMembers.find(m => m.role === 'Aportante Principal')?.id || mockMembers[0].id;
    const aportantePrincipalNewId = memberIdMap[aportantePrincipalMockId];

    // 2. Insert Cajas (with fix for 'Billetera')
    const cajasToInsert = mockCajas.map(({ id, icon, ...rest }) => {
        let memberId = rest.member_id ? memberIdMap[rest.member_id] : null;
        let name = rest.name;

        // If this is the generic 'Efectivo' box, assign it to the main member
        if (rest.type === 'Efectivo' && !rest.member_id) {
            memberId = aportantePrincipalNewId;
            const ownerName = insertedMembers.find(m => m.id === aportantePrincipalNewId)?.name.split(' ')[0] || 'Principal';
            name = `Efectivo ${ownerName}`;
        }

        return {
            ...rest,
            name: name,
            member_id: memberId,
            user_id: userId,
        };
    });
    const { data: insertedCajas, error: cajasError } = await supabase.from('cajas').insert(cajasToInsert).select();
    if (cajasError) throw cajasError;

    const cajaIdMap = mockCajas.reduce((acc, mockCaja, index) => {
        acc[mockCaja.id] = insertedCajas[index].id;
        return acc;
    }, {});

    // 3. Insert Categories
    const categoriesToInsert = categories.map(c => ({ ...c, user_id: userId }));
    const { error: categoriesError } = await supabase.from('categories').insert(categoriesToInsert);
    if (categoriesError) throw categoriesError;

    // 4. Insert Budgets
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const budgetsToInsert = budgets.map(b => ({
      ...b,
      year: currentYear,
      month: currentMonth,
      user_id: userId,
    }));
    const { error: budgetsError } = await supabase.from('budgets').insert(budgetsToInsert);
    if (budgetsError) throw budgetsError;
    
    // 5. Insert Scheduled Expenses
    const scheduledToInsert = scheduledExpenses.map(({ id, ...rest }) => ({
        ...rest,
        member_id: rest.memberId ? memberIdMap[rest.memberId] : null,
        caja_id: rest.cajaId ? cajaIdMap[rest.cajaId] : null,
        user_id: userId,
    }));
    const { error: scheduledError } = await supabase.from('scheduled_expenses').insert(scheduledToInsert);
    if (scheduledError) throw scheduledError;

    // 6. Insert Transactions
    const transactionsToInsert = mockTransactions.map(({ id, memberName, ...rest }) => ({
        ...rest,
        member_id: rest.memberId ? memberIdMap[rest.memberId] : null,
        caja_id: rest.cajaId ? cajaIdMap[rest.cajaId] : null,
        user_id: userId,
    }));
    const { error: transactionsError } = await supabase.from('transactions').insert(transactionsToInsert);
    if (transactionsError) throw transactionsError;
    
    console.log("Seeding complete for new user.");
};


const RegisterPage = ({ onRegister }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.user) {
      try {
        await seedDatabase(data.user.id);
        setSuccess('¡Cuenta creada! Serás redirigido...');
        if (onRegister) {
          onRegister(data.user.id);
        }
        setTimeout(() => navigate('/'), 2000);
      } catch (seedError) {
        setError('Error al configurar la cuenta. Por favor, contacta a soporte.');
        console.error('Seeding error:', seedError);
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200/80">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Crea tu Cuenta</h2>
        <p className="text-slate-500 mt-1">Empieza a organizar tus finanzas hoy.</p>
      </div>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-xl border-slate-300 bg-slate-50 py-3 pl-10 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="tu@correo.com"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-xl border-slate-300 bg-slate-50 py-3 pl-10 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 px-4 py-3 text-base font-semibold text-white bg-primary-600 border border-transparent rounded-full shadow-sm hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 disabled:bg-primary-300"
          >
            {loading && <LoaderCircle className="animate-spin h-5 w-5" />}
            <span>{loading ? 'Creando cuenta...' : 'Registrarme'}</span>
          </button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        ¿Ya tienes una cuenta?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
