import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, SlidersHorizontal, BookOpen } from 'lucide-react';
import BookCard from '../components/BookCard';
import { API_BASE_URL } from '../config';

export default function Books() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search, Category and Language state synchronized with URL search params
  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || 'All';
  const selectedLanguage = searchParams.get('language') || 'All';
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const categories = ['All', 'Fiction', 'Business', 'Education', 'Science'];
  const languages = [
    { code: 'All', label: 'Shop All' },
    { code: 'Tamil', label: 'Tamil' },
    { code: 'English', label: 'English' },
    { code: 'Sinhala', label: 'Sinhala' }
  ];

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        let url = `${API_BASE_URL}/books`;
        const params = [];
        if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);
        if (selectedCategory && selectedCategory !== 'All') params.push(`category=${encodeURIComponent(selectedCategory)}`);
        if (selectedLanguage && selectedLanguage !== 'All') params.push(`language=${encodeURIComponent(selectedLanguage)}`);
        
        if (params.length) {
          url += `?${params.join('&')}`;
        }

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setBooks(data);
        } else {
          throw new Error();
        }
      } catch (error) {
        console.warn("Backend server offline, using static mock catalog filtered offline.");
        // Static Mock data fallback
        const mockCatalog = [
          {
            _id: "book_1",
            title: "The Alchemist",
            author: "Paulo Coelho",
            price: 1800,
            category: "Fiction",
            description: "A gorgeous fable about following your dreams. The Alchemist has established itself as a modern classic, universally admired.",
            coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600",
            rating: 4.8,
            stock: 12,
            language: "English"
          },
          {
            _id: "book_2",
            title: "Atomic Habits",
            author: "James Clear",
            price: 2400,
            category: "Business",
            description: "No matter your goals, Atomic Habits offers a proven framework for improving—every day.",
            coverImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600",
            rating: 4.9,
            stock: 25,
            language: "English"
          },
          {
            _id: "book_3",
            title: "Educated",
            author: "Tara Westover",
            price: 2100,
            category: "Education",
            description: "An unforgettable memoir about a young girl who, kept out of school, leaves her survivalist family.",
            coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600",
            rating: 4.7,
            stock: 8,
            language: "English"
          },
          {
            _id: "book_4",
            title: "Thinking, Fast and Slow",
            author: "Daniel Kahneman",
            price: 2900,
            category: "Business",
            description: "Daniel Kahneman, the renowned psychologist, takes us on a groundbreaking tour of the mind.",
            coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600",
            rating: 4.6,
            stock: 15,
            language: "English"
          },
          {
            _id: "book_5",
            title: "Ponniyin Selvan (Tamil)",
            author: "Kalki Krishnamurthy",
            price: 1500,
            category: "Fiction",
            description: "Ponniyin Selvan is a historic Tamil historical fiction novel by Kalki Krishnamurthy.",
            coverImage: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=600",
            rating: 4.9,
            stock: 12,
            language: "Tamil"
          },
          {
            _id: "book_6",
            title: "Madol Doova (Sinhala)",
            author: "Martin Wickramasinghe",
            price: 850,
            category: "Fiction",
            description: "Madol Doova is a children's novel written by Martin Wickramasinghe.",
            coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600",
            rating: 4.7,
            stock: 15,
            language: "Sinhala"
          }
        ];

        // Filter locally
        let filtered = [...mockCatalog];
        if (selectedCategory && selectedCategory !== 'All') {
          filtered = filtered.filter(b => b.category.toLowerCase() === selectedCategory.toLowerCase());
        }
        if (selectedLanguage && selectedLanguage !== 'All') {
          filtered = filtered.filter(b => b.language && b.language.toLowerCase() === selectedLanguage.toLowerCase());
        }
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(b => 
            b.title.toLowerCase().includes(q) || 
            b.author.toLowerCase().includes(q)
          );
        }
        setBooks(filtered);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [searchQuery, selectedCategory, selectedLanguage]);

  const handleCategoryChange = (category) => {
    const params = new URLSearchParams(searchParams);
    if (category === 'All') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    setSearchParams(params);
  };

  const handleLanguageChange = (lang) => {
    const params = new URLSearchParams(searchParams);
    if (lang === 'All') {
      params.delete('language');
    } else {
      params.set('language', lang);
    }
    setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (localSearch.trim()) {
      params.set('search', localSearch.trim());
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300 light:from-slate-800 light:to-slate-900">
            Literature Catalogue
          </h1>
          <p className="text-sm text-slate-400 light:text-slate-500 mt-1">
            Showing {books.length} premium books available for fast ordering
          </p>
        </div>

        {/* Live Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search catalog..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 light:bg-white light:border-slate-300 light:text-slate-900"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        </form>
      </div>

      {/* Language Selector Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {languages.map((lang) => {
          const isActive = selectedLanguage === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 transform active:scale-95 border ${
                isActive
                  ? 'bg-[#1b2a4a] text-[#facc15] border-[#facc15] font-bold shadow-md shadow-brand-500/10 light:bg-[#1d2d50] light:text-[#ffd700] light:border-transparent'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white light:bg-white light:text-[#1d2d50] light:border-[#1d2d50] light:hover:bg-[#1d2d50]/10 shadow-sm'
              }`}
            >
              {lang.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Filter Menu */}
        <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-28">
          <div className="glass-card p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-4 font-semibold text-slate-200 light:text-slate-800 border-b border-white/5 pb-3">
              <Filter className="h-4 w-4 text-brand-400" />
              <span>Browse Categories</span>
            </div>
            
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto no-scrollbar lg:overflow-visible py-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 hover:bg-white/5 hover:translate-x-1 ${
                    selectedCategory === cat
                      ? 'bg-brand-600 text-white font-bold hover:bg-brand-500 shadow-md shadow-brand-600/10'
                      : 'text-slate-400 hover:text-slate-200 light:text-slate-600 light:hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Books Catalog Grid */}
        <div className="lg:col-span-9">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <div key={s} className="h-[450px] rounded-2xl border border-white/5 bg-white/5 shimmer" />
              ))}
            </div>
          ) : books.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {books.map((book) => (
                  <motion.div
                    key={book._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <BookCard book={book} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="text-center py-20 glass-card p-10 flex flex-col items-center justify-center border border-white/5">
              <BookOpen className="h-16 w-16 text-slate-500 mb-4 animate-bounce" />
              <h3 className="text-xl font-bold text-slate-300 light:text-slate-800">No books found</h3>
              <p className="text-sm text-slate-400 light:text-slate-500 mt-1 max-w-sm">
                We couldn't find matches for "{searchQuery}". Try selecting another category or typing different keywords.
              </p>
              <button 
                onClick={() => setSearchParams({})} 
                className="mt-6 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
