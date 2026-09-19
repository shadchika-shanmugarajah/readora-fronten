import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { slugify } from '../utils/slugify';

const DEFAULT_AUTHORS = [
  {
    name: 'Kalki Krishnamurthy',
    role: 'Tamil Novelist',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300',
    slug: 'kalki-krishnamurthy'
  },
  {
    name: 'Martin Wickramasinghe',
    role: 'Sinhala Literature',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=300',
    slug: 'martin-wickramasinghe'
  },
  {
    name: 'James Clear',
    role: 'Self-Improvement',
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=300',
    slug: 'james-clear'
  },
  {
    name: 'Sujatha Rangarajan',
    role: 'Tamil Sci-Fi & Fiction',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=300&h=300&q=80',
    slug: 'sujatha-rangarajan'
  },
  {
    name: 'Jayakanthan',
    role: 'Literary Icon',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=300&h=300&q=80',
    slug: 'jayakanthan'
  },
  {
    name: 'Kumaratunga Munidasa',
    role: 'Linguist & Poet',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=300&h=300&q=80',
    slug: 'kumaratunga-munidasa'
  },
  {
    name: 'George Orwell',
    role: 'Classic Dystopian',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    slug: 'george-orwell'
  }
];

export default function AuthorCarousel() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/authors`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            // Merge with defaults if few
            const combined = [...data];
            DEFAULT_AUTHORS.forEach(def => {
              if (!combined.some(a => a.name.toLowerCase() === def.name.toLowerCase())) {
                combined.push(def);
              }
            });
            setAuthors(combined);
          } else {
            setAuthors(DEFAULT_AUTHORS);
          }
        } else {
          setAuthors(DEFAULT_AUTHORS);
        }
      } catch (err) {
        console.warn('Failed to load authors, using defaults', err);
        setAuthors(DEFAULT_AUTHORS);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthors();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header with Left / Right arrows */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-100 light:text-slate-900">
            Discover Great Authors
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 mt-1">
            Explore works from celebrated and emerging writers
          </p>
        </div>

        {/* Scroll Arrow Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all shadow-md active:scale-95"
            aria-label="Previous authors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all shadow-md active:scale-95"
            aria-label="Next authors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Authors Container */}
      <div
        ref={scrollRef}
        className="flex gap-6 sm:gap-8 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col items-center shrink-0 w-28 sm:w-36 space-y-3">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-800 animate-pulse" />
              <div className="w-20 h-3 bg-slate-800 rounded animate-pulse" />
            </div>
          ))
        ) : (
          authors.map((author, index) => {
            const authorSlug = author.slug || slugify(author.name);
            return (
              <Link
                key={author._id || index}
                to={`/authors/${authorSlug}`}
                className="group flex flex-col items-center shrink-0 w-28 sm:w-36 text-center focus:outline-none"
              >
                {/* Circular Avatar Container */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-brand-600/30 via-slate-800 to-brand-500/20 group-hover:from-brand-500 group-hover:to-purple-500 transition-all duration-300 shadow-md group-hover:shadow-brand-500/20 group-hover:scale-105">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 border border-white/10 flex items-center justify-center">
                    {author.image ? (
                      <img
                        src={author.image}
                        alt={author.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';
                        }}
                      />
                    ) : (
                      <User className="h-10 w-10 text-slate-500 group-hover:text-brand-400 transition-colors" />
                    )}
                  </div>
                </div>

                {/* Author Name */}
                <span className="mt-3 text-xs sm:text-sm font-semibold text-slate-200 light:text-slate-800 group-hover:text-brand-400 transition-colors line-clamp-2 leading-snug">
                  {author.name}
                </span>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}
