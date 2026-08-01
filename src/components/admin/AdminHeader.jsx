import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, Bell, Menu, X, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

export default function AdminHeader({ collapsed, setCollapsed }) {
  const { user, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('admin_theme') || 'dark');
  const [showNotifications, setShowNotifications] = useState(false);
  const [alerts, setAlerts] = useState([]);

  // Fetch quick notification warnings (e.g. low stock, pending payments)
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Simulating low stock and pending order indicators in mock and real
        const booksRes = await fetch(`${API_BASE_URL}/books`);
        const books = await booksRes.json();
        const lowStock = books.filter(b => b.stock <= 5 && b.stock > 0);
        const outOfStock = books.filter(b => b.stock === 0);

        const newAlerts = [];
        lowStock.forEach(b => newAlerts.push({ id: `low_${b._id}`, type: 'warning', text: `Low Stock: "${b.title}" (${b.stock} left)` }));
        outOfStock.forEach(b => newAlerts.push({ id: `out_${b._id}`, type: 'error', text: `Out of Stock: "${b.title}"` }));
        
        setAlerts(newAlerts.slice(0, 5));
      } catch (err) {
        console.warn("Failed to fetch notification status:", err);
      }
    };

    fetchAlerts();
    // Poll every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    const bodyClass = document.body.classList;
    if (theme === 'light') {
      bodyClass.add('admin-light');
      bodyClass.remove('dark');
    } else {
      bodyClass.remove('admin-light');
      bodyClass.add('dark');
    }
    localStorage.setItem('admin_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/books')) return 'Book Catalog';
    if (path.includes('/orders')) return 'Order Desk';
    if (path.includes('/categories')) return 'Categories';
    if (path.includes('/authors')) return 'Authors Registry';
    if (path.includes('/publishers')) return 'Publishers Directory';
    if (path.includes('/banners')) return 'Banner Designs';
    if (path.includes('/customers')) return 'Customers Management';
    if (path.includes('/inventory')) return 'Inventory Stock Levels';
    if (path.includes('/reports')) return 'Sales Reports & Export';
    if (path.includes('/settings')) return 'Global settings';
    return 'Dashboard Overview';
  };

  return (
    <header className="h-16 bg-[#0f172a] border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 transition-all duration-350">
      {/* Sidebar Toggle & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="font-bold text-lg text-slate-100 font-display tracking-wide uppercase">
          {getPageTitle()}
        </h2>
      </div>

      {/* Quick Controls */}
      <div className="flex items-center gap-3">
        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          title="Toggle Theme"
          className="p-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications Icon & Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors relative"
          >
            <Bell className="h-5 w-5" />
            {alerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-[#0f172a]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-scale-in text-xs space-y-3">
              <div className="flex items-center justify-between font-bold text-slate-300 pb-2 border-b border-slate-850">
                <span>System Alerts</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400">
                  {alerts.length} New
                </span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                {alerts.length === 0 ? (
                  <p className="text-slate-500 py-4 text-center">No current warnings. Everything operational!</p>
                ) : (
                  alerts.map(alert => (
                    <div 
                      key={alert.id} 
                      className={`p-2.5 rounded-xl border flex gap-2 ${
                        alert.type === 'error' 
                          ? 'bg-rose-500/5 border-rose-500/20 text-rose-350' 
                          : 'bg-amber-500/5 border-amber-500/20 text-amber-350'
                      }`}
                    >
                      <span className="font-semibold">{alert.text}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Identity Display */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold uppercase shrink-0">
            {user?.name ? user.name[0] : 'A'}
          </div>
          <span className="hidden sm:inline font-bold text-sm text-slate-350 truncate max-w-[120px]">
            {user?.name || 'Administrator'}
          </span>
        </div>
      </div>
    </header>
  );
}
