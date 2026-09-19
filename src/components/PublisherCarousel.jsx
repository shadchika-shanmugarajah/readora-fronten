import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { slugify } from '../utils/slugify';

const DEFAULT_PUBLISHERS = [
  {
    name: 'Vikatan Publications',
    description: 'Pioneer of Tamil literature and magazines',
    logo: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300',
    slug: 'vikatan-publications'
  },
  {
    name: 'Vasagasalai Publications',
    description: 'Modern Tamil fiction & poetry publisher',
    logo: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=300',
    slug: 'vasagasalai-publications'
  },
  {
    name: 'Kizhakku Pathippagam',
    description: 'Renowned non-fiction and historical books',
    logo: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=300',
    slug: 'kizhakku-pathippagam'
  },
  {
    name: 'Sarasavi Publishers',
    description: 'Leading publisher in Sri Lanka',
    logo: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=300',
    slug: 'sarasavi-publishers'
  },
  {
    name: 'Godage International Publishers',
    description: 'Cultural, academic and literary works',
    logo: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=300',
    slug: 'godage-international-publishers'
  },
  {
    name: 'Penguin Random House',
    description: 'Global trade book publisher',
    logo: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=300',
    slug: 'penguin-random-house'
  }
];

export default function PublisherCarousel() {
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchPublishers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/publishers`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const combined = [...data];
            DEFAULT_PUBLISHERS.forEach(def => {
              if (!combined.some(p => p.name.toLowerCase() === def.name.toLowerCase())) {
                combined.push(def);
              }
            });
            setPublishers(combined);
          } else {
            setPublishers(DEFAULT_PUBLISHERS);
          }
        } else {
          setPublishers(DEFAULT_PUBLISHERS);
        }
      } catch (err) {
        console.warn('Failed to load publishers, using defaults', err);
        setPublishers(DEFAULT_PUBLISHERS);
      } finally {
        setLoading(false);
      }
    };

    fetchPublishers();
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
            Discover Great Publishers
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 mt-1">
            Browse books from renowned publishing houses
          </p>
        </div>

        {/* Scroll Arrow Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all shadow-md active:scale-95"
            aria-label="Previous publishers"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all shadow-md active:scale-95"
            aria-label="Next publishers"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Publishers Container */}
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
          publishers.map((publisher, index) => {
            const pubSlug = publisher.slug || slugify(publisher.name);
            return (
              <Link
                key={publisher._id || index}
                to={`/publishers/${pubSlug}`}
                className="group flex flex-col items-center shrink-0 w-28 sm:w-36 text-center focus:outline-none"
              >
                {/* Circular Logo Container */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-purple-600/30 via-slate-800 to-indigo-500/20 group-hover:from-purple-500 group-hover:to-pink-500 transition-all duration-300 shadow-md group-hover:shadow-purple-500/20 group-hover:scale-105">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 border border-white/10 flex items-center justify-center p-2">
                    {publisher.logo ? (
                      <img
                        src={publisher.logo}
                        alt={publisher.name}
                        className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=200';
                        }}
                      />
                    ) : (
                      <BookOpen className="h-10 w-10 text-slate-500 group-hover:text-purple-400 transition-colors" />
                    )}
                  </div>
                </div>

                {/* Publisher Name */}
                <span className="mt-3 text-xs sm:text-sm font-semibold text-slate-200 light:text-slate-800 group-hover:text-purple-400 transition-colors line-clamp-2 leading-snug">
                  {publisher.name}
                </span>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}
