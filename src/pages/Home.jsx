import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ChevronRight, BookOpen, Star } from 'lucide-react';
import BookCard from '../components/BookCard';
import { API_BASE_URL } from '../config';

export default function Home() {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [bannerUrl, setBannerUrl] = useState('/bookstore_hero_banner.png');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/settings/book_store_hero_banner`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.value) {
            setBannerUrl(data.value);
            localStorage.setItem('book_store_hero_banner', data.value);
            return;
          }
        }
      } catch (err) {
        console.warn("Failed to fetch settings from API, using local storage cache", err);
      }
      
      const customBanner = localStorage.getItem('book_store_hero_banner');
      if (customBanner) {
        setBannerUrl(customBanner);
      }
    };

    fetchBanner();
  }, []);

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
        console.error("Error fetching featured books:", e);
        setFeaturedBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="space-y-20 min-h-screen">
      {/* Premium Hero Banner Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full aspect-[2.35/1] md:aspect-[3/1] rounded-3xl overflow-hidden border border-white/10 light:border-slate-200 shadow-3d-glow hover:shadow-3d-glow-hover transition-all duration-500 cursor-pointer"
          onClick={() => navigate('/books')}
        >
          <img 
            src={bannerUrl} 
            alt="ReadAura Bookstore Campaign Banner - 15% OFF ALL ORDERS" 
            className="w-full h-full object-cover transform hover:scale-[1.02] transition-transform duration-700 ease-out"
          />
        </motion.div>
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

      {/* About Us Summary Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5 pt-20 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs font-semibold text-brand-400 light:bg-brand-50/50 light:border-brand-200 light:text-brand-600">
              <BookOpen className="h-3.5 w-3.5" />
              <span>About ReadAura</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-display leading-tight text-slate-150 light:text-slate-950">
              Your Trusted Source for Global Literature
            </h2>
            <p className="text-sm sm:text-base text-slate-400 light:text-slate-650 leading-relaxed">
              At ReadAura, we connect passionate readers with high-quality books sourced globally. Whether you are seeking fiction bestsellers, competitive exam guides, academic texts, or local language books, we offer curated, affordable collections with direct-to-WhatsApp order fulfillment.
            </p>
            <div className="pt-2">
              <Link 
                to="/about" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-semibold text-sm transition-all shadow-md active:scale-95 group"
              >
                <span>Read Our Full Story</span>
                <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="glass-card p-6 border border-white/5 bg-white/5 backdrop-blur-lg rounded-2xl hover:border-brand-500/30 transition-all duration-300 light:bg-slate-900/5 light:border-slate-900/10">
              <h3 className="font-bold text-lg text-slate-200 light:text-slate-800">Global Sourcing</h3>
              <p className="text-xs text-slate-400 light:text-slate-500 mt-2 leading-relaxed">
                Directly imported curated titles from around the world at budget-friendly rates.
              </p>
            </div>
            <div className="glass-card p-6 border border-white/5 bg-white/5 backdrop-blur-lg rounded-2xl hover:border-brand-500/30 transition-all duration-300 light:bg-slate-900/5 light:border-slate-900/10">
              <h3 className="font-bold text-lg text-slate-200 light:text-slate-800">1-Click Order</h3>
              <p className="text-xs text-slate-400 light:text-slate-500 mt-2 leading-relaxed">
                Convenient checkout processing that syncs with WhatsApp for verification.
              </p>
            </div>
            <div className="glass-card p-6 border border-white/5 bg-white/5 backdrop-blur-lg rounded-2xl hover:border-brand-500/30 transition-all duration-300 light:bg-slate-900/5 light:border-slate-900/10 sm:col-span-2">
              <h3 className="font-bold text-lg text-slate-200 light:text-slate-800">24/7 Human Line</h3>
              <p className="text-xs text-slate-400 light:text-slate-500 mt-2 leading-relaxed">
                Direct communication channels to help track shipments or suggest specific books.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
