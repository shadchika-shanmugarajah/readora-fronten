import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Authentication check
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-100 bg-[#020617]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-t-2 border-brand-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-400">Verifying session credentials...</p>
        </div>
      </div>
    );
  }

  // Restrict customers from accessing admin pages
  if (!user || !['super_admin', 'admin', 'staff'].includes(user.role)) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#090d16] text-slate-100 font-sans transition-colors duration-300">
      {/* Admin Sidebar Navigation */}
      <AdminSidebar collapsed={collapsed} />

      {/* Main Content Workspace */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top header navigation */}
        <AdminHeader collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* Dynamic sub-page viewports */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#020617] text-slate-100 no-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
