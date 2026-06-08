import React from 'react';
import { BookOpen, Github, MessageSquare, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative mt-20 border-t border-white/10 bg-[#002d40] py-12 text-slate-300 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              {/* Emblem Logo */}
              <div className="h-16 w-20 overflow-hidden flex items-center justify-center shrink-0">
                <img 
                  src="/readaura_emblem.png" 
                  alt="ReadAura Emblem" 
                  style={{
                    filter: 'invert(1) hue-rotate(180deg) brightness(1.2) contrast(1.2)',
                    mixBlendMode: 'screen'
                  }}
                  className="max-h-none w-full h-full object-contain"
                />
              </div>

              {/* Text Logo */}
              <div className="h-16 w-48 overflow-hidden flex items-center justify-center shrink-0">
                <img 
                  src="/readaura_text_logo.png" 
                  alt="ReadAura Text" 
                  style={{
                    filter: 'invert(1) hue-rotate(180deg) brightness(1.2) contrast(1.2)',
                    mixBlendMode: 'screen'
                  }}
                  className="max-h-none w-full h-full object-contain"
                />
              </div>
            </div>
            <p className="text-sm text-slate-350 max-w-sm leading-relaxed">
              An advanced, premium digital storefront offering curated literature, seamless WhatsApp order processing, and a high-fidelity 3D reader atmosphere.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-[#38bdf8] uppercase tracking-wider mb-4">Explore</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><a href="/" className="hover:text-[#38bdf8] transition-colors">Home</a></li>
              <li><a href="/books" className="hover:text-[#38bdf8] transition-colors">All Books</a></li>
              <li><a href="/about" className="hover:text-[#38bdf8] transition-colors">About Us</a></li>
              <li><a href="/cart" className="hover:text-[#38bdf8] transition-colors">My Bag</a></li>
            </ul>
          </div>

          {/* Checkout & Support */}
          <div>
            <h4 className="text-sm font-bold text-[#38bdf8] uppercase tracking-wider mb-4">Support</h4>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#38bdf8]" />
                <span>+94 77 445 4785</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#38bdf8]" />
                <a href="mailto:nextwavetechlabs@gmail.com" className="hover:text-[#38bdf8] transition-colors">nextwavetechlabs@gmail.com</a>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400 font-medium">WhatsApp Orders</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} ReadAura. All rights reserved. Developed by <span className="text-[#38bdf8] font-bold">NextWave Tech Labs</span></p>
          <div className="flex space-x-4">
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              WhatsApp Integration Enabled
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
