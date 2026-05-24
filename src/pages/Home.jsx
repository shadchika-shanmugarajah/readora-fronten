import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ChevronRight, BookOpen, Star, Compass, Zap, Layers } from 'lucide-react';
import BookCard from '../components/BookCard';
import { API_BASE_URL } from '../config';

export default function Home() {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const categories = [
    { name: 'Fiction', icon: <Compass className="h-6 w-6 text-indigo-400" />, desc: 'Novels, drama & stories' },
    { name: 'Business', icon: <Zap className="h-6 w-6 text-amber-400" />, desc: 'Strategy, growth & finance' },
    { name: 'Education', icon: <BookOpen className="h-6 w-6 text-emerald-400" />, desc: 'Academics & skills' },
    { name: 'Science', icon: <Layers className="h-6 w-6 text-rose-400" />, desc: 'Tech, physics & logs' }
  ];

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/books?featured=true`);
        if (res.ok) {
          const data = await res.json();
          setFeaturedBooks(data.slice(0, 4));
        } else {
          throw new Error();
        }
      } catch (e) {
        // Fallback for demo if backend is offline
        const mockFeatured = [
          {
            _id: "book_1",
            title: "The Alchemist",
            author: "Paulo Coelho",
            price: 1800,
            category: "Fiction",
            description: "A gorgeous fable about following your dreams.",
            coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600",
            rating: 4.8,
            stock: 12
          },
          {
            _id: "book_2",
            title: "Atomic Habits",
            author: "James Clear",
            price: 2400,
            category: "Business",
            description: "An easy & proven way to build good habits.",
            coverImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600",
            rating: 4.9,
            stock: 25
          },
          {
            _id: "book_4",
            title: "Thinking, Fast and Slow",
            author: "Daniel Kahneman",
            price: 2900,
            category: "Business",
            description: "A profound study of cognitive biases.",
            coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600",
            rating: 4.6,
            stock: 15
          }
        ];
        setFeaturedBooks(mockFeatured);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-24 min-h-screen">
      {/* 3D Styled Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/30 via-slate-950 to-slate-950" />
        
        {/* Decorative Glowing Sphere */}
        <div className="absolute top-20 right-10 md:right-32 w-72 h-72 rounded-full bg-brand-500/10 blur-[100px] animate-pulse" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          {/* Hero Left */}
          <div className="md:col-span-7 space-y-6 text-left">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-brand-300 light:bg-slate-900/5 light:border-slate-900/10 light:text-brand-600"
            >
              <Star className="h-3 w-3 fill-current text-amber-400" />
              <span>Sri Lanka's Next-Gen Bookstore</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.1] font-display"
            >
              Step into a <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-purple-400 to-indigo-400">
                Realm of Knowledge
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-slate-400 max-w-xl light:text-slate-600 leading-relaxed"
            >
              Browse premium literature, academic syllabus resources, and business bestsellers. Fast-order directly to your doorstep via WhatsApp click-to-chat.
            </motion.p>

            {/* Search Input Box */}
            <motion.form 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              onSubmit={handleSearchSubmit}
              className="relative max-w-md w-full flex items-center"
            >
              <input
                type="text"
                placeholder="Search books, authors, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-4 pl-12 rounded-2xl bg-white/5 border border-white/10 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 light:bg-white light:border-slate-300 light:text-slate-900 light:placeholder-slate-500 light:shadow-sm shadow-inner transition-all duration-300"
              />
              <Search className="absolute left-4 h-5 w-5 text-slate-400 pointer-events-none" />
              <button 
                type="submit"
                className="absolute right-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-500 active:scale-95 transition-all duration-200"
              >
                Search
              </button>
            </motion.form>
          </div>

          {/* Hero Right - 3D Animated Card Preview */}
          <div className="md:col-span-5 flex justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
              animate={{ opacity: 1, scale: 1, rotate: -5 }}
              transition={{ type: 'spring', stiffness: 80, delay: 0.2 }}
              className="relative w-64 h-[380px] rounded-2xl bg-slate-900 shadow-3d-glow border border-brand-500/30 overflow-hidden transform-gpu hover:rotate-0 hover:scale-105 transition-all duration-500"
            >
              <img 
                src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600" 
                alt="Featured Hero Cover" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex flex-col justify-end p-5">
                <span className="text-[10px] w-fit font-bold uppercase tracking-wider bg-brand-500 px-2 py-0.5 rounded text-white mb-2">Bestseller</span>
                <h4 className="text-lg font-bold text-white font-display">The Alchemist</h4>
                <p className="text-xs text-brand-300 font-medium">Paulo Coelho</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center md:text-left mb-10 space-y-2">
          <h2 className="text-2xl sm:text-4xl font-bold font-display">Select By Category</h2>
          <p className="text-sm text-slate-400 light:text-slate-600">Quickly filter catalog to match your reading mood</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <motion.div
              whileHover={{ scale: 1.04, y: -5 }}
              key={cat.name}
              onClick={() => navigate(`/books?category=${cat.name}`)}
              className="glass-card p-6 flex items-start gap-4 cursor-pointer hover:border-brand-500/40 hover:bg-white/10 shadow-md"
            >
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 light:bg-slate-900/5 light:border-slate-900/10">
                {cat.icon}
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg light:text-slate-800">{cat.name}</h3>
                <p className="text-xs text-slate-400 light:text-slate-500">{cat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Animated Book Showcase Slider */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-4xl font-bold font-display">Trending Bestsellers</h2>
            <p className="text-sm text-slate-400 light:text-slate-600">Discover reader favorites right now</p>
          </div>
          <Link to="/books" className="flex items-center gap-1 text-sm font-semibold text-brand-400 hover:text-brand-300 group">
            <span>Browse Full Catalog</span>
            <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="h-[450px] rounded-2xl border border-white/5 bg-white/5 shimmer" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredBooks.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
