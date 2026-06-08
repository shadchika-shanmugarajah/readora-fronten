import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowLeft, Send, MapPin, User, Phone, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart, showToast } = useCart();
  const { user, token, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      // If customer name is a system-generated placeholder, clear it so they must type their real name
      const isPlaceholder = user.name && user.name.startsWith('Customer (');
      setFormData({
        name: isPlaceholder ? '' : (user.name || ''),
        phone: user.phoneNumber || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validate = () => {
    let err = {};
    if (!formData.name.trim()) err.name = 'Full name is required';
    if (!formData.phone.trim()) err.phone = 'Phone number is required';
    if (!formData.address.trim()) err.address = 'Delivery address is required';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!user) {
      showToast('Please log in to place an order.', 'error');
      navigate('/login?redirect=cart');
      return;
    }

    if (cartItems.length === 0) {
      showToast('Your bag is empty.', 'error');
      return;
    }

    if (!validate()) {
      showToast('Please fill all checkout fields.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      // Sync profile details if customer changed them on checkout
      if (user && (formData.name.trim() !== user.name || formData.address.trim() !== user.address)) {
        try {
          await updateProfile(formData.name.trim(), formData.address.trim());
        } catch (err) {
          console.warn("Profile sync skipped offline", err);
        }
      }

      // 1. Log the order on the backend database
      const orderPayload = {
        customerName: formData.name.trim(),
        customerPhone: formData.phone.trim(),
        customerAddress: formData.address.trim(),
        items: cartItems.map(item => ({
          bookId: item._id,
          title: item.title,
          price: item.price,
          quantity: item.quantity
        })),
        totalPrice: cartTotal
      };

      // Set header authorization
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let logSuccess = false;
      try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
          method: 'POST',
          headers,
          body: JSON.stringify(orderPayload)
        });
        if (response.ok) logSuccess = true;
      } catch (err) {
        console.warn("Backend offline. Skipping database order logging, redirecting to WhatsApp directly.");
      }

      // 2. Formulate the WhatsApp API click-to-chat message
      // Admin phone number configurable. Default standard Sri Lankan number or configurable.
      const adminPhoneNumber = '94774454785'; // configurable

      const itemsText = cartItems.map(item => 
        `- ${item.title} x ${item.quantity} (${(item.price * item.quantity).toLocaleString()} LKR)`
      ).join('\n');

      const whatsappMessage = `Hello, I want to order:

Book Details:
${itemsText}

Total Price: ${cartTotal.toLocaleString()} LKR

Customer Details:
- Name: ${formData.name.trim()}
- Phone: ${formData.phone.trim()}
- Address: ${formData.address.trim()}

Please confirm my order.`;

      const encodedText = encodeURIComponent(whatsappMessage);
      const whatsappUrl = `https://wa.me/${adminPhoneNumber}?text=${encodedText}`;

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        // Clear local shopping bag and navigate to profile first
        clearCart();
        showToast('Redirected to WhatsApp! Order placed successfully.');
        navigate('/profile');
        
        // Redirect the current window to WhatsApp (immune to popup blockers)
        setTimeout(() => {
          window.location.href = whatsappUrl;
        }, 150);
      } else {
        // Open whatsapp in a new tab on desktop
        window.open(whatsappUrl, '_blank');
        clearCart();
        showToast('Redirected to WhatsApp! Order placed successfully.');
        navigate('/profile');
      }

    } catch (error) {
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center flex flex-col items-center justify-center min-h-screen">
        <ShoppingBag className="h-16 w-16 text-slate-500 mb-6 animate-pulse" />
        <h2 className="text-2xl font-bold font-display text-slate-300 light:text-slate-800">Your bag is empty</h2>
        <p className="text-sm text-slate-400 light:text-slate-500 mt-2 max-w-sm">
          Explore our collections and add products to your bag to checkout here.
        </p>
        <Link 
          to="/books" 
          className="mt-8 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold text-sm transition-all shadow-md active:scale-95"
        >
          Explore Books
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <div className="flex items-center gap-2 mb-8">
        <Link to="/books" className="text-slate-400 hover:text-slate-200">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold tracking-tight font-display text-slate-100 light:text-slate-950">
          Shopping Bag
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Item List */}
        <div className="lg:col-span-7 space-y-4">
          {cartItems.map((item) => (
            <div key={item._id} className="flex gap-4 p-4 glass-card border border-white/5 items-center justify-between">
              {/* Product Cover image */}
              <div className="w-16 h-20 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-white/5">
                <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
              </div>

              {/* Title & Price */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base text-slate-100 truncate light:text-slate-800">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 truncate light:text-slate-500">
                  by {item.author}
                </p>
                <div className="text-sm font-bold text-slate-200 light:text-slate-900 mt-1 font-display">
                  {item.price.toLocaleString()} LKR
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-lg bg-white/5 border border-white/10 p-0.5 light:bg-slate-200 light:border-slate-300">
                  <button 
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center font-bold text-slate-400 hover:text-white transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-200 light:text-slate-800 font-display">
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center font-bold text-slate-400 hover:text-white transition-colors"
                  >
                    +
                  </button>
                </div>

                <button 
                  onClick={() => removeFromCart(item._id)}
                  className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Remove Item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout Billing Form */}
        <div className="lg:col-span-5">
          <div className="glass-card p-6 border border-white/5 space-y-6">
            <h2 className="text-xl font-bold font-display text-slate-200 light:text-slate-800 border-b border-white/5 pb-3">
              Delivery Details
            </h2>

            <form onSubmit={handleCheckout} className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Ruwan Silva"
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 light:bg-white light:border-slate-300 light:text-slate-900 ${
                    errors.name ? 'border-rose-500/50' : 'border-white/10'
                  }`}
                />
                {errors.name && <span className="text-xs text-rose-400 font-medium">{errors.name}</span>}
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  <span>Contact Number</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 0771234567"
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 light:bg-white light:border-slate-300 light:text-slate-900 ${
                    errors.phone ? 'border-rose-500/50' : 'border-white/10'
                  }`}
                />
                {errors.phone && <span className="text-xs text-rose-400 font-medium">{errors.phone}</span>}
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Delivery Address</span>
                </label>
                <textarea
                  name="address"
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. No 45, Flower Road, Colombo 03"
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 light:bg-white light:border-slate-300 light:text-slate-900 ${
                    errors.address ? 'border-rose-500/50' : 'border-white/10'
                  }`}
                />
                {errors.address && <span className="text-xs text-rose-400 font-medium">{errors.address}</span>}
              </div>

              {/* Pricing breakdown */}
              <div className="space-y-3 pt-4 border-t border-white/5 text-sm">
                <div className="flex justify-between text-slate-400 light:text-slate-600">
                  <span>Subtotal</span>
                  <span>{cartTotal.toLocaleString()} LKR</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 light:text-slate-600">
                  <span>Delivery Charge</span>
                  <span className="text-amber-400 font-semibold text-xs light:text-amber-600">Calculated on confirmation</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-100 light:text-slate-900 border-t border-white/5 pt-3">
                  <span>Total Amount</span>
                  <span className="font-display">{cartTotal.toLocaleString()} LKR</span>
                </div>
              </div>

              {/* Submit Checkout Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 mt-6 py-4.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base transition-all shadow-lg shadow-emerald-600/10 active:scale-95 disabled:opacity-50"
              >
                <Send className="h-4.5 w-4.5" />
                <span>{submitting ? 'Processing...' : 'Order via WhatsApp'}</span>
              </button>

              {!user && (
                <p className="text-center text-xs text-slate-500 mt-2">
                  * You must be <Link to="/login?redirect=cart" className="text-brand-400 underline font-semibold">logged in</Link> to check out.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
