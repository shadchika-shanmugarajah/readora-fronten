import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowLeft, Star, FileText, CheckCircle, ShieldCheck, ChevronRight, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import BookCard from '../components/BookCard';
import { API_BASE_URL } from '../config';

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const isWishlisted = book ? isInWishlist(book._id) : false;
  const handleWishlistToggle = () => {
    if (book) toggleWishlist(book);
  };

  // 3D Tilt Cover States
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  useEffect(() => {
    const fetchBookAndRelated = async () => {
      setLoading(true);
      try {
        // Fetch current book
        const bookRes = await fetch(`${API_BASE_URL}/books/${id}`);
        if (!bookRes.ok) throw new Error("Book not found");
        const bookData = await bookRes.json();
        setBook(bookData);

        // Fetch related books of same category
        const relRes = await fetch(`${API_BASE_URL}/books?category=${encodeURIComponent(bookData.category)}`);
        if (relRes.ok) {
          const relData = await relRes.json();
          // Exclude current book
          setRelatedBooks(relData.filter(b => b._id !== id).slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching book details:", error);
        setBook(null);
        setRelatedBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookAndRelated();
  }, [id]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setRotateX(((centerY - y) / centerY) * 15);
    setRotateY(((x - centerX) / centerX) * 15);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const handleAddBag = () => {
    if (!user) {
      navigate(`/login?redirect=book/${id}`);
      return;
    }
    addToCart(book, quantity);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
        <div className="h-8 w-24 bg-white/5 shimmer rounded mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5 h-[500px] bg-white/5 shimmer rounded-2xl" />
          <div className="md:col-span-7 space-y-6">
            <div className="h-10 w-2/3 bg-white/5 shimmer rounded" />
            <div className="h-6 w-1/3 bg-white/5 shimmer rounded" />
            <div className="h-20 w-full bg-white/5 shimmer rounded" />
            <div className="h-12 w-40 bg-white/5 shimmer rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold">Book Not Found</h2>
        <Link to="/books" className="mt-4 inline-flex items-center gap-2 text-brand-400">
          <ArrowLeft className="h-4 w-4" /> Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen space-y-16">
      {/* Back to Listing */}
      <div>
        <Link 
          to="/books" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>

      {/* Book Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
        {/* Cover Preview (3D interaction) */}
        <div className="md:col-span-5 flex justify-center md:sticky md:top-28">
          <div 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
              transition: 'transform 0.1s ease-out',
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
            className="w-72 sm:w-80 h-[450px] sm:h-[500px] rounded-2xl overflow-hidden bg-slate-950/40 light:bg-slate-100/60 flex items-center justify-center border border-white/10 light:border-slate-200 shadow-3d-glow transform-gpu"
          >
            <img 
              src={book.coverImage} 
              alt={book.title} 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Specifications & Purchasing details */}
        <div className="md:col-span-7 space-y-8">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-brand-600/20 text-brand-400 border border-brand-500/30">
                {book.category}
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-purple-600/20 text-purple-400 border border-purple-500/30">
                {book.language || 'English'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-slate-100 light:text-slate-950 mt-2">
              {book.title}
            </h1>
            <p className="text-lg text-slate-400 light:text-slate-500 font-medium">
              by <span className="text-brand-400">{book.author}</span>
            </p>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="h-4.5 w-4.5 fill-current" />
                <span className="font-bold text-slate-200 light:text-slate-800">{book.rating || '4.5'}</span>
              </div>
              <span className="text-slate-600">|</span>
              <span className={`text-xs font-bold ${book.stock > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {book.stock > 0 ? `In Stock (${book.stock} left)` : 'Out of Stock'}
              </span>
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-white/5 space-y-4">
            <div className="text-3xl font-bold font-display text-slate-100 light:text-slate-950">
              {book.price.toLocaleString()} LKR
            </div>
            
            <p className="text-sm text-slate-400 light:text-slate-600 leading-relaxed">
              {book.description}
            </p>
          </div>

          {/* Specifications Table */}
          <div className="p-6 rounded-2xl glass-card border border-white/5 space-y-6">
            <h3 className="text-lg font-bold font-display text-slate-205 light:text-slate-900 border-b border-white/5 pb-3">
              Book Details & Specifications
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div className="flex justify-between border-b border-white/5 pb-2 light:border-slate-200">
                <span className="text-slate-400 light:text-slate-500">Author</span>
                <span className="font-semibold text-slate-200 light:text-slate-800">{book.author}</span>
              </div>
              
              <div className="flex justify-between border-b border-white/5 pb-2 light:border-slate-200">
                <span className="text-slate-400 light:text-slate-500">Publisher</span>
                <span className="font-semibold text-slate-200 light:text-slate-800">{book.publisher || 'Not Specified'}</span>
              </div>
              
              <div className="flex justify-between border-b border-white/5 pb-2 light:border-slate-200">
                <span className="text-slate-400 light:text-slate-500">Number of Pages</span>
                <span className="font-semibold text-slate-200 light:text-slate-800">{book.pages || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between border-b border-white/5 pb-2 light:border-slate-200">
                <span className="text-slate-400 light:text-slate-500">Language</span>
                <span className="font-semibold text-slate-200 light:text-slate-800">{book.language || 'English'}</span>
              </div>
              
              <div className="flex justify-between border-b border-white/5 pb-2 sm:border-none sm:pb-0 light:border-slate-200">
                <span className="text-slate-400 light:text-slate-500">Publication Year</span>
                <span className="font-semibold text-slate-200 light:text-slate-800">{book.publishYear || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between border-b border-white/5 pb-2 sm:border-none sm:pb-0 light:border-slate-200">
                <span className="text-slate-400 light:text-slate-500">ISBN</span>
                <span className="font-semibold text-slate-200 light:text-slate-800">{book.isbn || 'N/A'}</span>
              </div>

              <div className="flex justify-between sm:col-span-2 pt-2 border-t border-white/5 light:border-slate-200">
                <span className="text-slate-400 light:text-slate-500">Category</span>
                <span className="font-semibold text-brand-400">{book.category}</span>
              </div>

              <div className="flex justify-between sm:col-span-2 pt-2 border-t border-white/5 light:border-slate-200">
                <span className="text-slate-400 light:text-slate-500">Availability Status</span>
                <span className={`font-bold flex items-center gap-1.5 ${
                  (book.availabilityStatus || 'In Stock') === 'In Stock'
                    ? 'text-emerald-400 light:text-emerald-600'
                    : (book.availabilityStatus === 'Pre-Order')
                    ? 'text-amber-450 light:text-amber-600'
                    : 'text-rose-450 light:text-rose-600'
                }`}>
                  <span className={`h-2 w-2 rounded-full ${
                    (book.availabilityStatus || 'In Stock') === 'In Stock'
                      ? 'bg-emerald-500'
                      : (book.availabilityStatus === 'Pre-Order')
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`} />
                  {book.availabilityStatus || 'In Stock'}
                </span>
              </div>
            </div>
          </div>


          {/* Checkout controls */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Quantity Selector */}
            <div className="flex items-center rounded-xl bg-white/5 border border-white/10 p-1 light:bg-slate-200/50 light:border-slate-300">
              <button 
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-slate-400 hover:text-white transition-colors"
              >
                -
              </button>
              <span className="w-12 text-center font-bold font-display text-slate-200 light:text-slate-800">
                {quantity}
              </span>
              <button 
                onClick={() => setQuantity(prev => Math.min(book.stock || 10, prev + 1))}
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-slate-400 hover:text-white transition-colors"
              >
                +
              </button>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleAddBag}
              disabled={book.stock === 0}
              className={`w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-8 py-4.5 rounded-xl font-bold text-base transition-all ${
                book.stock === 0
                  ? 'bg-slate-800/40 text-slate-500 border border-slate-800 cursor-not-allowed'
                  : 'bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white shadow-3d-glow hover:shadow-3d-glow-hover active:scale-95'
              }`}
            >
              <ShoppingBag className="h-5 w-5" />
              <span>Add {quantity} to Bag • {(book.price * quantity).toLocaleString()} LKR</span>
            </button>

            {/* Wishlist Button */}
            <button
              onClick={handleWishlistToggle}
              className={`p-4.5 rounded-xl flex items-center justify-center border transition-all active:scale-95 shrink-0 ${
                isWishlisted 
                  ? 'bg-[#075985]/20 border-[#f59e0b] text-[#f59e0b]' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 light:bg-slate-200/50 light:border-slate-350 light:text-slate-600 light:hover:text-slate-800'
              }`}
              title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <Heart className={`h-6 w-6 ${isWishlisted ? 'fill-[#f59e0b]' : 'fill-none'}`} />
            </button>
          </div>

          {/* Secure details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-6 text-xs text-slate-400 light:text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
              <span>Direct order validation via WhatsApp</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-brand-400" />
              <span>Instant order logs tracking enabled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Books section */}
      {relatedBooks.length > 0 && (
        <section className="space-y-8 border-t border-white/5 pt-16">
          <div>
            <h2 className="text-2xl font-bold font-display text-slate-200 light:text-slate-800">
              Related Literature
            </h2>
            <p className="text-xs text-slate-400 light:text-slate-500">
              More reads in the <span className="text-brand-400 font-semibold">{book.category}</span> category
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedBooks.map((relBook) => (
              <BookCard key={relBook._id} book={relBook} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
