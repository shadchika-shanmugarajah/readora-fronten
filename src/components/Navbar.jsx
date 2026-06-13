import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag, User, Sun, Moon, BookOpen, Menu, X, Search, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { API_BASE_URL } from '../config';

export default function Navbar() {
  const { user } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [categories, setCategories] = useState([
    { name: 'Fiction' },
    { name: 'Non Fiction' },
    { name: 'Children\'s Books' },
    { name: 'Competitive Exams' },
    { name: 'School Books' },
    { name: 'Magazines' },
    { name: 'Gifts' },
    { name: 'Stationery' },
    { name: 'Kavi (Poem)' }
  ]);
  const [suggestions, setSuggestions] = useState({ books: [], authors: [], publishers: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);

  const navbarSearchRef = React.useRef(null);
  const mobileSearchRef = React.useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/categories`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCategories(data);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch dynamic categories:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const bodyClass = document.body.classList;
    if (theme === 'light') {
      bodyClass.add('light');
    } else {
      bodyClass.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Keep search input state in sync if URL search params change
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  // Fetch live autocomplete suggestions
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions({ books: [], authors: [], publishers: [] });
      setShowSuggestions(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/books/suggestions?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setShowSuggestions(
            (data.books && data.books.length > 0) ||
            (data.authors && data.authors.length > 0) ||
            (data.publishers && data.publishers.length > 0)
          );
        }
      } catch (err) {
        console.warn("Failed to fetch suggestions:", err);
      }
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        (!navbarSearchRef.current || !navbarSearchRef.current.contains(e.target)) &&
        (!mobileSearchRef.current || !mobileSearchRef.current.contains(e.target))
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/books');
    }
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Books', path: '/books' },
    { name: 'Wishlist', path: '/books?wishlist=true' },
    { name: 'About Us', path: '/about' },
    ...(user?.role === 'admin' ? [{ name: 'Admin Portal', path: '/admin' }] : []),
  ];

  const renderSuggestions = () => {
    if (!showSuggestions) return null;
    const hasBooks = suggestions.books && suggestions.books.length > 0;
    const hasAuthors = suggestions.authors && suggestions.authors.length > 0;
    const hasPublishers = suggestions.publishers && suggestions.publishers.length > 0;
    
    if (!hasBooks && !hasAuthors && !hasPublishers) return null;

    return (
      <div className="absolute top-full left-0 right-0 mt-2 z-50 glass-card bg-slate-900/95 light:bg-white/95 border border-white/10 light:border-slate-300 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md max-h-96 overflow-y-auto">
        <div className="p-3 divide-y divide-white/5 light:divide-slate-200 text-sm">
          {/* Books Section */}
          {hasBooks && (
            <div className="pb-3">
              <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-400">Books</div>
              <div className="space-y-1">
                {suggestions.books.map(b => (
                  <button
                    key={b._id}
                    type="button"
                    onClick={() => {
                      navigate(`/book/${b._id}`);
                      setShowSuggestions(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 light:hover:bg-slate-100 transition-all text-left"
                  >
                    <div className="h-10 w-8 bg-slate-800 rounded overflow-hidden shrink-0 border border-white/5 flex items-center justify-center">
                      <img src={b.coverImage} alt={b.title} className="w-full h-full object-contain" />
                    </div>
                    <div className="truncate flex-grow">
                      <div className="font-semibold text-slate-100 light:text-slate-850 truncate">{b.title}</div>
                      <div className="text-[11px] text-slate-400 light:text-slate-500">by {b.author}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Authors Section */}
          {hasAuthors && (
            <div className="py-3">
              <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-purple-400">Authors</div>
              <div className="space-y-1">
                {suggestions.authors.map(author => (
                  <button
                    key={author}
                    type="button"
                    onClick={() => {
                      navigate(`/books?search=${encodeURIComponent(author)}`);
                      setShowSuggestions(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-white/5 light:hover:bg-slate-100 transition-all text-left font-semibold text-slate-250 light:text-slate-700"
                  >
                    👤 {author}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Publishers Section */}
          {hasPublishers && (
            <div className="pt-3">
              <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">Publishers</div>
              <div className="space-y-1">
                {suggestions.publishers.map(pub => (
                  <button
                    key={pub}
                    type="button"
                    onClick={() => {
                      navigate(`/books?search=${encodeURIComponent(pub)}`);
                      setShowSuggestions(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-white/5 light:hover:bg-slate-100 transition-all text-left font-semibold text-slate-250 light:text-slate-700"
                  >
                    🏢 {pub}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24 gap-2 lg:gap-4">
          {/* Logo */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center gap-2">
              {/* Emblem Logo */}
              <div className="h-10 w-12 sm:h-14 sm:w-16 lg:h-16 lg:w-20 overflow-hidden flex items-center justify-center shrink-0">
                <img 
                  src="/readaura_emblem.png" 
                  alt="ReadAura Emblem" 
                  style={{
                    filter: 'invert(1) hue-rotate(180deg) brightness(1.2) contrast(1.2)',
                    mixBlendMode: 'screen'
                  }}
                  className="max-h-none w-full h-full object-contain"
                />
              </div>

              {/* Text Logo */}
              <div className="flex h-10 w-28 sm:h-14 sm:w-42 lg:h-16 lg:w-48 overflow-hidden flex items-center justify-center shrink-0">
                <img 
                  src="/readaura_text_logo.png" 
                  alt="ReadAura Text" 
                  style={{
                    filter: 'invert(1) hue-rotate(180deg) brightness(1.2) contrast(1.2)',
                    mixBlendMode: 'screen'
                  }}
                  className="max-h-none w-full h-full object-contain"
                />
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-6 ml-6 text-sm font-semibold shrink-0 whitespace-nowrap">
            <Link 
              to="/" 
              className={`transition-colors duration-200 ${isActive('/') ? 'text-brand-400' : 'text-slate-300 hover:text-white light:text-slate-200 light:hover:text-white'}`}
            >
              Home
            </Link>
            <Link 
              to="/books" 
              className={`transition-colors duration-200 ${isActive('/books') ? 'text-brand-400' : 'text-slate-300 hover:text-white light:text-slate-200 light:hover:text-white'}`}
            >
              Books
            </Link>
            <Link 
              to="/about" 
              className={`transition-colors duration-200 ${isActive('/about') ? 'text-brand-400' : 'text-slate-300 hover:text-white light:text-slate-200 light:hover:text-white'}`}
            >
              About Us
            </Link>
            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className={`transition-colors duration-200 ${isActive('/admin') ? 'text-brand-400' : 'text-slate-300 hover:text-white light:text-slate-200 light:hover:text-white'}`}
              >
                Admin Portal
              </Link>
            )}
          </div>

          {/* Large Centered Search Bar (Desktop) */}
          <form ref={navbarSearchRef} onSubmit={handleSearchSubmit} className="hidden md:flex flex-grow max-w-lg mx-3 lg:mx-6 relative items-center">
            <input
              type="text"
              placeholder="Search Books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-2.5 pr-12 rounded-full bg-white/5 border border-white/10 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 shadow-inner text-sm transition-all duration-300"
            />
            <button type="submit" className="absolute right-4 text-slate-400 hover:text-brand-400 transition-colors">
              <Search className="h-4.5 w-4.5" />
            </button>
            {renderSuggestions()}
          </form>

          {/* Action Buttons (Desktop) */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-6 shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:scale-110 active:scale-95 transition-all duration-200"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Account */}
            {user ? (
              <Link
                to="/profile"
                className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
              >
                <User className="h-4.5 w-4.5" />
                <span>My Profile</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
              >
                <User className="h-4.5 w-4.5" />
                <span>Account</span>
              </Link>
            )}

            {/* Wishlist */}
            <Link
              to="/books?wishlist=true"
              className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <Heart className={`h-4.5 w-4.5 text-rose-500 ${wishlistCount > 0 ? 'fill-rose-500' : 'fill-rose-500/20'}`} />
              <span>Wishlist({wishlistCount})</span>
            </Link>

            {/* Cart Bag */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-brand-600 hover:bg-brand-505 text-white font-bold text-sm transition-all shadow-md shadow-brand-600/10 active:scale-95"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              <span>Bag({cartCount})</span>
            </Link>
          </div>

          {/* Mobile Buttons */}
          <div className="flex items-center space-x-3 sm:space-x-4 md:hidden">
            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-400 hover:text-slate-100"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Mobile Cart Link */}
            <Link to="/cart" className="relative p-2 text-slate-400 hover:text-slate-100">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand-600 text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Drawer Trigger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-400 hover:text-slate-100"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Row (visible on small viewports) */}
        <div className="md:hidden pb-4 pt-1">
          <form ref={mobileSearchRef} onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
            <input
              type="text"
              placeholder="Search Books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-2.5 pr-12 rounded-full bg-white/5 border border-white/10 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 light:bg-white light:border-slate-300 light:text-slate-900 shadow-inner text-sm"
            />
            <button type="submit" className="absolute right-4 text-slate-400 hover:text-brand-400 transition-colors">
              <Search className="h-4.5 w-4.5" />
            </button>
            {renderSuggestions()}
          </form>
        </div>
      </div>

      {/* Category Navigation Sub-Bar */}
      <div className="border-t border-b border-white/5 bg-[#002738] py-3 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-start gap-2 sm:gap-4 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat, idx) => (
              <React.Fragment key={cat.name}>
                {idx > 0 && (
                  <span className="text-slate-700 select-none px-1">|</span>
                )}
                <Link
                  to={`/books?category=${encodeURIComponent(cat.name)}`}
                  className="text-xs sm:text-sm font-semibold tracking-wide text-slate-300 hover:text-[#38bdf8] transition-colors shrink-0 px-2 py-1 rounded-lg"
                >
                  {cat.name}
                </Link>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden glass-panel border-t border-white/5 px-4 pt-4 pb-6 space-y-3 transition-all duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-xl text-base font-medium transition-colors ${
                isActive(link.path)
                  ? 'bg-brand-600/10 text-brand-400'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              {link.name}
            </Link>
          ))}
          {user ? (
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 text-white font-medium text-base"
            >
              <User className="h-5 w-5" />
              <span>My Profile ({user.name})</span>
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block text-center py-2.5 rounded-xl border border-brand-500/30 text-brand-400 font-medium text-base hover:bg-brand-500/10"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
