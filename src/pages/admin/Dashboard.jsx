import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, ShoppingBag, BookOpen, Users, 
  AlertTriangle, CheckCircle, RefreshCw, Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

export default function Dashboard() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success || json.kpis) {
        setData(json);
      } else {
        setError(json.message || 'Failed to load analytics.');
      }
    } catch (err) {
      setError('Network error. Failed to retrieve real-time analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  // Format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* KPI Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-28 bg-slate-900 border border-slate-800 rounded-3xl" />
          ))}
        </div>
        {/* Charts & Table Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-900 border border-slate-800 rounded-3xl" />
          <div className="h-96 bg-slate-900 border border-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-rose-500/20 bg-rose-500/5 text-rose-300 rounded-3xl flex items-center justify-between">
        <span>{error}</span>
        <button 
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const { kpis, recentOrders, recentCustomers, bestSellers, mostViewed, salesChartData } = data;

  // Compute SVG chart parameters dynamically
  const chartSales = salesChartData || [];
  const maxSales = Math.max(...chartSales.map(d => d.sales), 1000);
  const chartWidth = 500;
  const chartHeight = 160;

  // Generate SVG path for line chart
  const points = chartSales.map((d, index) => {
    const x = (index / (chartSales.length - 1 || 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - ((d.sales / maxSales) * (chartHeight - 40) + 20);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="space-y-6">
      {/* Upper Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 font-display uppercase tracking-wide">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-400">Real-time store operations & sales metrics</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
        >
          <RefreshCw className="h-4 w-4 animate-spin-slow" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="bg-[#0f172a] border border-slate-850 p-6 rounded-3xl flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Revenue</span>
            <h3 className="text-xl font-extrabold text-slate-100">{formatCurrency(kpis.totalRevenue)}</h3>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>+12% vs last month</span>
            </span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        {/* Orders */}
        <div className="bg-[#0f172a] border border-slate-850 p-6 rounded-3xl flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Orders</span>
            <h3 className="text-xl font-extrabold text-slate-100">{kpis.totalOrders}</h3>
            <span className="text-[10px] text-brand-400 font-semibold">
              {kpis.pendingOrdersCount} pending approvals
            </span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <ShoppingBag className="h-6 w-6" />
          </div>
        </div>

        {/* Books */}
        <div className="bg-[#0f172a] border border-slate-850 p-6 rounded-3xl flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Book Catalog</span>
            <h3 className="text-xl font-extrabold text-slate-100">{kpis.totalBooks}</h3>
            <span className="text-[10px] text-amber-500 font-semibold">
              {kpis.lowStockAlerts} low stock items
            </span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        {/* Customers */}
        <div className="bg-[#0f172a] border border-slate-850 p-6 rounded-3xl flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Registered Users</span>
            <h3 className="text-xl font-extrabold text-slate-100">{kpis.totalCustomers}</h3>
            <span className="text-[10px] text-purple-400 font-semibold">Active customer base</span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Users className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Warning Warnings Panels */}
      {(kpis.lowStockAlerts > 0 || kpis.outOfStockAlerts > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl text-xs text-amber-450 font-medium">
          {kpis.outOfStockAlerts > 0 && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 text-rose-500 shrink-0 animate-bounce" />
              <span>Critical: <span className="font-bold text-rose-400">{kpis.outOfStockAlerts} books</span> are completely out of stock.</span>
            </div>
          )}
          {kpis.lowStockAlerts > 0 && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0" />
              <span>Inventory warning: <span className="font-bold">{kpis.lowStockAlerts} books</span> have low stock levels (&le; 5 units).</span>
            </div>
          )}
        </div>
      )}

      {/* Charts & Performance Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Graph */}
        <div className="lg:col-span-2 bg-[#0f172a] border border-slate-850 p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-850 pb-4">
            <h3 className="font-bold text-sm text-slate-200">Monthly Revenue Stream</h3>
            <span className="text-[10px] uppercase font-bold bg-slate-800 text-slate-400 px-2.5 py-1 rounded">6 Month Window</span>
          </div>
          <div className="relative">
            {chartSales.length > 0 ? (
              <div className="w-full">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48 overflow-visible">
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
                    const y = chartHeight - (r * (chartHeight - 40) + 20);
                    return (
                      <line 
                        key={i} 
                        x1="20" y1={y} x2={chartWidth - 20} y2={y} 
                        stroke="#1e293b" strokeDasharray="4 4" 
                      />
                    );
                  })}
                  {/* SVG Line path */}
                  <polyline
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                  />
                  {/* Hover dots & labels */}
                  {chartSales.map((d, index) => {
                    const x = (index / (chartSales.length - 1 || 1)) * (chartWidth - 40) + 20;
                    const y = chartHeight - ((d.sales / maxSales) * (chartHeight - 40) + 20);
                    return (
                      <g key={index} className="group cursor-pointer">
                        <circle 
                          cx={x} cy={y} r="5" 
                          fill="#a855f7" stroke="#0f172a" strokeWidth="2.5" 
                          className="hover:r-7 transition-all"
                        />
                        <text 
                          x={x} y={chartHeight - 5} 
                          fill="#64748b" fontSize="8" fontWeight="bold" textAnchor="middle"
                        >
                          {d.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            ) : (
              <p className="text-center text-slate-500 py-16 text-xs">No chart metrics computed yet.</p>
            )}
          </div>
        </div>

        {/* Most Viewed Books */}
        <div className="bg-[#0f172a] border border-slate-850 p-6 rounded-3xl space-y-4">
          <div className="border-b border-slate-850 pb-4">
            <h3 className="font-bold text-sm text-slate-200">Catalog Engagement</h3>
            <p className="text-[10px] text-slate-400">Top viewed books by customer interest</p>
          </div>
          <div className="space-y-3">
            {mostViewed.length === 0 ? (
              <p className="text-center text-slate-600 py-8 text-xs">No analytics logs recorded.</p>
            ) : (
              mostViewed.map((book, idx) => (
                <div key={book._id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="truncate flex-1">
                    <p className="font-bold text-slate-350 truncate">{book.title}</p>
                    <p className="text-[10px] text-slate-500 truncate">{book.author}</p>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-slate-800 text-[10px] font-extrabold text-slate-400 shrink-0">
                    {book.views || 0} hits
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Grid of Tables: Best Sellers & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Best Selling Books */}
        <div className="bg-[#0f172a] border border-slate-850 p-6 rounded-3xl space-y-4">
          <div className="border-b border-slate-850 pb-4">
            <h3 className="font-bold text-sm text-slate-200">Best Sellers</h3>
            <p className="text-[10px] text-slate-400">Products with highest volume sales</p>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs text-slate-400 border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-slate-500 font-bold">
                  <th className="pb-2.5">Title</th>
                  <th className="pb-2.5">Category</th>
                  <th className="pb-2.5 text-right">Units Sold</th>
                </tr>
              </thead>
              <tbody>
                {bestSellers.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-6 text-slate-500">No orders finalized yet.</td>
                  </tr>
                ) : (
                  bestSellers.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-850/40 hover:bg-slate-800/10">
                      <td className="py-2.5 font-bold text-slate-350 truncate max-w-[180px]">
                        {item.book?.title}
                      </td>
                      <td className="py-2.5">{item.book?.category}</td>
                      <td className="py-2.5 text-right font-extrabold text-emerald-400">
                        {item.salesCount}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-[#0f172a] border border-slate-850 p-6 rounded-3xl space-y-4">
          <div className="border-b border-slate-850 pb-4">
            <h3 className="font-bold text-sm text-slate-200">Recent Desk Orders</h3>
            <p className="text-[10px] text-slate-400">Latest transactions needing processing</p>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-center text-slate-500 py-6 text-xs">No orders recorded yet.</p>
            ) : (
              recentOrders.map((o) => (
                <div key={o._id} className="flex items-center justify-between gap-3 text-xs bg-slate-900/30 p-2.5 rounded-2xl border border-slate-850/40">
                  <div>
                    <p className="font-bold text-slate-300 flex items-center gap-1.5">
                      <span>{o.customerName || o.userId?.name || 'Guest User'}</span>
                      <span className="text-[9px] font-normal text-slate-500">({new Date(o.createdAt).toLocaleDateString()})</span>
                    </p>
                    <p className="text-[10px] text-slate-500">{o.items?.length || 0} books • {formatCurrency(o.totalPrice || o.total || o.totalAmount)}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase shrink-0 ${
                    o.status === 'completed' || o.status === 'delivered'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : o.status === 'pending'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}>
                    {o.status || 'Pending'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
