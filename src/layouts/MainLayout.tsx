import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from '../components/navigation/Navigation';
import Header from '../components/navigation/Header';

const MainLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-dark-300">
      <Navigation />
      <div className="flex flex-col flex-1 overflow-x-hidden">
        <Header />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;