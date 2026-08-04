import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Check, X, AlertCircle, RefreshCw 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

export default function Categories() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Inline forms
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        setError('Failed to fetch categories.');
      }
    } catch (err) {
      setError('Network error. Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const flashSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Add Category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setAdding(true);
    try {
      const res = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newName.trim() })
      });

      const data = await res.json();
      if (res.ok) {
        flashSuccess(`Category "${newName}" added successfully.`);
        setNewName('');
        fetchCategories();
      } else {
        alert(data.message || 'Failed to create category.');
      }
    } catch (err) {
      alert('Error connecting to backend.');
    } finally {
      setAdding(false);
    }
  };

  // Rename Category
  const handleSaveRename = async (id) => {
    if (!editName.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: editName.trim() })
      });

      const data = await res.json();
      if (res.ok) {
        flashSuccess('Category renamed successfully.');
        setEditingId(null);
        setEditName('');
        fetchCategories();
      } else {
        alert(data.message || 'Failed to rename category.');
      }
    } catch (err) {
      alert('Error updating category.');
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the category "${name}"? Books in this category might be affected.`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        flashSuccess('Category deleted successfully.');
        fetchCategories();
      } else {
        alert('Failed to delete category.');
      }
    } catch (err) {
      alert('Error deleting category.');
    }
  };

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
            Categories Management
          </h1>
          <p className="text-xs text-slate-400">Add, rename, or remove catalog categories</p>
        </div>
        <button 
          onClick={fetchCategories}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-350 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Sync</span>
        </button>
      </div>

      {/* Add category input form */}
      <form onSubmit={handleAddCategory} className="bg-[#0f172a] border border-slate-850 p-4 rounded-3xl flex gap-3 max-w-lg">
        <input
          type="text"
          placeholder="New category name (e.g. History)..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          disabled={adding}
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/50 placeholder:text-slate-600"
        />
        <button
          type="submit"
          disabled={adding || !newName.trim()}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          <span>Add</span>
        </button>
      </form>

      {/* Categories Grid Table */}
      <div className="bg-[#0f172a] border border-slate-850 rounded-3xl overflow-hidden shadow-2xl max-w-xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-850 text-slate-500 font-bold uppercase tracking-wider">
                <th className="p-4">Category Name</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="2" className="p-12 text-center text-slate-500">Loading categories...</td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="2" className="p-12 text-center text-slate-500">No categories found.</td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c._id} className="border-b border-slate-850/40 hover:bg-slate-800/10 transition-colors">
                    <td className="p-4">
                      {editingId === c._id ? (
                        <div className="flex items-center gap-2 max-w-xs">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none text-xs"
                          />
                          <button 
                            onClick={() => handleSaveRename(c._id)}
                            className="p-1 bg-emerald-950 text-emerald-400 rounded-lg hover:bg-emerald-900"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => { setEditingId(null); setEditName(''); }}
                            className="p-1 bg-rose-950 text-rose-450 rounded-lg hover:bg-rose-900"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="font-bold text-slate-200 text-sm">{c.name}</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {editingId !== c._id && (
                        <>
                          <button
                            onClick={() => { setEditingId(c._id); setEditName(c.name); }}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-slate-100 transition-all inline-flex"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(c._id, c.name)}
                            className="p-2 rounded-lg bg-rose-950 hover:bg-rose-900/60 text-rose-450 hover:text-rose-350 transition-all inline-flex"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
      </div>

    </div>
  );
}
