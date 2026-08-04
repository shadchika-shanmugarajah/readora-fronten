import React, { useState, useEffect } from 'react';
import { 
  Search, Eye, Check, X, ShieldAlert, 
  Calendar, Phone, MapPin, DollarSign, Image, CheckCircle, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

export default function Orders() {
  const { token } = useAuth();
  
  // Data State
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Table Controls
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('All'); // All, pending, processing, shipped, completed, cancelled
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selected Order Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showSlipLightbox, setShowSlipLightbox] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch all orders
  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setError('Failed to fetch orders.');
      }
    } catch (err) {
      setError('Network error. Failed to load orders desk.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  // Flash Success Msg Helper
  const flashSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Change Order Status
  const handleUpdateStatus = async (id, newStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        const updated = await res.json();
        flashSuccess(`Order status updated to ${newStatus}`);
        
        // Update local list & selected modal
        setOrders(prev => prev.map(o => o._id === id ? { ...o, status: newStatus } : o));
        setSelectedOrder(prev => prev && prev._id === id ? { ...prev, status: newStatus } : prev);
      } else {
        alert('Failed to update status.');
      }
    } catch (err) {
      alert('Error updating status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Verify Bank Transfer Payment Slip
  const handleVerifyPayment = async (id, verifyStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}/verify-payment`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: verifyStatus }) // 'paid' or 'unpaid'
      });

      if (res.ok) {
        const updated = await res.json();
        flashSuccess(`Payment status verified as: ${verifyStatus.toUpperCase()}`);
        
        // Update local list & selected modal
        setOrders(prev => prev.map(o => o._id === id ? { ...o, paymentStatus: verifyStatus } : o));
        setSelectedOrder(prev => prev && prev._id === id ? { ...prev, paymentStatus: verifyStatus } : prev);
      } else {
        alert('Failed to verify payment status.');
      }
    } catch (err) {
      alert('Error connecting to verify payment API.');
    }
  };

  // Format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(val || 0);
  };

  // Filtering Logic
  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      (o.customerName && o.customerName.toLowerCase().includes(search.toLowerCase())) ||
      (o._id && o._id.includes(search)) ||
      (o.customerPhone && o.customerPhone.includes(search));

    const matchesTab = statusTab === 'All' || o.status === statusTab;

    return matchesSearch && matchesTab;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {successMsg && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-500 border border-emerald-400 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 font-display uppercase tracking-wide">
            Order Desk
          </h1>
          <p className="text-xs text-slate-400">Review transactions, check bank transfer slips, and update status</p>
        </div>
        <button 
          onClick={fetchOrders}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-350 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Sync Orders</span>
        </button>
      </div>

      {/* Search and Pipeline status Tabs */}
      <div className="space-y-4">
        {/* Status pipeline Tabs */}
        <div className="flex border-b border-slate-850 overflow-x-auto no-scrollbar gap-2">
          {['All', 'pending', 'processing', 'shipped', 'completed', 'cancelled'].map(tab => (
            <button
              key={tab}
              onClick={() => { setStatusTab(tab); setCurrentPage(1); }}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 capitalize ${
                statusTab === tab 
                  ? 'border-brand-500 text-brand-400 font-extrabold' 
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab === 'All' ? 'All Orders' : tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by customer name, phone, order ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0f172a] border border-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#0f172a] border border-slate-850 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-850 text-slate-500 font-bold uppercase tracking-wider">
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Date</th>
                <th className="p-4">Method</th>
                <th className="p-4 text-right">Total Price</th>
                <th className="p-4 text-center">Payment Status</th>
                <th className="p-4 text-center">Order Status</th>
                <th className="p-4 text-right">Detail</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-slate-500">Loading order records...</td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-slate-500">No orders found.</td>
                </tr>
              ) : (
                paginatedOrders.map((o) => (
                  <tr key={o._id} className="border-b border-slate-850/40 hover:bg-slate-800/10 transition-colors">
                    {/* Order ID */}
                    <td className="p-4 font-bold text-slate-400 font-mono">
                      #{o._id?.slice(-8) || o._id}
                    </td>
                    {/* Customer */}
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-slate-200">{o.customerName}</p>
                        <p className="text-[10px] text-slate-500">{o.customerPhone}</p>
                      </div>
                    </td>
                    {/* Date */}
                    <td className="p-4 text-slate-400">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    {/* Payment Method */}
                    <td className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      {o.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'COD'}
                    </td>
                    {/* Price */}
                    <td className="p-4 text-right font-extrabold text-slate-100">
                      {formatCurrency(o.totalPrice || o.totalAmount)}
                    </td>
                    {/* Payment Status Pill */}
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        o.paymentStatus === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : o.paymentStatus === 'pending'
                          ? 'bg-amber-500/10 text-amber-450 border border-amber-500/20 animate-pulse'
                          : 'bg-rose-500/10 text-rose-450 border border-rose-500/20'
                      }`}>
                        {o.paymentStatus || 'unpaid'}
                      </span>
                    </td>
                    {/* Order Status Pill */}
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        o.status === 'completed'
                          ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20'
                          : o.status === 'shipped'
                          ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                          : o.status === 'processing'
                          ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                          : o.status === 'cancelled'
                          ? 'bg-slate-800 text-slate-500 border border-slate-750'
                          : 'bg-amber-600/10 text-amber-450 border border-amber-550/20 animate-pulse'
                      }`}>
                        {o.status || 'pending'}
                      </span>
                    </td>
                    {/* Detail Button */}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-slate-100 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="bg-slate-900/40 p-4 border-t border-slate-850 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Page {currentPage} of {totalPages} ({filteredOrders.length} orders total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 px-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30"
              >
                Prev
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1 px-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL DRAWER */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-850 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold font-display uppercase text-sm tracking-wider text-slate-200">
                  Order Details
                </h3>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">ID: {selectedOrder._id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg hover:bg-slate-850 text-slate-500 hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto no-scrollbar flex-1 space-y-6 text-xs">
              
              {/* Customer Profile & Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Profile detail */}
                <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl space-y-2">
                  <span className="text-[9px] uppercase font-bold text-brand-400 tracking-wider">Customer Details</span>
                  <div className="space-y-1.5 text-slate-300">
                    <p className="font-bold text-sm text-slate-200">{selectedOrder.customerName}</p>
                    <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-slate-500" />{selectedOrder.customerPhone}</p>
                    <p className="flex items-start gap-2"><MapPin className="h-3.5 w-3.5 text-slate-500 mt-0.5 shrink-0" />{selectedOrder.customerAddress}</p>
                  </div>
                </div>

                {/* Pipeline Controls */}
                <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl flex flex-col justify-between gap-3">
                  <span className="text-[9px] uppercase font-bold text-brand-400 tracking-wider">Update Order Status</span>
                  
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 text-[10px] uppercase">Select Current Pipeline State</label>
                    <select
                      value={selectedOrder.status}
                      disabled={updatingStatus}
                      onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-350 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="pending">Pending Review</option>
                      <option value="processing">Processing & Packaged</option>
                      <option value="shipped">Shipped / Dispatched</option>
                      <option value="completed">Completed / Handed over</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <span className="text-[9px] uppercase font-bold text-brand-400 tracking-wider">Items in Order</span>
                <div className="border border-slate-850/60 rounded-2xl overflow-hidden bg-slate-950/20">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="p-3 border-b border-slate-850/40 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-bold text-slate-300">{item.title}</p>
                        <p className="text-[10px] text-slate-500">Qty: {item.quantity} • Unit Price: Rs.{item.price}</p>
                      </div>
                      <span className="font-bold text-slate-200">
                        Rs.{(item.price * item.quantity).toFixed(0)}
                      </span>
                    </div>
                  ))}
                  <div className="p-3 bg-slate-900/40 flex items-center justify-between font-bold text-slate-200">
                    <span>Grand Total</span>
                    <span className="text-sm text-brand-400">{formatCurrency(selectedOrder.totalPrice || selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Bank Transfer Slip Verification */}
              {selectedOrder.paymentMethod === 'bank_transfer' && (
                <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <span className="text-[9px] uppercase font-bold text-brand-400 tracking-wider flex items-center gap-1.5">
                      <Image className="h-4 w-4" />
                      <span>Bank Transfer Verification</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      selectedOrder.paymentStatus === 'paid'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : selectedOrder.paymentStatus === 'pending'
                        ? 'bg-amber-500/10 text-amber-450 animate-pulse'
                        : 'bg-rose-500/10 text-rose-450'
                    }`}>
                      {selectedOrder.paymentStatus || 'unpaid'}
                    </span>
                  </div>

                  {selectedOrder.paymentSlip ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Slip Preview */}
                      <div 
                        onClick={() => setShowSlipLightbox(true)}
                        className="h-28 w-24 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative cursor-zoom-in shrink-0 group"
                      >
                        <img 
                          src={selectedOrder.paymentSlip} 
                          alt="Slip Preview"
                          className="h-full w-full object-cover group-hover:scale-105 transition-all"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[9px] font-extrabold text-white">ZOOM</span>
                        </div>
                      </div>

                      {/* Verification Controls */}
                      <div className="flex-1 space-y-3">
                        <p className="text-[10px] text-slate-400">
                          Confirm whether the customer's transfer slip corresponds to the transaction total in your bank ledger.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerifyPayment(selectedOrder._id, 'paid')}
                            className="px-3.5 py-2 bg-emerald-650 hover:bg-emerald-650/90 text-white font-bold rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Verify Payment</span>
                          </button>
                          <button
                            onClick={() => handleVerifyPayment(selectedOrder._id, 'unpaid')}
                            className="px-3.5 py-2 bg-rose-950 hover:bg-rose-900 text-rose-350 font-semibold rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
                          >
                            <X className="h-4 w-4" />
                            <span>Reject slip</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-slate-500">
                      <ShieldAlert className="h-5 w-5 mx-auto text-amber-500 mb-1" />
                      <span>Pending transfer slip. Customer hasn't uploaded a document yet.</span>
                    </div>
                  )}

                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* FULL IMAGE SLIP LIGHTBOX OVERLAY */}
      {showSlipLightbox && selectedOrder && (
        <div className="fixed inset-0 z-55 bg-slate-950/90 flex items-center justify-center p-4">
          <button 
            onClick={() => setShowSlipLightbox(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-slate-900 text-slate-200 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
          <img 
            src={selectedOrder.paymentSlip} 
            alt="Payment Slip Full Size"
            className="max-h-[85vh] max-w-full object-contain rounded-xl shadow-2xl border border-slate-800"
          />
        </div>
      )}

    </div>
  );
}
