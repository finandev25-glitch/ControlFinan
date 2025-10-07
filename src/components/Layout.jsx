import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 text-slate-800">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
