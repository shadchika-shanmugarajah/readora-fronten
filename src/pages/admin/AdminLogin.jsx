import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { KeyRound, User, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AdminLogin() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user && ['super_admin', 'admin', 'staff'].includes(user.role)) {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all credentials.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // login method in AuthContext handles username/password if provided
      const res = await login(null, null, username.trim(), password.trim());
      if (res.success) {
        navigate('/admin/dashboard');
      } else {
        setError(res.message || 'Invalid username or password.');
      }
    } catch (err) {
      setError('Network error. Failed to log in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center p-4">
      {/* Dynamic Background Mesh Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))] pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10 glass-panel bg-slate-900/50 border border-slate-800/80 p-8 rounded-3xl shadow-2xl backdrop-blur-md">
        
        {/* Header Branding */}
        <div className="text-center space-y-3 mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-r from-brand-600 to-purple-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-500/10">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-wider font-display text-slate-50 uppercase">
            Control Room
          </h1>
          <p className="text-xs text-slate-400">
            Enter administrative credentials to log into the ERP panel.
          </p>
        </div>

        {/* Action Error Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-xs text-rose-350 font-semibold flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              <span>Username</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              placeholder="e.g. admin"
              className="w-full px-4 py-3 rounded-xl bg-[#090d16] border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all placeholder:text-slate-600"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" />
              <span>Security Password</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 rounded-xl bg-[#090d16] border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all placeholder:text-slate-600"
            />
          </div>

          {/* Login Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-brand-600/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{loading ? 'Verifying Credentials...' : 'Authenticate'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Footer Audit Notice */}
        <div className="mt-8 border-t border-slate-850 pt-4 flex items-center justify-center gap-2 text-[10px] text-slate-500">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>Encrypted JWT connection enabled. All activity is logged.</span>
        </div>

      </div>
    </div>
  );
}
