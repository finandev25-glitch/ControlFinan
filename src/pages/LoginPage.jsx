import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Mail, Lock, LoaderCircle } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200/80">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">¡Bienvenido de vuelta!</h2>
        <p className="text-slate-500 mt-1">Inicia sesión para continuar.</p>
      </div>
      <form onSubmit={handleLogin} className="space-y-4">
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
              placeholder="••••••••"
              required
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 px-4 py-3 text-base font-semibold text-white bg-primary-600 border border-transparent rounded-full shadow-sm hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 disabled:bg-primary-300"
          >
            {loading && <LoaderCircle className="animate-spin h-5 w-5" />}
            <span>{loading ? 'Iniciando...' : 'Iniciar Sesión'}</span>
          </button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        ¿No tienes una cuenta?{' '}
        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
          Regístrate aquí
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
