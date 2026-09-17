import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export const Topbar = ({ title }) => {
  const { user } = useAuth();
  
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-700">{user?.name}</span>
        <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-xs font-bold text-white">
          {getInitials(user?.name)}
        </div>
      </div>
    </header>
  );
};
