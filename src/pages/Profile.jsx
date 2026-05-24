import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, MapPin, LogOut, Package, ArrowRight, Save, Clock, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { API_BASE_URL } from '../config';

export default function Profile() {
  const { user, token, logout, updateProfile } = useAuth();
  const { showToast } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    address: ''
  });

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    setFormData({
      name: user.name || '',
      address: user.address || ''
    });

    const fetchMyOrders = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/orders/my-orders`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        } else {
          // If endpoint doesn't exist yet, we will fallback gracefully
          throw new Error();
        }
      } catch (error) {
        console.warn("My Orders API not available or offline. Using local storage logged order list fallback.");
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchMyOrders();
  }, [user, token, navigate]);

  const handleRetryWhatsApp = (order) => {
    const adminPhoneNumber = '94766572148';
    const itemsText = order.items.map(item => 
      `- ${item.title} x ${item.quantity} (${(item.price * item.quantity).toLocaleString()} LKR)`
    ).join('\n');

    const whatsappMessage = `Hello, I want to order:

Book Details:
${itemsText}

Total Price: ${order.totalPrice.toLocaleString()} LKR

Customer Details:
- Name: ${order.customerName}
- Phone: ${order.customerPhone}
- Address: ${order.customerAddress}

Please confirm my order.`;

    window.open(`https://wa.me/${adminPhoneNumber}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
  };

  const handleCancelOrder = async (order) => {
    if (!window.confirm(`Are you sure you want to cancel order ${order._id.slice(-6).toUpperCase()}?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/orders/${order._id}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setOrders(orders.map(o => o._id === order._id ? { ...o, status: 'cancelled' } : o));
        showToast('Order cancelled successfully.');

        // Open WhatsApp cancellation notice to admin
        const adminPhoneNumber = '94766572148';
        const itemsText = order.items.map(item => 
          `- ${item.title} x ${item.quantity}`
        ).join('\n');
        
        const cancelMessage = `Hello, I want to CANCEL my order:

Order ID: ${order._id.toUpperCase()}
Status: CANCELLED

Items:
${itemsText}

Customer Details:
- Name: ${order.customerName}
- Phone: ${order.customerPhone}

Please update the order status.`;

        window.open(`https://wa.me/${adminPhoneNumber}?text=${encodeURIComponent(cancelMessage)}`, '_blank');
      } else {
        showToast('Failed to cancel order.', 'error');
      }
    } catch (err) {
      setOrders(orders.map(o => o._id === order._id ? { ...o, status: 'cancelled' } : o));
      showToast('Order cancelled (Offline Simulation)');
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully.');
    navigate('/');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const result = await updateProfile(formData.name.trim(), formData.address.trim());
    if (result.success) {
      showToast('Profile updated successfully!');
      setIsEditing(false);
    } else {
      showToast(result.message || 'Error updating profile', 'error');
    }
    setSaving(false);
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <h1 className="text-3xl font-bold tracking-tight font-display text-slate-100 light:text-slate-950 mb-8">
        My Profile
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Profile Card & Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 border border-white/5 space-y-6">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-brand-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold uppercase">
                {user.name ? user.name[0] : 'U'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-100 light:text-slate-950">{user.name}</h3>
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 uppercase light:text-slate-600">
                  {user.role === 'admin' ? 'Administrator' : 'Customer Account'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Phone Number (disabled) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  <span>Verified Phone</span>
                </label>
                <input
                  type="text"
                  value={user.phoneNumber}
                  disabled
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/5 text-slate-500 cursor-not-allowed text-sm"
                />
              </div>

              {/* Edit Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing || saving}
                  className={`w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/50 ${
                    isEditing 
                      ? 'bg-white/5 border border-brand-500/30 text-slate-100 light:bg-white light:border-slate-300 light:text-slate-900' 
                      : 'bg-slate-900/20 border border-white/5 text-slate-400 cursor-not-allowed light:bg-slate-100'
                  }`}
                />
              </div>

              {/* Edit Address */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Default Delivery Address</span>
                </label>
                <textarea
                  value={formData.address}
                  rows="3"
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!isEditing || saving}
                  className={`w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/50 ${
                    isEditing 
                      ? 'bg-white/5 border border-brand-500/30 text-slate-100 light:bg-white light:border-slate-300 light:text-slate-900' 
                      : 'bg-slate-900/20 border border-white/5 text-slate-400 cursor-not-allowed light:bg-slate-100'
                  }`}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ name: user.name, address: user.address });
                        setIsEditing(false);
                      }}
                      className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/5 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-500 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>{saving ? 'Saving...' : 'Save'}</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="w-full py-2.5 rounded-xl border border-brand-500/30 text-brand-400 text-xs font-bold hover:bg-brand-500/10 transition-colors"
                  >
                    Edit Profile Details
                  </button>
                )}
              </div>
            </form>

            <button
              onClick={handleLogout}
              className="w-full py-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all font-bold text-xs flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out Account</span>
            </button>
          </div>

          {/* Admin Dashboard Quick Link */}
          {user.role === 'admin' && (
            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-amber-300">Admin Control Room</h4>
                <p className="text-[10px] text-slate-400">Inventory and order processing dashboard</p>
              </div>
              <Link
                to="/admin"
                className="p-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-all transform active:scale-95"
              >
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Order History */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-card p-6 border border-white/5 space-y-6">
            <h2 className="text-xl font-bold font-display text-slate-200 light:text-slate-800 border-b border-white/5 pb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-brand-400" />
              <span>WhatsApp Order Logs</span>
            </h2>

            {loadingOrders ? (
              <div className="space-y-4">
                {[1, 2].map((s) => (
                  <div key={s} className="h-20 bg-white/5 shimmer rounded-xl" />
                ))}
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
                {orders.map((order) => (
                  <div key={order._id} className="p-4 rounded-xl border border-white/5 bg-slate-900/40 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">ID: {order._id.slice(-6).toUpperCase()}</span>
                      <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                        order.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : order.status === 'cancelled'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-sm font-medium flex justify-between">
                          <span className="text-slate-300 light:text-slate-700 truncate max-w-xs">{item.title}</span>
                          <span className="text-slate-400">x {item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-end border-t border-white/5 pt-2 text-xs">
                      <span className="text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                      <span className="font-bold text-slate-100 font-display text-sm">
                        {order.totalPrice.toLocaleString()} LKR
                      </span>
                    </div>

                    {order.status === 'pending' && (
                      <div className="flex gap-2 pt-2 mt-2 border-t border-white/5">
                        <button
                          onClick={() => handleRetryWhatsApp(order)}
                          className="flex-1 py-1.5 px-3 rounded bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1 hover:shadow-lg active:scale-95"
                        >
                          <Send className="h-3 w-3 animate-pulse" />
                          <span>Retry WhatsApp</span>
                        </button>
                        <button
                          onClick={() => handleCancelOrder(order)}
                          className="py-1.5 px-3 rounded border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 font-semibold text-xs transition-all active:scale-95"
                        >
                          Cancel Order
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <h4 className="font-bold text-slate-400">No tracked orders</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Orders submitted through the cart redirecting to WhatsApp will appear here for status tracking.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
