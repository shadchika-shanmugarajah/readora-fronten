import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Sun, Moon, BookOpen, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const bodyClass = document.body.classList;
    if (theme === 'light') {
      bodyClass.add('light');
    } else {
      bodyClass.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Books', path: '/books' },
    { name: 'About Us', path: '/about' },
    ...(user?.role === 'admin' ? [{ name: 'Admin Portal', path: '/admin' }] : []),
  ];

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-500 font-display">
              <BookOpen className="h-7 w-7 text-brand-500 animate-pulse" />
              <span>Readora</span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive(link.path)
                    ? 'text-brand-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 light:text-slate-600 light:hover:text-slate-900'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-5">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white light:bg-slate-900/5 light:border-slate-900/10 light:text-slate-600 hover:scale-110 active:scale-95 transition-all duration-200"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Cart Bag */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white light:bg-slate-900/5 light:border-slate-900/10 light:text-slate-600 hover:scale-110 active:scale-95 transition-all duration-200"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white ring-2 ring-slate-950 animate-bounce">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile / Login */}
            {user ? (
              <Link
                to="/profile"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/20 active:scale-95"
              >
                <User className="h-4 w-4" />
                <span>{user.name.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-xl border border-brand-500/30 text-brand-400 font-medium text-sm hover:bg-brand-500/10 hover:border-brand-500/50 transition-all duration-200"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center space-x-4 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-400 hover:text-slate-100"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <Link to="/cart" className="relative p-2 text-slate-400 hover:text-slate-100">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand-600 text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-400 hover:text-slate-100"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden glass-panel border-t border-white/5 px-4 pt-4 pb-6 space-y-3 transition-all duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-xl text-base font-medium transition-colors ${
                isActive(link.path)
                  ? 'bg-brand-600/10 text-brand-400'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              {link.name}
            </Link>
          ))}
          {user ? (
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 text-white font-medium text-base"
            >
              <User className="h-5 w-5" />
              <span>My Profile ({user.name})</span>
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block text-center py-2.5 rounded-xl border border-brand-500/30 text-brand-400 font-medium text-base hover:bg-brand-500/10"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
