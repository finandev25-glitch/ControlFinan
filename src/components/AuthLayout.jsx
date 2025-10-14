import React from 'react';
import { Outlet } from 'react-router-dom';
import { PiggyBank } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="mb-8 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-2">
          <PiggyBank className="h-12 w-12 text-primary-600" />
          <span className="text-4xl font-bold text-slate-800">MiSaldo</span>
        </div>
        <p className="text-slate-500">Tu asistente financiero familiar.</p>
      </div>
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
