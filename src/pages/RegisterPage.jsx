import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Mail, Lock, LoaderCircle, User } from 'lucide-react';
import { faker } from '@faker-js/faker';

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // The new trigger in the database will handle creating the family,
    // profile, and membership records automatically and reliably.
    // We just need to sign the user up.
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          avatar_url: faker.image.avatar(),
        }
      }
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // The onAuthStateChange listener in App.jsx will detect the new session
      // and automatically navigate the user. We just show a success message.
      setSuccess('¡Cuenta creada con éxito! Serás redirigido en un momento.');
    } else {
      // This case might happen if email confirmation is enabled.
      setSuccess('¡Revisa tu correo para confirmar tu cuenta!');
      setLoading(false);
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
          <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="block w-full rounded-xl border-slate-300 bg-slate-50 py-3 pl-10 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>
        </div>
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
