import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowLeft, Star, FileText, CheckCircle, ShieldCheck, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';
import { API_BASE_URL } from '../config';

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

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
        console.warn("Backend server offline, loading static details fallback.");
        
        // Static catalog search mock
        const mockCatalog = [
          {
            _id: "book_1",
            title: "The Alchemist",
            author: "Paulo Coelho",
            price: 1800,
            category: "Fiction",
            description: "A gorgeous fable about following your dreams. The Alchemist has established itself as a modern classic, universally admired. Constantly reminding us of the power of listening to our hearts.",
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
            description: "No matter your goals, Atomic Habits offers a proven framework for improving—every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies.",
            coverImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600",
            rating: 4.9,
            stock: 25
          },
          {
            _id: "book_3",
            title: "Educated",
            author: "Tara Westover",
            price: 2100,
            category: "Education",
            description: "An unforgettable memoir about a young girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge University.",
            coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600",
            rating: 4.7,
            stock: 8
          },
          {
            _id: "book_4",
            title: "Thinking, Fast and Slow",
            author: "Daniel Kahneman",
            price: 2900,
            category: "Business",
            description: "Daniel Kahneman, the renowned psychologist and winner of the Nobel Prize in Economics, takes us on a groundbreaking tour of the mind.",
            coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600",
            rating: 4.6,
            stock: 15
          }
        ];

        const fallbackBook = mockCatalog.find(b => b._id === id) || mockCatalog[0];
        setBook(fallbackBook);
        setRelatedBooks(mockCatalog.filter(b => b._id !== fallbackBook._id && b.category === fallbackBook.category).slice(0, 3));
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
        <div className="md:col-span-5 flex justify-center sticky top-28">
          <div 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
              transition: 'transform 0.1s ease-out',
              transformStyle: 'preserve-3d'
            }}
            className="w-72 sm:w-80 h-[450px] sm:h-[500px] rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shadow-3d-glow transform-gpu"
          >
            <img 
              src={book.coverImage} 
              alt={book.title} 
              className="w-full h-full object-cover"
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
