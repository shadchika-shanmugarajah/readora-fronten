import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Phone, User, BookOpen, AlertCircle, CheckCircle, MapPin, Mail, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Login() {
  const { login, register, loading: authLoading } = useAuth();
  const { showToast } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || 'profile';

  // Mode: 'signin' or 'register'
  const [mode, setMode] = useState('signin');

  // Form Fields
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  
  // Feedback
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);

  const phoneRegex = /^(?:\+94|0)?7[0-9]{8}$/;

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setShowRegisterPrompt(false);

    if (!phoneNumber.trim()) {
      setError('Phone number is required to sign in.');
      return;
    }

    const trimmedPhone = phoneNumber.trim().replace(/\s+/g, '');
    if (!phoneRegex.test(trimmedPhone)) {
      setError('Please enter a valid Sri Lankan phone number (e.g. 071 234 5678).');
      return;
    }

    const result = await login(trimmedPhone, '');
    
    if (result.success) {
      setSuccess(true);
      showToast('Welcome back! Signed in successfully.');
      setTimeout(() => {
        if (redirect === 'books') navigate('/books');
        else if (redirect === 'cart') navigate('/cart');
        else if (redirect.startsWith('book/')) navigate(`/${redirect}`);
        else navigate('/profile');
      }, 800);
    } else {
      setError(result.message || 'Login failed. Please check your phone number.');
      if (result.message && (result.message.includes('not found') || result.message.includes('register first'))) {
        setShowRegisterPrompt(true);
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setShowRegisterPrompt(false);

    if (!name.trim()) {
      setError('Full Name is required.');
      return;
    }

    if (!phoneNumber.trim()) {
      setError('Phone Number is required.');
      return;
    }

    const trimmedPhone = phoneNumber.trim().replace(/\s+/g, '');
    if (!phoneRegex.test(trimmedPhone)) {
      setError('Please enter a valid Sri Lankan phone number (e.g. 071 234 5678).');
      return;
    }

    if (!address.trim()) {
      setError('Delivery Address is required so we can deliver your orders.');
      return;
    }

    const result = await register(name.trim(), trimmedPhone, address.trim(), email.trim());

    if (result.success) {
      setSuccess(true);
      showToast('Account created successfully! Welcome to ReadAura.');
      setTimeout(() => {
        if (redirect === 'books') navigate('/books');
        else if (redirect === 'cart') navigate('/cart');
        else if (redirect.startsWith('book/')) navigate(`/${redirect}`);
        else navigate('/profile');
      }, 800);
    } else {
      setError(result.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 flex flex-col justify-center min-h-[85vh]">
      <div className="glass-card p-6 sm:p-8 border border-white/5 space-y-6 shadow-3d-glow">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 mb-1">
            <BookOpen className="h-8 w-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-100 light:text-slate-950">
            {mode === 'signin' ? 'Customer Sign In' : 'Create Customer Account'}
          </h1>
          <p className="text-xs text-slate-400 light:text-slate-500">
            {mode === 'signin' 
              ? 'Enter your registered phone number to access your account' 
              : 'Quick registration to enjoy fast checkout and order tracking'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(''); setShowRegisterPrompt(false); }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mode === 'signin' 
                ? 'bg-brand-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); setShowRegisterPrompt(false); }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mode === 'register' 
                ? 'bg-brand-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Register</span>
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400 space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            {showRegisterPrompt && (
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); setShowRegisterPrompt(false); }}
                className="w-full py-1.5 px-3 rounded-lg bg-brand-600/30 hover:bg-brand-600/50 text-brand-300 font-bold text-[11px] border border-brand-500/30 transition-all flex items-center justify-center gap-1"
              >
                <span>Click here to Register with this number</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
            <CheckCircle className="h-4.5 w-4.5 shrink-0 animate-ping" />
            <span>Success! Redirecting...</span>
          </div>
        )}

        {/* ================= SIGN IN FORM ================= */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                <span>Registered Phone Number <span className="text-rose-400">*</span></span>
              </label>
              <input
                type="tel"
                placeholder="e.g. 071 234 5678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={authLoading || success}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 light:bg-white light:border-slate-300 light:text-slate-900 text-sm"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={authLoading || success}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-brand-600/20"
            >
              {authLoading ? 'Verifying...' : 'Sign In'}
            </button>

            {/* Prominent Register Callout Under Sign In Button */}
            <div className="text-center pt-3 border-t border-white/5 space-y-1">
              <p className="text-xs text-slate-400">
                Don't have an account yet?
              </p>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); setShowRegisterPrompt(false); }}
                className="text-xs font-bold text-brand-400 hover:text-brand-300 underline underline-offset-4 transition-colors"
              >
                Register Here (Quick & Easy)
              </button>
            </div>
          </form>
        )}

        {/* ================= REGISTER FORM ================= */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                <span>Full Name <span className="text-rose-400">*</span></span>
              </label>
              <input
                type="text"
                placeholder="e.g. Ruwan Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={authLoading || success}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 light:bg-white light:border-slate-300 light:text-slate-900 text-sm"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                <span>Phone Number <span className="text-rose-400">*</span></span>
              </label>
              <input
                type="tel"
                placeholder="e.g. 071 234 5678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={authLoading || success}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 light:bg-white light:border-slate-300 light:text-slate-900 text-sm"
              />
            </div>

            {/* Delivery Address */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>Delivery Address <span className="text-rose-400">*</span></span>
              </label>
              <input
                type="text"
                placeholder="e.g. No. 12, Galle Road, Colombo 03"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={authLoading || success}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 light:bg-white light:border-slate-300 light:text-slate-900 text-sm"
              />
            </div>

            {/* Email (Optional) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  <span>Email Address</span>
                </span>
                <span className="text-[10px] text-slate-500 normal-case font-normal">(Optional)</span>
              </label>
              <input
                type="email"
                placeholder="e.g. ruwan@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={authLoading || success}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 light:bg-white light:border-slate-300 light:text-slate-900 text-sm"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={authLoading || success}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-brand-600/20"
            >
              {authLoading ? 'Creating Account...' : 'Complete Registration'}
            </button>

            {/* Prominent Sign In Link Under Register Button */}
            <div className="text-center pt-3 border-t border-white/5 space-y-1">
              <p className="text-xs text-slate-400">
                Already registered?
              </p>
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(''); setShowRegisterPrompt(false); }}
                className="text-xs font-bold text-brand-400 hover:text-brand-300 underline underline-offset-4 transition-colors"
              >
                Sign In to Your Account
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
