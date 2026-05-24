import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Phone, User, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Login() {
  const { login, loading: authLoading } = useAuth();
  const { showToast } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || 'profile';

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    let result;
    if (isAdminMode) {
      if (!username.trim()) {
        setError('Username is required.');
        return;
      }
      if (!password.trim()) {
        setError('Password is required.');
        return;
      }
      result = await login(null, null, username.trim(), password.trim());
    } else {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }

      if (!phoneNumber.trim()) {
        setError('Phone number is required.');
        return;
      }

      // Format check: allow typical formats (+94, 07, etc.)
      const phoneRegex = /^(?:\+94|0)?7[0-9]{8}$/;
      const trimmedPhone = phoneNumber.trim().replace(/\s+/g, '');
      if (!phoneRegex.test(trimmedPhone)) {
        setError('Please enter a valid Sri Lankan phone number (e.g. 0766572148).');
        return;
      }

      result = await login(trimmedPhone, name.trim());
    }
    
    if (result.success) {
      setSuccess(true);
      showToast('Logged in successfully!');
      setTimeout(() => {
        if (isAdminMode) {
          navigate('/admin');
        } else {
          // Redirect back to the requested page
          if (redirect === 'books') navigate('/books');
          else if (redirect === 'cart') navigate('/cart');
          else if (redirect.startsWith('book/')) navigate(`/${redirect}`);
          else navigate('/profile');
        }
      }, 1000);
    } else {
      setError(result.message || 'Login failed. Please check details and try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 flex flex-col justify-center min-h-screen">
      <div className="glass-card p-8 border border-white/5 space-y-8 shadow-3d-glow">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 mb-2">
            <BookOpen className="h-8 w-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-100 light:text-slate-950">
            {isAdminMode ? 'Admin Portal Sign In' : 'Sign In / Register'}
          </h1>
          <p className="text-xs text-slate-400 light:text-slate-500">
            {isAdminMode 
              ? 'Enter static credentials to access the Admin Control Center' 
              : 'Enter your name and phone number to continue checkout'
            }
          </p>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
            <CheckCircle className="h-4.5 w-4.5 shrink-0 animate-ping" />
            <span>Success! Loading session...</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isAdminMode ? (
            <>
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ruwan Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={authLoading || success}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 light:bg-white light:border-slate-300 light:text-slate-900"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 0766572148"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={authLoading || success}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 light:bg-white light:border-slate-300 light:text-slate-900"
                />
              </div>
            </>
          ) : (
            <>
              {/* Admin Username */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span>Admin Username</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={authLoading || success}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 light:bg-white light:border-slate-300 light:text-slate-900"
                />
              </div>

              {/* Admin Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <span className="text-[11px]">🔑</span>
                  <span>Admin Password</span>
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={authLoading || success}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 light:bg-white light:border-slate-300 light:text-slate-900"
                />
              </div>
            </>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={authLoading || success}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
          >
            {authLoading ? 'Verifying...' : isAdminMode ? 'Access Admin Control' : 'Sign In'}
          </button>
        </form>

        {/* Toggle Mode Button */}
        <div className="text-center pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={() => {
              setIsAdminMode(!isAdminMode);
              setError('');
            }}
            className="text-xs text-brand-400 hover:text-brand-300 hover:underline transition-colors"
          >
            {isAdminMode ? 'Back to Customer Sign In' : 'Are you an Administrator? Sign In here'}
          </button>
        </div>
      </div>
    </div>
  );
}
