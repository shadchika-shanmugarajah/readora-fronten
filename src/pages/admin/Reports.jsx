import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Calendar, Download, RefreshCw, BarChart3, 
  ShoppingBag, Award, PieChart, FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

export default function Reports() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Date filter controls
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [report, setReport] = useState(null);

  const fetchSalesReport = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/reports/sales?startDate=${startDate}&endDate=${endDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data && data.salesByCategory !== undefined) {
        setReport(data);
      } else {
        setError('Failed to fetch sales report data.');
      }
    } catch (err) {
      setError('Network error. Failed to retrieve sales report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesReport();
  }, [token]);

  const handleDateChange = (e) => {
    const val = e.target.value;
    const now = new Date();
    let start = new Date();
    
    if (val === '7days') {
      start.setDate(now.getDate() - 7);
    } else if (val === '30days') {
      start.setDate(now.getDate() - 30);
    } else if (val === '90days') {
      start.setDate(now.getDate() - 90);
    } else return; // custom triggers manually

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(now.toISOString().split('T')[0]);
  };

  // Trigger manual load for custom dates
  const handleApplyCustomDates = (e) => {
    e.preventDefault();
    fetchSalesReport();
  };

  // Export to CSV compiler
  const handleExportCSV = (type) => {
    if (!report) return;

    let headers = [];
    let rows = [];
    let filename = '';

    if (type === 'books') {
      headers = ['Book Title', 'Author', 'Category', 'Units Sold', 'Revenue (LKR)'];
      rows = (report.salesByBook || []).map(b => [
        `"${b.title.replace(/"/g, '""')}"`,
        `"${b.author.replace(/"/g, '""')}"`,
        b.category,
        b.units,
        b.sales
      ]);
      filename = `sales_report_books_${startDate}_to_${endDate}.csv`;
    } else {
      headers = ['Category', 'Units Sold', 'Revenue (LKR)'];
      rows = (report.salesByCategory || []).map(c => [
        c.category,
        c.units,
        c.sales
      ]);
      filename = `sales_report_categories_${startDate}_to_${endDate}.csv`;
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

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
        <div className="h-28 bg-slate-900 border border-slate-800 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-96 bg-slate-900 border border-slate-800 rounded-3xl" />
          <div className="h-96 bg-slate-900 border border-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 font-display uppercase tracking-wide">
            Sales & Analytics Reports
          </h1>
          <p className="text-xs text-slate-400">Generate, analyze, and export store sales reports</p>
        </div>
        <button 
          onClick={fetchSalesReport}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-350 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Report</span>
        </button>
      </div>

      {/* Date controls filter */}
      <div className="bg-[#0f172a] border border-slate-850 p-4 rounded-3xl flex flex-wrap gap-4 items-center">
        
        {/* Quick select dropdown */}
        <div className="space-y-1">
          <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Quick Range</label>
          <select
            onChange={handleDateChange}
            defaultValue="30days"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-350 text-xs focus:outline-none"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="custom">Custom Date Range</option>
          </select>
        </div>

        {/* Custom Date Form */}
        <form onSubmit={handleApplyCustomDates} className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-slate-950 border border-slate-850 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-bold transition-all"
          >
            Apply Custom Dates
          </button>
        </form>

      </div>

      {/* KPI Sales metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="bg-[#0f172a] border border-slate-850 p-6 rounded-3xl text-left space-y-1">
          <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Total Sales Revenue</span>
          <h3 className="text-xl font-black text-slate-100">{formatCurrency(report.totalRevenue)}</h3>
          <p className="text-[10px] text-slate-500">Invoiced items sum</p>
        </div>

        {/* Volume */}
        <div className="bg-[#0f172a] border border-slate-850 p-6 rounded-3xl text-left space-y-1">
          <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Orders Volume</span>
          <h3 className="text-xl font-black text-slate-100">{report.ordersCount}</h3>
          <p className="text-[10px] text-slate-500">{report.pendingCount} pending, {report.cancelledCount} cancelled</p>
        </div>

        {/* Average Order Value */}
        <div className="bg-[#0f172a] border border-slate-850 p-6 rounded-3xl text-left space-y-1">
          <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Avg Order Value</span>
          <h3 className="text-xl font-black text-slate-100">{formatCurrency(report.averageOrderValue)}</h3>
          <p className="text-[10px] text-slate-500">Basket value average</p>
        </div>

        {/* Cancellation Rate */}
        <div className="bg-[#0f172a] border border-slate-850 p-6 rounded-3xl text-left space-y-1">
          <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Cancellation Rate</span>
          <h3 className="text-xl font-black text-slate-100">
            {report.ordersCount > 0 
              ? ((report.cancelledCount / (report.ordersCount + report.cancelledCount)) * 100).toFixed(1) 
              : '0.0'}%
          </h3>
          <p className="text-[10px] text-slate-500">Unsuccessful order ratio</p>
        </div>
      </div>

      {/* Grid: Sales by Category & Sales by Book */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Categories Sales */}
        <div className="bg-[#0f172a] border border-slate-850 p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-200">Sales by Category</h3>
              <p className="text-[10px] text-slate-500">Category revenue shares</p>
            </div>
            <button
              onClick={() => handleExportCSV('categories')}
              title="Export Category Report"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-slate-100 transition-all inline-flex"
            >
              <FileSpreadsheet className="h-4.5 w-4.5 text-brand-400" />
            </button>
          </div>
          
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                  <th className="pb-2">Category</th>
                  <th className="pb-2 text-center">Units</th>
                  <th className="pb-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {report.salesByCategory.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-8 text-slate-500">No records found.</td>
                  </tr>
                ) : (
                  report.salesByCategory.map((c, idx) => (
                    <tr key={idx} className="border-b border-slate-850/40 hover:bg-slate-800/10">
                      <td className="py-2.5 font-bold text-slate-350">{c.category}</td>
                      <td className="py-2.5 text-center text-slate-400">{c.units}</td>
                      <td className="py-2.5 text-right font-extrabold text-brand-400">
                        {formatCurrency(c.sales)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Books Sales */}
        <div className="lg:col-span-2 bg-[#0f172a] border border-slate-850 p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-200">Product Performance</h3>
              <p className="text-[10px] text-slate-500">Detailed sales metrics by book title</p>
            </div>
            <button
              onClick={() => handleExportCSV('books')}
              title="Export Product Report"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-slate-100 transition-all inline-flex"
            >
              <FileSpreadsheet className="h-4.5 w-4.5 text-brand-400" />
            </button>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                  <th className="pb-2">Book Details</th>
                  <th className="pb-2">Category</th>
                  <th className="pb-2 text-center">Units Sold</th>
                  <th className="pb-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {report.salesByBook.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-slate-500">No records found.</td>
                  </tr>
                ) : (
                  report.salesByBook.map((b, idx) => (
                    <tr key={idx} className="border-b border-slate-850/40 hover:bg-slate-800/10">
                      <td className="py-2.5 max-w-[200px] truncate">
                        <span className="font-bold text-slate-250 block truncate">{b.title}</span>
                        <span className="text-[9px] text-slate-550 block truncate">by {b.author}</span>
                      </td>
                      <td className="py-2.5 text-slate-400">{b.category}</td>
                      <td className="py-2.5 text-center text-slate-350">{b.units}</td>
                      <td className="py-2.5 text-right font-extrabold text-emerald-400">
                        {formatCurrency(b.sales)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
