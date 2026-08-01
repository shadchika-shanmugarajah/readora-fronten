import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CustomerLayout from './components/CustomerLayout';
import AdminLayout from './components/admin/AdminLayout';
import Home from './pages/Home';
import Books from './pages/Books';
import BookDetails from './pages/BookDetails';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Profile from './pages/Profile';
import About from './pages/About';
import AuthorPage from './pages/AuthorPage';
import PublisherPage from './pages/PublisherPage';
import CategoryPage from './pages/CategoryPage';
import SpecialListsPage from './pages/SpecialListsPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminPlaceholder from './pages/admin/AdminPlaceholder';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

function AppContent() {
  return (
    <Routes>
      {/* Customer Website Layout */}
      <Route element={<CustomerLayout />}>
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
      </Route>

      {/* Admin Login Route */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin Portal Layout & Sub-Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminPlaceholder />} />
        <Route path="dashboard/books" element={<AdminPlaceholder />} />
        <Route path="dashboard/inventory" element={<AdminPlaceholder />} />
        <Route path="dashboard/orders" element={<AdminPlaceholder />} />
        <Route path="dashboard/categories" element={<AdminPlaceholder />} />
        <Route path="dashboard/authors" element={<AdminPlaceholder />} />
        <Route path="dashboard/publishers" element={<AdminPlaceholder />} />
        <Route path="dashboard/banners" element={<AdminPlaceholder />} />
        <Route path="dashboard/customers" element={<AdminPlaceholder />} />
        <Route path="dashboard/reports" element={<AdminPlaceholder />} />
        <Route path="dashboard/settings" element={<AdminPlaceholder />} />
      </Route>

      {/* Backward Compatibility Redirects */}
      <Route path="/inventory" element={<Navigate to="/admin/dashboard/inventory" replace />} />
      <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/orders/manage" element={<Navigate to="/admin/dashboard/orders" replace />} />
      <Route path="/analytics" element={<Navigate to="/admin/dashboard/reports" replace />} />

      {/* Fallback Catch-All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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
