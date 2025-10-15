import React from 'react';
import { PiggyBank } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="flex justify-center items-center gap-3">
          <PiggyBank className="h-12 w-12 text-primary-600" />
          <h1 className="text-4xl font-bold text-primary-900">MiSaldo</h1>
        </div>
        <div className="text-center mt-6">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            {title}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-2xl sm:px-10 border border-slate-200/80">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
