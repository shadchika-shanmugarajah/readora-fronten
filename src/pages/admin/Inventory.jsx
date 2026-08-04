import React, { useState, useEffect } from 'react';
import { 
  Search, Package, ShieldAlert, Check, X, RefreshCw, 
  History, Plus, Minus, FileText, ArrowRightLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

export default function Inventory() {
  const { token } = useAuth();

  // Data State
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Table Controls
  const [search, setSearch] = useState('');
  const [stockLevelFilter, setStockLevelFilter] = useState('All'); // All, low_stock, out_of_stock, in_stock
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Stock Adjust Modal State
  const [selectedBook, setSelectedBook] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjAmount, setAdjAmount] = useState('0');
  const [adjNote, setAdjNote] = useState('');
  const [savingAdj, setSavingAdj] = useState(false);

  // Stock Log Audit Modal State
  const [logsBook, setLogsBook] = useState(null);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [logsList, setLogsList] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Fetch books catalog
  const fetchInventory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/books/admin`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setBooks(data);
      } else {
        setError('Failed to fetch inventory.');
      }
    } catch (err) {
      setError('Network error. Failed to retrieve inventory data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [token]);

  // Flash Success Msg Helper
  const flashSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Adjust Stock API Call
  const handleSaveAdjustment = async (e) => {
    e.preventDefault();
    if (adjAmount === '0' || !adjAmount.trim()) {
      alert('Adjustment amount must be a non-zero integer.');
      return;
    }

    setSavingAdj(true);
    try {
      const res = await fetch(`${API_BASE_URL}/books/${selectedBook._id}/stock`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adjustment: Number(adjAmount),
          note: adjNote.trim()
        })
      });

      if (res.ok) {
        flashSuccess(`Stock adjusted successfully for "${selectedBook.title}"`);
        setShowAdjustModal(false);
        setAdjAmount('0');
        setAdjNote('');
        fetchInventory();
      } else {
        alert('Failed to adjust stock level.');
      }
    } catch (err) {
      alert('Error updating stock on server.');
    } finally {
      setSavingAdj(false);
    }
  };

  // Fetch Stock Logs API Call
  const handleViewLogs = async (book) => {
    setLogsBook(book);
    setShowLogsModal(true);
    setLoadingLogs(true);
    try {
      const res = await fetch(`${API_BASE_URL}/books/${book._id}/stock-logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setLogsList(data);
      } else {
        setLogsList([]);
      }
    } catch (err) {
      console.error(err);
      setLogsList([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Filter Logic
  const filteredInventory = books.filter(b => {
    const matchesSearch = 
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      (b.isbn && b.isbn.includes(search));

    let matchesStock = true;
    if (stockLevelFilter === 'low_stock') matchesStock = b.stock > 0 && b.stock <= 5;
    else if (stockLevelFilter === 'out_of_stock') matchesStock = b.stock === 0;
    else if (stockLevelFilter === 'in_stock') matchesStock = b.stock > 5;

    return matchesSearch && matchesStock;
  });

  // Pagination
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const paginatedInventory = filteredInventory.slice(
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
            Inventory stock levels
          </h1>
          <p className="text-xs text-slate-400">Monitor stock levels, execute manual adjustments, and audit transaction logs</p>
        </div>
        <button 
          onClick={fetchInventory}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-350 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="bg-[#0f172a] border border-slate-850 p-4 rounded-3xl grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by title, author, ISBN..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
        </div>

        {/* Stock Level Filter */}
        <select
          value={stockLevelFilter}
          onChange={(e) => { setStockLevelFilter(e.target.value); setCurrentPage(1); }}
          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-350 text-xs focus:outline-none"
        >
          <option value="All">All Inventory Stock Levels</option>
          <option value="in_stock">Healthy Stock (&gt; 5 units)</option>
          <option value="low_stock">Low Stock Warnings (&le; 5 units)</option>
          <option value="out_of_stock">Out of Stock Warnings (0 units)</option>
        </select>

        {/* Catalog warnings count summary */}
        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider text-right pr-2 hidden sm:block">
          Total items: <span className="text-slate-200">{filteredInventory.length}</span>
        </div>

      </div>

      {/* Main Stock Table */}
      <div className="bg-[#0f172a] border border-slate-850 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-850 text-slate-500 font-bold uppercase tracking-wider">
                <th className="p-4 w-12">Cover</th>
                <th className="p-4">Book Title</th>
                <th className="p-4">Publisher</th>
                <th className="p-4">ISBN</th>
                <th className="p-4 text-center">Current Stock</th>
                <th className="p-4 text-center">Availability Status</th>
                <th className="p-4 text-right">Inventory Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-500">Loading stock records...</td>
                </tr>
              ) : paginatedInventory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-500">No products match selection filters.</td>
                </tr>
              ) : (
                paginatedInventory.map((book) => (
                  <tr key={book._id} className="border-b border-slate-850/40 hover:bg-slate-800/10 transition-colors">
                    {/* Cover image */}
                    <td className="p-4">
                      <img 
                        src={book.coverImage} 
                        alt="" 
                        className="h-10 w-8 object-cover rounded shadow-md"
                        onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600'}
                      />
                    </td>
                    {/* Details */}
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-slate-200 text-sm max-w-[280px] truncate">{book.title}</p>
                        <p className="text-[10px] text-slate-500">by {book.author}</p>
                      </div>
                    </td>
                    {/* Publisher */}
                    <td className="p-4 text-slate-400">{book.publisher || 'Not Set'}</td>
                    {/* ISBN */}
                    <td className="p-4 text-slate-400 font-mono text-[10px]">{book.isbn || 'N/A'}</td>
                    {/* Stock Value */}
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-extrabold ${
                        book.stock === 0
                          ? 'bg-rose-500/10 text-rose-450'
                          : book.stock <= 5
                          ? 'bg-amber-500/10 text-amber-450 animate-pulse'
                          : 'bg-emerald-500/10 text-emerald-450'
                      }`}>
                        {book.stock} units
                      </span>
                    </td>
                    {/* Availability Status */}
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        book.stock === 0
                          ? 'bg-rose-950 text-rose-400 border border-rose-900/40'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-900/40'
                      }`}>
                        {book.availabilityStatus || (book.stock > 0 ? 'In Stock' : 'Out of Stock')}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="p-4 text-right space-x-1.5">
                      <button
                        onClick={() => { setSelectedBook(book); setShowAdjustModal(true); }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all text-[11px]"
                      >
                        Adjust Stock
                      </button>
                      <button
                        onClick={() => handleViewLogs(book)}
                        title="View Stock Adjust Logs"
                        className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all inline-flex items-center justify-center align-middle"
                      >
                        <History className="h-3.5 w-3.5" />
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

      {/* QUICK STOCK ADJUST MODAL */}
      {showAdjustModal && selectedBook && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4 animate-scale-in">
            
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Package className="h-4.5 w-4.5 text-brand-400" />
                <span>Adjust Stock Quantity</span>
              </h3>
              <button 
                onClick={() => { setShowAdjustModal(false); setAdjAmount('0'); setAdjNote(''); }}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-450"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-350 text-xs truncate max-w-[200px]">{selectedBook.title}</p>
                <p className="text-[10px] text-slate-500">Current levels: {selectedBook.stock} units</p>
              </div>
              <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2.5 py-1 rounded">
                Rs.{selectedBook.price}
              </span>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-4 text-xs">
              
              {/* Adjustment Field */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-450 uppercase">Stock Adjustment *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    required
                    value={adjAmount}
                    onChange={(e) => setAdjAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                    placeholder="e.g. +10 or -5"
                  />
                </div>
                <p className="text-[9px] text-slate-500">Use positive number to add stock, negative number to subtract.</p>
              </div>

              {/* Note Reason Field */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-450 uppercase">Adjustment Reason / Note</label>
                <input
                  type="text"
                  value={adjNote}
                  onChange={(e) => setAdjNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                  placeholder="e.g. Supply delivery / damage writeoff"
                />
              </div>

              {/* Result Preview */}
              <div className="p-3 bg-slate-900/20 rounded-xl text-slate-400 flex justify-between font-medium">
                <span>Expected New Stock Level:</span>
                <span className="font-extrabold text-brand-400">
                  {Math.max(0, Number(selectedBook.stock || 0) + Number(adjAmount || 0))} units
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => { setShowAdjustModal(false); setAdjAmount('0'); setAdjNote(''); }}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-slate-400 font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAdj}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-all"
                >
                  {savingAdj ? 'Updating...' : 'Confirm Adjustment'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* STOCK LOGS AUDIT TRAIL MODAL */}
      {showLogsModal && logsBook && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl p-6 space-y-4 animate-scale-in max-h-[80vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-850 pb-3 shrink-0">
              <div>
                <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <History className="h-4.5 w-4.5 text-brand-400" />
                  <span>Stock Adjustment Logs</span>
                </h3>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5 truncate max-w-[400px]">Book: {logsBook.title}</p>
              </div>
              <button 
                onClick={() => { setShowLogsModal(false); setLogsList([]); setLogsBook(null); }}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-450"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Scrollable logs list */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 pr-1 min-h-[300px]">
              {loadingLogs ? (
                <p className="text-center text-slate-500 py-16 text-xs animate-pulse">Loading transaction logs...</p>
              ) : logsList.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-800 text-slate-500 rounded-2xl my-8">
                  <FileText className="h-6 w-6 mx-auto text-slate-600 mb-1" />
                  <span>No stock logs recorded for this book. Adjustments show here.</span>
                </div>
              ) : (
                logsList.map((log) => (
                  <div key={log._id} className="p-3 bg-slate-900/30 border border-slate-850/50 rounded-2xl text-xs space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                        log.actionType === 'increase'
                          ? 'bg-emerald-500/10 text-emerald-450'
                          : 'bg-rose-500/10 text-rose-450'
                      }`}>
                        {log.actionType === 'increase' ? 'Added' : 'Reduced'} {log.quantity} units
                      </span>
                      <span className="text-[9px] text-slate-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-400 text-[10px] pt-1">
                      <span>Operator: <span className="text-slate-200 font-bold">{log.operatorName}</span></span>
                      <span>Stock shift: <span className="font-mono">{log.prevStock} &rarr; {log.newStock}</span></span>
                    </div>

                    {log.note && (
                      <p className="text-[10px] bg-slate-950/30 p-1.5 rounded-lg text-slate-500 italic mt-1 font-sans">
                        &ldquo;{log.note}&rdquo;
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer close */}
            <div className="pt-3 border-t border-slate-850 shrink-0 text-right">
              <button
                onClick={() => { setShowLogsModal(false); setLogsList([]); setLogsBook(null); }}
                className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 text-xs font-bold rounded-xl"
              >
                Close Logs
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
