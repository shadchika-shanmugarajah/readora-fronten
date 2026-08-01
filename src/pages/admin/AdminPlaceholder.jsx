import React from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldCheck, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminPlaceholder() {
  const location = useLocation();
  const { user } = useAuth();
  
  const getTabName = () => {
    const parts = location.pathname.split('/');
    const sub = parts[parts.length - 1];
    if (sub === 'dashboard') return 'Analytics Overview';
    return sub.charAt(0).toUpperCase() + sub.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/40 p-6 border border-slate-800 rounded-3xl">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold font-display text-slate-100 tracking-wide uppercase">
            {getTabName()}
          </h1>
          <p className="text-xs text-slate-400">
            Phase 1 Layout & RBAC Integration Status
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-brand-500/10 border border-brand-500/25 text-brand-400 text-xs font-bold">
          <Calendar className="h-4 w-4" />
          <span>Active Session</span>
        </div>
      </div>

      {/* Main Status Container */}
      <div className="glass-panel border border-slate-800 bg-slate-950 p-8 rounded-3xl flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
        <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/5 animate-pulse">
          <ShieldCheck className="h-8 w-8" />
        </div>
        
        <div className="space-y-2 max-w-md">
          <h3 className="text-lg font-bold text-slate-150 font-display">
            Layout & Access Control Verified
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The separate administrative shell is online. You are authenticated as <span className="font-bold text-brand-400">{user?.name}</span> with the role <span className="font-bold text-purple-400 uppercase">{user?.role?.replace('_', ' ')}</span>.
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-850 bg-slate-900/20 text-slate-500 text-[10px] uppercase font-bold tracking-wider max-w-sm">
          Phase 1 Complete • Ready for Phase 2 implementation.
        </div>
      </div>
    </div>
  );
}
