import React from 'react';
import { BookOpen, Github, MessageSquare, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative mt-20 border-t border-white/5 bg-slate-950/80 backdrop-blur-md py-12 transition-colors duration-300 light:bg-slate-100 light:border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-500 font-display">
              <BookOpen className="h-6 w-6 text-brand-500" />
              <span>Readora</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed light:text-slate-600">
              An advanced, premium digital storefront offering curated literature, seamless WhatsApp order processing, and a high-fidelity 3D reader atmosphere.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4 light:text-slate-800">Explore</h4>
            <ul className="space-y-2 text-sm text-slate-400 light:text-slate-600">
              <li><a href="/" className="hover:text-brand-400 transition-colors">Home</a></li>
              <li><a href="/books" className="hover:text-brand-400 transition-colors">All Books</a></li>
              <li><a href="/about" className="hover:text-brand-400 transition-colors">About Us</a></li>
              <li><a href="/cart" className="hover:text-brand-400 transition-colors">My Bag</a></li>
            </ul>
          </div>

          {/* Checkout & Support */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4 light:text-slate-800">Support</h4>
            <div className="space-y-3 text-sm text-slate-400 light:text-slate-600">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-brand-400" />
                <span>+94 77 123 4567</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400 font-medium">WhatsApp Orders</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 light:border-slate-200 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Readora. All rights reserved.</p>
          <div className="flex space-x-4">
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[10px] uppercase font-bold text-slate-400 tracking-wider light:bg-slate-900/5 light:border-slate-900/10 light:text-slate-600">
              WhatsApp Integration Enabled
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
