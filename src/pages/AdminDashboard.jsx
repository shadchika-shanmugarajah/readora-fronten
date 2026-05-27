import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Check, X, ShieldAlert, BarChart3, Package, Users, Tag, Image, BookOpen, ExternalLink, Save, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { API_BASE_URL } from '../config';

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const { showToast } = useCart();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('books'); // books, orders, analytics, settings
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bannerUrl, setBannerUrl] = useState(localStorage.getItem('book_store_hero_banner') || '/bookstore_hero_banner.png');

  // Form states for creating/editing book
  const [editingBookId, setEditingBookId] = useState(null); // null means creating
  const [showBookForm, setShowBookForm] = useState(false);
  const [bookFormData, setBookFormData] = useState({
    title: '',
    author: '',
    price: '',
    category: 'Fiction',
    description: '',
    coverImage: '',
    stock: 10,
    featured: false,
    language: 'English'
  });

  useEffect(() => {
    // Access validation: check if user is admin
    if (!user || user.role !== 'admin') {
      return; // Handled in render below
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch Books
        const booksRes = await fetch(`${API_BASE_URL}/books`);
        const booksData = await booksRes.json();
        setBooks(booksData);

        // Fetch Orders
        const ordersRes = await fetch(`${API_BASE_URL}/orders`, { headers });
        const ordersData = await ordersRes.json();
        setOrders(ordersData);

      } catch (err) {
        console.error("Error fetching admin data:", err);
        setBooks([]);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, token]);

  const handleBookFormSubmit = async (e) => {
    e.preventDefault();

    if (!bookFormData.title || !bookFormData.author || !bookFormData.price || !bookFormData.description) {
      showToast('Please fill all required catalog fields.', 'error');
      return;
    }

    try {
      const isEdit = !!editingBookId;
      const url = isEdit 
        ? `${API_BASE_URL}/books/${editingBookId}` 
        : `${API_BASE_URL}/books`;
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookFormData)
      });

      if (response.ok) {
        const savedBook = await response.json();
        
        if (isEdit) {
          setBooks(books.map(b => b._id === editingBookId ? savedBook : b));
          showToast('Book updated successfully!');
        } else {
          setBooks([savedBook, ...books]);
          showToast('Book added successfully!');
        }

        setShowBookForm(false);
        resetBookForm();
      } else {
        const error = await response.json();
        showToast(error.message || 'Error saving book details', 'error');
      }
    } catch (err) {
      console.error("Error saving book:", err);
      showToast('Error saving book details. Please check connection.', 'error');
    }
  };

  const handleEditBook = (book) => {
    setEditingBookId(book._id);
    setBookFormData({
      title: book.title,
      author: book.author,
      price: book.price.toString(),
      category: book.category,
      description: book.description,
      coverImage: book.coverImage || '',
      stock: book.stock,
      featured: book.featured,
      language: book.language || 'English'
    });
    setShowBookForm(true);
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setBooks(books.filter(b => b._id !== bookId));
        showToast('Book deleted successfully.');
      } else {
        showToast('Failed to delete book.', 'error');
      }
    } catch (err) {
      console.error("Error deleting book:", err);
      showToast('Failed to delete book. Please check connection.', 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        showToast(`Order status updated to ${newStatus}`);
      } else {
        showToast('Failed to update status.', 'error');
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      showToast('Failed to update status. Please check connection.', 'error');
    }
  };

  const compressImage = (base64Str, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (err) => reject(err);
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const compressedBase64 = await compressImage(reader.result, 800, 800, 0.7);
        setBookFormData(prev => ({
          ...prev,
          coverImage: compressedBase64
        }));
        showToast('Image uploaded and optimized successfully!');
      } catch (err) {
        console.error("Compression error:", err);
        showToast('Error optimizing image.', 'error');
      }
    };
    reader.onerror = () => {
      showToast('Error reading image file.', 'error');
    };
    reader.readAsDataURL(file);
  };

  const resetBookForm = () => {
    setEditingBookId(null);
    setBookFormData({
      title: '',
      author: '',
      price: '',
      category: 'Fiction',
      description: '',
      coverImage: '',
      stock: 10,
      featured: false,
      language: 'English'
    });
  };

  const handleBannerSave = (e) => {
    e.preventDefault();
    localStorage.setItem('book_store_hero_banner', bannerUrl);
    showToast('Hero banner configuration updated successfully!');
  };

  const handleBannerReset = () => {
    setBannerUrl('/bookstore_hero_banner.png');
    localStorage.setItem('book_store_hero_banner', '/bookstore_hero_banner.png');
    showToast('Hero banner reset to original default.');
  };

  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const compressedBase64 = await compressImage(reader.result, 1200, 400, 0.7);
        setBannerUrl(compressedBase64);
        showToast('Local banner image optimized and loaded!');
      } catch (err) {
        console.error("Compression error:", err);
        showToast('Error optimizing banner image.', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  // Access validation: Access Denied screen
  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center flex flex-col items-center justify-center min-h-screen">
        <ShieldAlert className="h-16 w-16 text-rose-500 mb-6 animate-bounce" />
        <h1 className="text-3xl font-bold font-display text-slate-100 light:text-slate-950">Access Denied</h1>
        <p className="text-sm text-slate-400 light:text-slate-500 mt-2 max-w-sm">
          You do not have administrative permissions to view this control room. Please sign in with an admin number.
        </p>
        <button 
          onClick={() => navigate('/login')} 
          className="mt-8 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 text-white font-bold text-sm"
        >
          Sign In as Admin
        </button>
      </div>
    );
  }

  // Dashboard Stats Calculations
  const statsSalesTotal = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.totalPrice, 0);
  const statsBooksCount = books.length;
  const statsOrdersPending = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen space-y-8">
      {/* Dashboard Top bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/5 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-100 light:text-slate-950">Admin Control Center</h1>
          <p className="text-sm text-slate-400 light:text-slate-500">Manage bookstore inventory, configure categories, and process WhatsApp customer logs.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => { resetBookForm(); setShowBookForm(true); }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Book</span>
          </button>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-white/5 gap-4">
        {[
          { id: 'books', name: 'Inventory Catalog', icon: <Package className="h-4 w-4" /> },
          { id: 'orders', name: 'WhatsApp Logged Orders', icon: <BookOpen className="h-4 w-4" /> },
          { id: 'analytics', name: 'Analytics Board', icon: <BarChart3 className="h-4 w-4" /> },
          { id: 'settings', name: 'Store Settings', icon: <Settings className="h-4 w-4" /> }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all border-b-2 ${
              activeTab === t.id
                ? 'border-brand-500 text-brand-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200 light:text-slate-600 light:hover:text-slate-900'
            }`}
          >
            {t.icon}
            <span>{t.name}</span>
          </button>
        ))}
      </div>

      {/* Book Form Overlay Modal */}
      {showBookForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-card max-w-2xl w-full p-6 border border-white/10 space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-xl font-bold font-display text-slate-100">
                {editingBookId ? 'Modify Inventory Book' : 'Introduce New Book'}
              </h3>
              <button 
                onClick={() => setShowBookForm(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookFormSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-slate-400 light:text-slate-600 text-xs font-semibold">Book Title *</label>
                  <input
                    type="text"
                    value={bookFormData.title}
                    onChange={e => setBookFormData({ ...bookFormData, title: e.target.value })}
                    placeholder="e.g. The Alchemist"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 light:bg-white light:border-slate-300 light:text-slate-900"
                  />
                </div>

                {/* Author */}
                <div className="space-y-1">
                  <label className="text-slate-400 light:text-slate-600 text-xs font-semibold">Author *</label>
                  <input
                    type="text"
                    value={bookFormData.author}
                    onChange={e => setBookFormData({ ...bookFormData, author: e.target.value })}
                    placeholder="e.g. Paulo Coelho"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 light:bg-white light:border-slate-300 light:text-slate-900"
                  />
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label className="text-slate-400 light:text-slate-600 text-xs font-semibold">Price (LKR) *</label>
                  <input
                    type="number"
                    value={bookFormData.price}
                    onChange={e => setBookFormData({ ...bookFormData, price: e.target.value })}
                    placeholder="e.g. 1800"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 light:bg-white light:border-slate-300 light:text-slate-900"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-slate-400 light:text-slate-600 text-xs font-semibold">Category *</label>
                  <select
                    value={bookFormData.category}
                    onChange={e => setBookFormData({ ...bookFormData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/50 bg-slate-900 light:bg-white light:border-slate-300 light:text-slate-900"
                  >
                    <option value="Fiction">Fiction</option>
                    <option value="Non Fiction">Non Fiction</option>
                    <option value="Children's Books">Children's Books</option>
                    <option value="Competitive Exams">Competitive Exams</option>
                    <option value="School Books">School Books</option>
                    <option value="Magazines">Magazines</option>
                    <option value="Gifts">Gifts</option>
                    <option value="Stationery">Stationery</option>
                  </select>
                </div>

                {/* Language */}
                <div className="space-y-1">
                  <label className="text-slate-400 light:text-slate-600 text-xs font-semibold">Language *</label>
                  <select
                    value={bookFormData.language || 'English'}
                    onChange={e => setBookFormData({ ...bookFormData, language: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/50 bg-slate-900 light:bg-white light:border-slate-300 light:text-slate-900"
                  >
                    <option value="English">English</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Sinhala">Sinhala</option>
                  </select>
                </div>

                {/* Cover Image */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-slate-400 light:text-slate-600 text-xs font-semibold flex items-center gap-1">
                    <Image className="h-3.5 w-3.5" />
                    <span>Cover Image (URL or Local File Upload)</span>
                  </label>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={bookFormData.coverImage}
                      onChange={e => setBookFormData({ ...bookFormData, coverImage: e.target.value })}
                      placeholder="e.g. https://images.unsplash.com/photo-..."
                      className="flex-grow px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 light:bg-white light:border-slate-300 light:text-slate-900"
                    />
                    
                    <div className="relative shrink-0">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="local-cover-upload"
                      />
                      <label
                        htmlFor="local-cover-upload"
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs cursor-pointer shadow-md hover:shadow-brand-600/10 active:scale-95 transition-all w-full sm:w-auto"
                      >
                        📁 Choose Image
                      </label>
                    </div>
                  </div>
                  
                  {bookFormData.coverImage && (
                    <div className="mt-3 flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5 max-w-lg light:bg-slate-100 light:border-slate-200">
                      <div className="h-14 w-11 bg-slate-800 light:bg-slate-200 rounded border border-white/5 light:border-slate-350 overflow-hidden shrink-0 flex items-center justify-center">
                        <img src={bookFormData.coverImage} alt="Cover Preview" className="w-full h-full object-contain" />
                      </div>
                      <div className="text-xs space-y-0.5 truncate flex-grow">
                        <p className="font-semibold text-slate-200 light:text-slate-800">Selected Image Preview</p>
                        <p className="text-slate-400 light:text-slate-500 text-[10px] truncate max-w-xs">{bookFormData.coverImage.startsWith('data:') ? 'Base64 Local Image Uploaded' : bookFormData.coverImage}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBookFormData({ ...bookFormData, coverImage: '' })}
                        className="px-2 py-1 rounded bg-white/5 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 text-xs font-bold transition-all border border-white/5 light:bg-slate-200 light:border-slate-300"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {/* Stock */}
                <div className="space-y-1">
                  <label className="text-slate-400 light:text-slate-600 text-xs font-semibold">Stock quantity</label>
                  <input
                    type="number"
                    value={bookFormData.stock}
                    onChange={e => setBookFormData({ ...bookFormData, stock: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 light:bg-white light:border-slate-300 light:text-slate-900"
                  />
                </div>

                {/* Featured checkbox */}
                <div className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={bookFormData.featured}
                    onChange={e => setBookFormData({ ...bookFormData, featured: e.target.checked })}
                    className="h-4.5 w-4.5 accent-brand-600 rounded bg-white/5 border border-white/10 focus:outline-none cursor-pointer"
                  />
                  <label htmlFor="featured" className="text-slate-300 light:text-slate-700 font-semibold cursor-pointer">
                    Feature on landing page showcase
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-slate-400 light:text-slate-600 text-xs font-semibold">Book Synopsis / Description *</label>
                <textarea
                  rows="4"
                  value={bookFormData.description}
                  onChange={e => setBookFormData({ ...bookFormData, description: e.target.value })}
                  placeholder="Enter summaries, synopsis, page count highlights..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 light:bg-white light:border-slate-300 light:text-slate-900"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowBookForm(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 font-bold hover:bg-white/5"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold flex items-center justify-center gap-1.5"
                >
                  <Save className="h-4.5 w-4.5" />
                  <span>Publish Details</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab contents */}
      {loading ? (
        <div className="space-y-6">
          <div className="h-32 bg-white/5 shimmer rounded-2xl" />
          <div className="h-80 bg-white/5 shimmer rounded-2xl" />
        </div>
      ) : activeTab === 'books' ? (
        /* Tab 1: Books Catalog Management */
        <div className="glass-card border border-white/5 light:border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-white/5 light:border-slate-200 bg-slate-900/20 font-bold text-slate-200 light:text-slate-800">
            Catalog Inventory Items ({books.length})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/5 light:border-slate-200 text-slate-400 light:text-slate-500 text-xs uppercase font-semibold">
                  <th className="p-4">Cover</th>
                  <th className="p-4">Book Title / Author</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Language</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Featured</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 light:divide-slate-200">
                {books.map(b => (
                  <tr key={b._id} className="hover:bg-white/5 light:hover:bg-slate-100/50 transition-colors">
                    {/* Cover image preview */}
                    <td className="p-4">
                      <div className="h-12 w-10 bg-slate-800 light:bg-slate-200 rounded border border-white/5 light:border-slate-350 overflow-hidden flex items-center justify-center">
                        <img src={b.coverImage} alt={b.title} className="w-full h-full object-contain" />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-200 light:text-slate-800 truncate max-w-xs">{b.title}</div>
                      <div className="text-slate-400 light:text-slate-500 text-xs font-medium">by {b.author}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-white/5 border border-white/10 text-slate-400 light:bg-slate-100 light:border-slate-200 light:text-slate-600">
                        {b.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-purple-500/10 border border-purple-500/20 text-purple-400">
                        {b.language || 'English'}
                      </span>
                    </td>
                    <td className="p-4 font-bold font-display text-slate-100 light:text-slate-800">{b.price.toLocaleString()} LKR</td>
                    <td className="p-4">
                      <span className={`font-bold ${b.stock === 0 ? 'text-rose-400' : b.stock <= 3 ? 'text-amber-400' : 'text-slate-300 light:text-slate-700'}`}>
                        {b.stock} units
                      </span>
                    </td>
                    <td className="p-4">
                      {b.featured ? (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">Featured</span>
                      ) : (
                        <span className="text-[10px] bg-slate-500/10 text-slate-400 light:text-slate-500 px-2 py-0.5 rounded border border-slate-500/20 light:border-slate-300 font-bold">Standard</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditBook(b)}
                          className="p-2 rounded bg-white/5 border border-white/10 hover:border-brand-500/50 hover:text-brand-400 transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBook(b._id)}
                          className="p-2 rounded bg-white/5 border border-white/10 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'orders' ? (
        /* Tab 2: WhatsApp Orders Tracking list */
        <div className="space-y-4">
          {orders.length > 0 ? (
            orders.map(o => (
              <div key={o._id} className="glass-card border border-white/5 light:border-slate-200 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 light:border-slate-200 pb-3 gap-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-100 light:text-slate-800 flex items-center gap-2">
                      <span>Order: {o._id.slice(-6).toUpperCase()}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        o.status === 'completed' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : o.status === 'cancelled'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {o.status}
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-500">Logged on {new Date(o.createdAt).toLocaleString()}</p>
                  </div>

                  {/* Actions for Status updates */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateOrderStatus(o._id, 'completed')}
                      disabled={o.status === 'completed'}
                      className="p-1.5 rounded-lg bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
                      title="Mark Completed"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleUpdateOrderStatus(o._id, 'cancelled')}
                      disabled={o.status === 'cancelled'}
                      className="p-1.5 rounded-lg bg-rose-600/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
                      title="Cancel Order"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Items & Customer metadata details grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  {/* Items */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-xs text-slate-400 light:text-slate-500 uppercase tracking-wider">Ordered Books</h4>
                    <div className="space-y-1.5">
                      {o.items.map((item, index) => (
                        <div key={index} className="flex justify-between font-medium">
                          <span className="text-slate-300 light:text-slate-700">{item.title}</span>
                          <span className="text-slate-400 light:text-slate-500 font-bold">x {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-white/5 light:border-slate-200 pt-2 flex justify-between font-bold text-slate-200 light:text-slate-800">
                      <span>Total Invoice</span>
                      <span className="font-display">{o.totalPrice.toLocaleString()} LKR</span>
                    </div>
                  </div>

                  {/* Customer details */}
                  <div className="space-y-2 border-l border-white/5 light:border-slate-200 pl-0 md:pl-6 text-xs leading-relaxed text-slate-300 light:text-slate-600">
                    <h4 className="font-semibold text-xs text-slate-400 light:text-slate-500 uppercase tracking-wider">Customer Metadata</h4>
                    <div className="space-y-1">
                      <div>Name: <span className="font-bold text-slate-200 light:text-slate-800">{o.customerName}</span></div>
                      <div>Phone: <span className="font-bold text-slate-200 light:text-slate-800 flex items-center gap-1">
                        {o.customerPhone}
                        <a href={`https://wa.me/${o.customerPhone.replace(/[\s+]+/g, '')}`} target="_blank" rel="noreferrer" className="text-brand-400 hover:underline">
                          <ExternalLink className="h-3 w-3 inline" />
                        </a>
                      </span></div>
                      <div>Delivery Address: <span className="font-bold text-slate-200 light:text-slate-800">{o.customerAddress}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 glass-card border border-white/5">
              <Package className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-300">No Orders Logged</h3>
              <p className="text-sm text-slate-500 mt-1">Orders processed through checkout will appear here for shipping status logs.</p>
            </div>
          )}
        </div>
      ) : activeTab === 'analytics' ? (
        /* Tab 3: Dashboard Analytics stats cards */
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="glass-card p-6 border border-white/5 light:border-slate-200 space-y-2 flex flex-col justify-between h-36">
              <div className="flex items-center justify-between text-slate-400 light:text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Sales Invoiced</span>
                <BarChart3 className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold font-display text-slate-100 light:text-slate-800">{statsSalesTotal.toLocaleString()} LKR</div>
              <div className="text-[10px] text-slate-500">Calculated from completed WhatsApp logs</div>
            </div>

            <div className="glass-card p-6 border border-white/5 light:border-slate-200 space-y-2 flex flex-col justify-between h-36">
              <div className="flex items-center justify-between text-slate-400 light:text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Catalog Inventory</span>
                <Package className="h-5 w-5 text-brand-400" />
              </div>
              <div className="text-3xl font-bold font-display text-slate-100 light:text-slate-800">{statsBooksCount} Books</div>
              <div className="text-[10px] text-slate-500">Total books registered in catalog DB</div>
            </div>

            <div className="glass-card p-6 border border-white/5 light:border-slate-200 space-y-2 flex flex-col justify-between h-36">
              <div className="flex items-center justify-between text-slate-400 light:text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Pending Shipping Logs</span>
                <Users className="h-5 w-5 text-amber-400" />
              </div>
              <div className="text-3xl font-bold font-display text-slate-100 light:text-slate-800">{statsOrdersPending} Orders</div>
              <div className="text-[10px] text-slate-500">Awaiting WhatsApp verification checkmarks</div>
            </div>
          </div>

          <div className="glass-card p-6 border border-white/5 text-center py-12">
            <p className="text-sm text-slate-400">Sales Analytics charts and graphic reports will appear once additional checkout transactions populate the database logs.</p>
          </div>
        </div>
      ) : (
        /* Tab 4: Store Settings (Hero Banner configuration) */
        <div className="glass-card border border-white/5 light:border-slate-200 p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold font-display text-slate-200 light:text-slate-800">Landing Page Hero Banner Configuration</h3>
            <p className="text-xs text-slate-400 light:text-slate-500 mt-1">Update or replace the main promotional landing page banner dynamically.</p>
          </div>

          <form onSubmit={handleBannerSave} className="space-y-6 text-sm">
            <div className="space-y-2">
              <label className="text-slate-400 light:text-slate-650 text-xs font-semibold flex items-center gap-1.5">
                <Image className="h-4 w-4" />
                <span>Banner Image (URL or Local File Upload)</span>
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={bannerUrl}
                  onChange={e => setBannerUrl(e.target.value)}
                  placeholder="Enter banner image URL..."
                  className="flex-grow px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 light:bg-white light:border-slate-300 light:text-slate-900"
                />
                
                <div className="relative shrink-0">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                    id="banner-image-upload"
                  />
                  <label
                    htmlFor="banner-image-upload"
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs cursor-pointer shadow-md hover:shadow-brand-600/10 active:scale-95 transition-all w-full sm:w-auto whitespace-nowrap"
                  >
                    📁 Upload Custom Banner
                  </label>
                </div>
              </div>
            </div>

            {/* Banner Preview */}
            <div className="space-y-2">
              <h4 className="text-slate-400 light:text-slate-655 text-xs font-semibold">Active Banner Preview</h4>
              <div className="relative w-full aspect-[3/1] rounded-2xl overflow-hidden border border-white/10 light:border-slate-200 bg-slate-900 flex items-center justify-center">
                {bannerUrl ? (
                  <img src={bannerUrl} alt="Active Banner Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-500">No Banner Loaded</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 border-t border-white/5 pt-6">
              <button
                type="button"
                onClick={handleBannerReset}
                className="px-5 py-3 rounded-xl border border-white/10 text-slate-300 font-bold hover:bg-white/5 light:border-slate-300 light:text-slate-600 light:hover:bg-slate-200"
              >
                Reset to Default
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold flex items-center gap-1.5 shadow-md hover:shadow-brand-600/10 active:scale-95"
              >
                <Save className="h-4.5 w-4.5" />
                <span>Save Configuration</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
