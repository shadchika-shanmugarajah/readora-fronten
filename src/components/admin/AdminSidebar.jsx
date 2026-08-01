import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, ShoppingCart, Tag, Users, 
  Layers, Image, ShieldAlert, BarChart3, Settings, LogOut, Package
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar({ collapsed }) {
  const { user, logout } = useAuth();
  
  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, roles: ['super_admin', 'admin', 'staff'] },
    { name: 'Books', path: '/admin/dashboard/books', icon: BookOpen, roles: ['super_admin', 'admin', 'staff'] },
    { name: 'Inventory', path: '/admin/dashboard/inventory', icon: Package, roles: ['super_admin', 'admin', 'staff'] },
    { name: 'Orders', path: '/admin/dashboard/orders', icon: ShoppingCart, roles: ['super_admin', 'admin', 'staff'] },
    { name: 'Categories', path: '/admin/dashboard/categories', icon: Tag, roles: ['super_admin', 'admin'] },
    { name: 'Authors', path: '/admin/dashboard/authors', icon: Users, roles: ['super_admin', 'admin'] },
    { name: 'Publishers', path: '/admin/dashboard/publishers', icon: Layers, roles: ['super_admin', 'admin'] },
    { name: 'Banners', path: '/admin/dashboard/banners', icon: Image, roles: ['super_admin', 'admin'] },
    { name: 'Customers', path: '/admin/dashboard/customers', icon: Users, roles: ['super_admin', 'admin'] },
    { name: 'Reports', path: '/admin/dashboard/reports', icon: BarChart3, roles: ['super_admin', 'admin'] },
    { name: 'Settings', path: '/admin/dashboard/settings', icon: Settings, roles: ['super_admin'] },
  ];

  const filteredMenu = menuItems.filter(item => 
    item.roles.includes(user?.role || 'staff')
  );

  return (
    <aside className={`bg-[#0f172a] text-slate-100 flex flex-col h-screen border-r border-slate-800 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-850 gap-3">
        <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center font-bold text-white shrink-0 shadow-md">
          R
        </div>
        {!collapsed && (
          <span className="font-bold text-lg tracking-wider text-slate-50 font-display">
            READORA <span className="text-xs text-brand-400 font-normal">ADMIN</span>
          </span>
        )}
      </div>

      {/* Menu Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto no-scrollbar">
        {filteredMenu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin/dashboard'}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive 
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Profile Footer Section */}
      <div className="p-4 border-t border-slate-850 bg-slate-900/40">
        {!collapsed ? (
          <div className="flex items-center justify-between gap-3">
            <div className="truncate flex-1">
              <div className="font-bold text-sm text-slate-200 truncate">{user?.name || 'Administrator'}</div>
              <div className="text-[10px] text-brand-400 font-bold uppercase tracking-wider">
                {user?.role?.replace('_', ' ') || 'Staff'}
              </div>
            </div>
            <button 
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <button 
            onClick={logout}
            title="Sign Out"
            className="w-full flex items-center justify-center p-2.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>
    </aside>
  );
}
