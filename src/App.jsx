import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingWhatsAppWidget from './components/FloatingWhatsAppWidget';
import Home from './pages/Home';
import Books from './pages/Books';
import BookDetails from './pages/BookDetails';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import AuthorPage from './pages/AuthorPage';
import PublisherPage from './pages/PublisherPage';
import CategoryPage from './pages/CategoryPage';
import SpecialListsPage from './pages/SpecialListsPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-100 bg-slate-950">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-t-2 border-brand-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-400">Verifying session credentials...</p>
        </div>
      </div>
    );
  }
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppContent() {
  return (
    <div className="flex flex-col min-h-screen text-slate-100 bg-slate-950 transition-colors duration-300 light:bg-slate-50 light:text-slate-900">
      {/* Navigation Headers */}
      <Navbar />

      {/* Main Pages Content */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<Books />} />
          <Route path="/book/:id" element={<BookDetails />} />
          <Route path="/books/:slug" element={<BookDetails />} />
          <Route path="/authors/:slug" element={<AuthorPage />} />
          <Route path="/publishers/:slug" element={<PublisherPage />} />
          <Route path="/categories/:slug" element={<CategoryPage />} />
          <Route path="/offers" element={<SpecialListsPage type="offers" />} />
          <Route path="/new-releases" element={<SpecialListsPage type="new-releases" />} />
          <Route path="/best-selling" element={<SpecialListsPage type="best-selling" />} />
          <Route path="/about" element={<About />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Admin Protected Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard initialTab="books" /></AdminRoute>} />
          <Route path="/inventory" element={<AdminRoute><AdminDashboard initialTab="books" /></AdminRoute>} />
          <Route path="/dashboard" element={<AdminRoute><AdminDashboard initialTab="books" /></AdminRoute>} />
          <Route path="/orders/manage" element={<AdminRoute><AdminDashboard initialTab="orders" /></AdminRoute>} />
          <Route path="/analytics" element={<AdminRoute><AdminDashboard initialTab="analytics" /></AdminRoute>} />
        </Routes>
      </main>

      {/* Floating WhatsApp Chat Widget */}
      <FloatingWhatsAppWidget />

      {/* Footer Details */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AppContent />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
