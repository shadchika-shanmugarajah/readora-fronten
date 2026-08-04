import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Check, X, AlertCircle, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

export default function Publishers() {
  const { token } = useAuth();
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search
  const [search, setSearch] = useState('');

  // Form Modal
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formFields, setFormFields] = useState({
    name: '',
    description: '',
    logo: ''
  });

  const fetchPublishers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/publishers`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setPublishers(data);
      } else {
        setError('Failed to fetch publishers.');
      }
    } catch (err) {
      setError('Network error. Failed to load publishers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublishers();
  }, []);

  const flashSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormFields({
      name: '',
      description: '',
      logo: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=200'
    });
    setShowModal(true);
  };

  const openEditModal = (publisher) => {
    setIsEditMode(true);
    setEditingId(publisher._id);
    setFormFields({
      name: publisher.name,
      description: publisher.description || '',
      logo: publisher.logo || ''
    });
    setShowModal(true);
  };

  const handleSavePublisher = async (e) => {
    e.preventDefault();
    if (!formFields.name.trim()) return;

    try {
      const url = isEditMode ? `${API_BASE_URL}/publishers/${editingId}` : `${API_BASE_URL}/publishers`;
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formFields)
      });

      const data = await res.json();
      if (res.ok) {
        flashSuccess(isEditMode ? 'Publisher profile updated.' : `Publisher "${formFields.name}" added successfully.`);
        setShowModal(false);
        fetchPublishers();
      } else {
        alert(data.message || 'Failed to save publisher.');
      }
    } catch (err) {
      alert('Error saving publisher details.');
    }
  };

  const handleDeletePublisher = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete publisher "${name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/publishers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        flashSuccess('Publisher deleted.');
        fetchPublishers();
      } else {
        alert('Failed to delete publisher.');
      }
    } catch (err) {
      alert('Error deleting publisher.');
    }
  };

  // Filter
  const filteredPublishers = publishers.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Toast */}
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
            Publishers Directory
          </h1>
          <p className="text-xs text-slate-400">Manage publisher profiles and company branding logos</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-650/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Publisher</span>
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-[#0f172a] border border-slate-850 p-4 rounded-3xl grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by company name, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
        </div>
      </div>

      {/* Publishers List Table */}
      <div className="bg-[#0f172a] border border-slate-850 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-850 text-slate-500 font-bold uppercase tracking-wider">
                <th className="p-4 w-16">Logo</th>
                <th className="p-4">Publisher Name</th>
                <th className="p-4">Description</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-slate-500">Loading publishers...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-rose-450 font-bold bg-rose-500/5">
                    <div className="flex items-center justify-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>{error}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPublishers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-slate-500">No publishers found.</td>
                </tr>
              ) : (
                filteredPublishers.map((p) => (
                  <tr key={p._id} className="border-b border-slate-850/40 hover:bg-slate-800/10 transition-colors">
                    {/* Logo image */}
                    <td className="p-4">
                      <img 
                        src={p.logo} 
                        alt="" 
                        className="h-8 w-14 object-contain rounded bg-slate-950 p-1 border border-slate-800 shadow-md"
                        onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=200'}
                      />
                    </td>
                    {/* Name */}
                    <td className="p-4 font-bold text-slate-200 text-sm">{p.name}</td>
                    {/* Description */}
                    <td className="p-4 text-slate-400 max-w-sm truncate">{p.description || 'No info profile set.'}</td>
                    {/* Actions */}
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-slate-100 transition-all inline-flex"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePublisher(p._id, p.name)}
                        className="p-2 rounded-lg bg-rose-950 hover:bg-rose-900/60 text-rose-450 hover:text-rose-350 transition-all inline-flex"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4 animate-scale-in">
            
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">
                {isEditMode ? 'Modify Publisher Details' : 'Register New Publisher'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-450"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSavePublisher} className="space-y-4 text-xs">
              {/* Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase">Publisher / Brand Name *</label>
                <input
                  type="text"
                  required
                  value={formFields.name}
                  onChange={(e) => setFormFields(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                  placeholder="e.g. Sarasavi Publishers"
                />
              </div>

              {/* Logo URL */}
              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase">Logo Image URL</label>
                <input
                  type="text"
                  value={formFields.logo}
                  onChange={(e) => setFormFields(prev => ({ ...prev, logo: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase">Company Description / Info</label>
                <textarea
                  rows="4"
                  value={formFields.description}
                  onChange={(e) => setFormFields(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                  placeholder="Write a brief profile description..."
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-slate-400 font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-all"
                >
                  Save Publisher
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
