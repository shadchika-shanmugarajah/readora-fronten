import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Check, X, AlertCircle, RefreshCw, User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

export default function Authors() {
  const { token } = useAuth();
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filters
  const [search, setSearch] = useState('');

  // Form Modal
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formFields, setFormFields] = useState({
    name: '',
    bio: '',
    image: ''
  });

  const fetchAuthors = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/authors`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setAuthors(data);
      } else {
        setError('Failed to fetch authors.');
      }
    } catch (err) {
      setError('Network error. Failed to load authors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
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
      bio: '',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    });
    setShowModal(true);
  };

  const openEditModal = (author) => {
    setIsEditMode(true);
    setEditingId(author._id);
    setFormFields({
      name: author.name,
      bio: author.bio || '',
      image: author.image || ''
    });
    setShowModal(true);
  };

  const handleSaveAuthor = async (e) => {
    e.preventDefault();
    if (!formFields.name.trim()) return;

    try {
      const url = isEditMode ? `${API_BASE_URL}/authors/${editingId}` : `${API_BASE_URL}/authors`;
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
        flashSuccess(isEditMode ? 'Author details updated.' : `Author "${formFields.name}" added successfully.`);
        setShowModal(false);
        fetchAuthors();
      } else {
        alert(data.message || 'Failed to save author.');
      }
    } catch (err) {
      alert('Error saving author.');
    }
  };

  const handleDeleteAuthor = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete author "${name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/authors/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        flashSuccess('Author deleted.');
        fetchAuthors();
      } else {
        alert('Failed to delete author.');
      }
    } catch (err) {
      alert('Error deleting author.');
    }
  };

  // Filter
  const filteredAuthors = authors.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.bio && a.bio.toLowerCase().includes(search.toLowerCase()))
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
            Authors Registry
          </h1>
          <p className="text-xs text-slate-400">Manage author profile biographies and profile avatars</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-650/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Author</span>
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-[#0f172a] border border-slate-850 p-4 rounded-3xl grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, biography..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
        </div>
      </div>

      {/* Authors List Table */}
      <div className="bg-[#0f172a] border border-slate-850 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-850 text-slate-500 font-bold uppercase tracking-wider">
                <th className="p-4 w-16">Profile</th>
                <th className="p-4">Name</th>
                <th className="p-4">Biography</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-slate-500">Loading authors...</td>
                </tr>
              ) : filteredAuthors.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-slate-500">No authors found.</td>
                </tr>
              ) : (
                filteredAuthors.map((a) => (
                  <tr key={a._id} className="border-b border-slate-850/40 hover:bg-slate-800/10 transition-colors">
                    {/* Image */}
                    <td className="p-4">
                      <img 
                        src={a.image} 
                        alt="" 
                        className="h-10 w-10 object-cover rounded-full border border-slate-800 shadow-md"
                        onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                      />
                    </td>
                    {/* Name */}
                    <td className="p-4 font-bold text-slate-200 text-sm">{a.name}</td>
                    {/* Bio */}
                    <td className="p-4 text-slate-400 max-w-sm truncate">{a.bio || 'No biography recorded.'}</td>
                    {/* Actions */}
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(a)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-slate-100 transition-all inline-flex"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAuthor(a._id, a.name)}
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
                {isEditMode ? 'Modify Author Profile' : 'Register New Author'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-450"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveAuthor} className="space-y-4 text-xs">
              {/* Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase">Author Name *</label>
                <input
                  type="text"
                  required
                  value={formFields.name}
                  onChange={(e) => setFormFields(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                  placeholder="e.g. Martin Wickramasinghe"
                />
              </div>

              {/* Avatar URL */}
              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase">Profile Image URL</label>
                <input
                  type="text"
                  value={formFields.image}
                  onChange={(e) => setFormFields(prev => ({ ...prev, image: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                />
              </div>

              {/* Biography */}
              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase">Biography Bio Details</label>
                <textarea
                  rows="4"
                  value={formFields.bio}
                  onChange={(e) => setFormFields(prev => ({ ...prev, bio: e.target.value }))}
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
                  Save Author
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
