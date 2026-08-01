import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingWhatsAppWidget from './FloatingWhatsAppWidget';

export default function CustomerLayout() {
  return (
    <div className="flex flex-col min-h-screen text-slate-100 bg-slate-950 transition-colors duration-300 light:bg-slate-50 light:text-slate-900">
      {/* Navigation Headers */}
      <Navbar />

      {/* Main Pages Content */}
      <main className="flex-grow animate-fade-in">
        <Outlet />
      </main>

      {/* Floating WhatsApp Chat Widget */}
      <FloatingWhatsAppWidget />

      {/* Footer Details */}
      <Footer />
    </div>
  );
}
