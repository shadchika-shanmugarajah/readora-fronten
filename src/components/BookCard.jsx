import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function BookCard({ book }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const cardRef = useRef(null);

  // Mouse move tilt effect state
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [scale, setScale] = useState(1);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x coordinate within element
    const y = e.clientY - rect.top;  // y coordinate within element

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation (-15deg to 15deg)
    const rotX = ((centerY - y) / centerY) * 12;
    const rotY = ((x - centerX) / centerX) * 12;

    setRotateX(rotX);
    setRotateY(rotY);
    setScale(1.03);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setScale(1);
  };

  const handleAddBag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      // Redirect to login if trying to add to bag and not logged in
      navigate('/login?redirect=books');
      return;
    }
    
    addToCart(book);
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
        transition: 'transform 0.15s ease-out',
        transformStyle: 'preserve-3d'
      }}
      className="group relative flex flex-col justify-between h-[450px] p-4 glass-card shadow-3d-glow hover:shadow-3d-glow-hover transition-shadow duration-300 overflow-hidden"
    >
      {/* 3D Inner Layer - Card Content */}
      <div style={{ transform: 'translateZ(30px)' }} className="flex-1 flex flex-col">
        {/* Cover Image Container */}
        <div className="relative w-full h-56 rounded-xl overflow-hidden mb-4 bg-slate-900 flex items-center justify-center border border-white/5">
          <img 
            src={book.coverImage} 
            alt={book.title} 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {/* Overlay Actions on Hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <Link 
              to={`/book/${book._id}`}
              className="p-3 rounded-full bg-white text-slate-950 hover:bg-brand-500 hover:text-white transition-all transform hover:scale-110 active:scale-95"
              title="View Details"
            >
              <Eye className="h-5 w-5" />
            </Link>
            <button 
              onClick={handleAddBag}
              className="p-3 rounded-full bg-brand-600 text-white hover:bg-brand-500 transition-all transform hover:scale-110 active:scale-95"
              title="Add to Bag"
            >
              <ShoppingBag className="h-5 w-5" />
            </button>
          </div>
          
          {/* Category Tag */}
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-brand-600/90 text-white backdrop-blur-md">
            {book.category}
          </span>

          {/* Language Tag */}
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-slate-950/80 text-brand-400 border border-brand-500/20 backdrop-blur-md">
            {book.language || 'English'}
          </span>
        </div>

        {/* Text Metadata */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1 text-slate-100 group-hover:text-brand-400 transition-colors duration-200 light:text-slate-800">
              {book.title}
            </h3>
            <p className="text-sm text-slate-400 font-medium mt-0.5 light:text-slate-500">
              by {book.author}
            </p>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="text-xl font-bold text-slate-100 light:text-slate-950 font-display">
              {book.price.toLocaleString()} LKR
            </div>
            {book.stock <= 3 && book.stock > 0 ? (
              <span className="text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold">
                Low Stock
              </span>
            ) : book.stock === 0 ? (
              <span className="text-[10px] text-slate-400 bg-slate-500/10 border border-slate-500/20 px-2 py-0.5 rounded-full font-bold">
                Out of Stock
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Action Buttons underneath */}
      <div style={{ transform: 'translateZ(15px)' }} className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/5">
        <Link 
          to={`/book/${book._id}`}
          className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all light:text-slate-700 light:border-slate-300 light:hover:bg-slate-200"
        >
          View Details
        </Link>
        <button 
          onClick={handleAddBag}
          disabled={book.stock === 0}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
            book.stock === 0 
              ? 'bg-slate-800/40 text-slate-500 border border-slate-800 cursor-not-allowed'
              : 'bg-brand-600 hover:bg-brand-500 text-white shadow-md hover:shadow-brand-500/20'
          }`}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>Add to Bag</span>
        </button>
      </div>
    </div>
  );
}
