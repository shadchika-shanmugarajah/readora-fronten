import React, { useState, useEffect } from 'react';
import { 
  Users, Search, ShieldAlert, Check, X, Shield, ShieldCheck, 
  RefreshCw, Ban, UserCheck, AlertTriangle, Clock, ShoppingBag,
  Calendar, MapPin, Mail, Package, CreditCard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

export default function Customers() {
  const { token, user: loggedUser } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Table controls
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selected customer for role change
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [targetRole, setTargetRole] = useState('user');
  const [savingRole, setSavingRole] = useState(false);

  // Customer Order History state
  const [historyUser, setHistoryUser] = useState(null);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const handleOpenHistory = async (user) => {
    setHistoryUser(user);
    setShowHistoryModal(true);
    setLoadingHistory(true);
    try {
      const res = await fetch(`${API_BASE_URL}/orders/customer/${encodeURIComponent(user.phoneNumber)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistoryOrders(Array.isArray(data) ? data : []);
      } else {
        setHistoryOrders([]);
      }
    } catch (err) {
      console.error("Failed to fetch customer orders:", err);
      setHistoryOrders([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setCustomers(data);
      } else {
        setError('Failed to fetch user list.');
      }
    } catch (err) {
      setError('Network error. Failed to retrieve customer list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [token]);

  const flashSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Toggle active/blocked status
  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'blocked' ? 'active' : 'blocked';
    const actionText = nextStatus === 'blocked' ? 'BLOCK' : 'UNBLOCK';
    
    if (!window.confirm(`Are you sure you want to ${actionText} user "${user.name}"?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/users/${user._id || user.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: nextStatus })
      });

      if (res.ok) {
        flashSuccess(`User account "${user.name}" status updated to ${nextStatus}.`);
        fetchCustomers();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update user status.');
      }
    } catch (err) {
      alert('Error updating user status.');
    }
  };

  // Change Role
  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    setSavingRole(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users/${selectedUser._id || selectedUser.id}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: targetRole })
      });

      if (res.ok) {
        flashSuccess(`Authorization role for "${selectedUser.name}" changed to "${targetRole}".`);
        setShowRoleModal(false);
        fetchCustomers();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update role.');
      }
    } catch (err) {
      alert('Error saving role.');
    } finally {
      setSavingRole(false);
    }
  };

  // Filters
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phoneNumber.includes(search);

    let matchesRole = true;
    if (roleFilter !== 'All') {
      matchesRole = c.role === roleFilter;
    }

    let matchesStatus = true;
    if (statusFilter !== 'All') {
      matchesStatus = c.status === statusFilter;
    }

    return matchesSearch && matchesRole && matchesStatus;
  });

  // KPI Calculations
  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status !== 'blocked').length,
    blocked: customers.filter(c => c.status === 'blocked').length,
    staff: customers.filter(c => c.role === 'admin' || c.role === 'staff' || c.role === 'super_admin').length
  };

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
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

      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 font-display uppercase tracking-wide">
            Customer Management
          </h1>
          <p className="text-xs text-slate-400">View user directories, toggle account status blockages, and promote permissions</p>
        </div>
        <button 
          onClick={fetchCustomers}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-350 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh List</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-[#0f172a] border border-slate-850 p-5 rounded-3xl space-y-1">
          <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Total Users</span>
          <h3 className="text-xl font-black text-slate-100">{stats.total}</h3>
          <p className="text-[10px] text-slate-500">Registered database profiles</p>
        </div>
        <div className="bg-[#0f172a] border border-slate-850 p-5 rounded-3xl space-y-1">
          <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Active Customers</span>
          <h3 className="text-xl font-black text-emerald-400">{stats.active}</h3>
          <p className="text-[10px] text-slate-500">Unrestricted logins</p>
        </div>
        <div className="bg-[#0f172a] border border-slate-850 p-5 rounded-3xl space-y-1">
          <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Blocked Accounts</span>
          <h3 className="text-xl font-black text-rose-400">{stats.blocked}</h3>
          <p className="text-[10px] text-slate-500">Logins denied access</p>
        </div>
        <div className="bg-[#0f172a] border border-slate-850 p-5 rounded-3xl space-y-1">
          <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Staff / Admins</span>
          <h3 className="text-xl font-black text-brand-400">{stats.staff}</h3>
          <p className="text-[10px] text-slate-500">Management roles</p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-[#0f172a] border border-slate-850 p-4 rounded-3xl grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-350 text-xs focus:outline-none"
        >
          <option value="All">All User Roles</option>
          <option value="user">Customers Only</option>
          <option value="staff">Staff Members</option>
          <option value="admin">Administrators</option>
          <option value="super_admin">Super Admins</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-350 text-xs focus:outline-none"
        >
          <option value="All">All Login States</option>
          <option value="active">Active State Only</option>
          <option value="blocked">Blocked State Only</option>
        </select>

      </div>

      {/* Main Customers Table */}
      <div className="bg-[#0f172a] border border-slate-850 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-850 text-slate-500 font-bold uppercase tracking-wider">
                <th className="p-4">Customer Name</th>
                <th className="p-4">Phone Contact</th>
                <th className="p-4">Delivery Address</th>
                <th className="p-4 text-center">Authorization Role</th>
                <th className="p-4 text-center">Login Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-500">Loading user profiles...</td>
                </tr>
              ) : paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-500">No matching user accounts found.</td>
                </tr>
              ) : (
                paginatedCustomers.map((c) => (
                  <tr key={c._id || c.id} className="border-b border-slate-850/40 hover:bg-slate-800/10 transition-colors">
                    {/* Name */}
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-slate-200 text-sm">{c.name}</p>
                        <p className="text-[10px] text-slate-550">Joined {new Date(c.createdAt).toLocaleDateString()}</p>
                      </div>
                    </td>
                    {/* Phone */}
                    <td className="p-4 text-slate-300 font-mono">{c.phoneNumber}</td>
                    {/* Address */}
                    <td className="p-4 text-slate-400 max-w-[200px] truncate">{c.address || 'No address set'}</td>
                    {/* Role */}
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        c.role === 'super_admin'
                          ? 'bg-rose-500/10 text-rose-450 border border-rose-900/30'
                          : c.role === 'admin'
                          ? 'bg-amber-500/10 text-amber-450 border border-amber-900/30'
                          : c.role === 'staff'
                          ? 'bg-brand-500/10 text-brand-450 border border-brand-900/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {c.role || 'user'}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                        c.status === 'blocked'
                          ? 'bg-rose-950 text-rose-400 border border-rose-900/30'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-900/30'
                      }`}>
                        {c.status || 'active'}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="p-4 text-right space-x-2">
                      {/* View Customer Order History */}
                      <button
                        onClick={() => handleOpenHistory(c)}
                        title="View Customer Orders & History"
                        className="p-1.5 rounded-lg bg-brand-950/60 hover:bg-brand-900/80 text-brand-400 hover:text-brand-300 border border-brand-800/40 transition-all inline-flex items-center justify-center align-middle"
                      >
                        <Clock className="h-4 w-4" />
                      </button>

                      {/* Block/Unblock toggle */}
                      {(c.role !== 'super_admin' && (loggedUser?.role === 'super_admin' || loggedUser?.role === 'admin')) && (
                        <>
                          <button
                            onClick={() => handleToggleStatus(c)}
                            title={c.status === 'blocked' ? 'Unblock User Login' : 'Block User Account'}
                            className={`p-1.5 rounded-lg transition-all inline-flex items-center justify-center align-middle ${
                              c.status === 'blocked'
                                ? 'bg-emerald-950 text-emerald-400 hover:bg-emerald-900'
                                : 'bg-rose-950 text-rose-450 hover:bg-rose-900'
                            }`}
                          >
                            {c.status === 'blocked' ? <UserCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                          </button>
                          
                          {/* Role edit action */}
                          <button
                            onClick={() => { setSelectedUser(c); setTargetRole(c.role || 'user'); setShowRoleModal(true); }}
                            title="Edit Role permissions"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-slate-100 transition-all inline-flex items-center justify-center align-middle"
                          >
                            <Shield className="h-4 w-4" />
                          </button>
                        </>
                      )}
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
              Page {currentPage} of {totalPages}
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

      {/* ROLE MODAL OVERLAY */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-sm rounded-3xl shadow-2xl p-6 space-y-4 animate-scale-in">
            
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-brand-400" />
                <span>Change Authorization Role</span>
              </h3>
              <button 
                onClick={() => { setShowRoleModal(false); setSelectedUser(null); }}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-450"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-4 text-xs">
              
              <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl">
                <p className="font-bold text-slate-350 text-xs">User: {selectedUser.name}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Phone: {selectedUser.phoneNumber}</p>
              </div>

              {/* Role Dropdown */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-450 uppercase">Select Role Level</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                >
                  <option value="user">Customer / User</option>
                  <option value="staff">Staff Member</option>
                  <option value="admin">Administrator</option>
                  {loggedUser?.role === 'super_admin' && (
                    <option value="super_admin">Super Administrator</option>
                  )}
                </select>
              </div>

              {/* Warnings box */}
              {targetRole === 'super_admin' && (
                <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-2xl flex items-start gap-2 text-rose-350 text-[10px]">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-rose-500" />
                  <p className="leading-relaxed">
                    WARNING: Promoting a user to Super Administrator gives them complete permissions including backup restore capabilities.
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => { setShowRoleModal(false); setSelectedUser(null); }}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-slate-450 font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRole}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-all"
                >
                  {savingRole ? 'Saving...' : 'Apply Role'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* CUSTOMER ORDER HISTORY MODAL OVERLAY */}
      {showHistoryModal && historyUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-850 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-100 font-display">
                    Customer History & Orders
                  </h3>
                  <p className="text-xs text-slate-400">
                    {historyUser.name} • <span className="font-mono text-slate-300">{historyUser.phoneNumber}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { setShowHistoryModal(false); setHistoryUser(null); }}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Customer Profile Summary */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-850 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                    <UserCheck className="h-3 w-3 text-brand-400" /> Full Name
                  </span>
                  <p className="font-semibold text-slate-200 mt-0.5">{historyUser.name}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                    <Phone className="h-3 w-3 text-brand-400" /> Phone Contact
                  </span>
                  <p className="font-semibold text-slate-200 mt-0.5 font-mono">{historyUser.phoneNumber}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-brand-400" /> Delivery Address
                  </span>
                  <p className="font-semibold text-slate-200 mt-0.5">{historyUser.address || 'No address set'}</p>
                </div>
              </div>

              {/* Order Stats Overview */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-2xl">
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Total Orders</span>
                  <h4 className="text-lg font-black text-slate-100 mt-0.5">{historyOrders.length}</h4>
                </div>
                <div className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-2xl">
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Total Spent</span>
                  <h4 className="text-lg font-black text-emerald-400 mt-0.5">
                    LKR {historyOrders
                      .filter(o => o.status !== 'cancelled')
                      .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0)
                      .toLocaleString()}
                  </h4>
                </div>
                <div className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-2xl">
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Completed</span>
                  <h4 className="text-lg font-black text-brand-400 mt-0.5">
                    {historyOrders.filter(o => o.status === 'completed').length}
                  </h4>
                </div>
              </div>

              {/* Order Records List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5 text-brand-400" />
                  <span>Order Records ({historyOrders.length})</span>
                </h4>

                {loadingHistory ? (
                  <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto text-brand-400" />
                    <p>Loading customer order records...</p>
                  </div>
                ) : historyOrders.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-950/30 border border-slate-850/60 text-center text-xs text-slate-500 space-y-1">
                    <ShoppingBag className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                    <p className="font-semibold text-slate-400">No orders placed yet</p>
                    <p className="text-[11px]">This customer has not placed any orders through the store yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {historyOrders.map((order) => (
                      <div 
                        key={order._id}
                        className="p-4 rounded-2xl bg-slate-950/60 border border-slate-850 space-y-3 text-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-850/60">
                          <div>
                            <span className="font-mono font-bold text-brand-400 text-xs">
                              #{order._id.slice(-6).toUpperCase()}
                            </span>
                            <span className="text-[10px] text-slate-500 ml-2">
                              {new Date(order.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                              order.status === 'completed'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30'
                                : order.status === 'cancelled'
                                ? 'bg-rose-950 text-rose-400 border border-rose-900/30'
                                : order.status === 'shipped'
                                ? 'bg-sky-950 text-sky-400 border border-sky-900/30'
                                : 'bg-amber-950 text-amber-400 border border-amber-900/30'
                            }`}>
                              {order.status}
                            </span>
                            <span className="font-bold text-slate-200 text-sm">
                              LKR {(Number(order.totalPrice) || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Items in order */}
                        <div className="space-y-1.5">
                          {order.items && order.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-[11px] text-slate-300">
                              <span className="truncate max-w-[300px]">
                                {item.title || item.name || 'Book item'} <span className="text-slate-500 font-mono">× {item.quantity || 1}</span>
                              </span>
                              <span className="font-mono text-slate-400">
                                LKR {((Number(item.price) || 0) * (item.quantity || 1)).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Footer: Payment info */}
                        <div className="pt-2 border-t border-slate-850/40 flex items-center justify-between text-[10px] text-slate-500">
                          <span>Payment: <strong className="text-slate-400 uppercase">{order.paymentMethod || 'COD'}</strong> ({order.paymentStatus || 'unpaid'})</span>
                          {order.customerAddress && (
                            <span className="truncate max-w-[250px] text-slate-400">📍 {order.customerAddress}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-850 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => { setShowHistoryModal(false); setHistoryUser(null); }}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all"
              >
                Close History
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
