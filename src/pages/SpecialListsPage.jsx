import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Star, Tag, Sparkles, TrendingUp } from 'lucide-react';
import BookCard from '../components/BookCard';
import SEO from '../components/SEO';
import { API_BASE_URL } from '../config';

const PAGE_CONFIGS = {
  'offers': {
    title: 'Special Deals & Offers',
    badge: 'Special Deals',
    icon: <Tag className="h-4.5 w-4.5 text-amber-400" />,
    tagline: 'Get exclusive discounts and excellent value on premium books in Sri Lanka.',
    metaDesc: 'Explore active special offers and discounted books on Readora.lk. Fast shipping and payment on delivery across Sri Lanka.',
    seoTitle: 'Special Book Deals & Offers'
  },
  'new-releases': {
    title: 'New Arrivals & Releases',
    badge: 'New Releases',
    icon: <Sparkles className="h-4.5 w-4.5 text-brand-400" />,
    tagline: 'Browse the latest publications added to our bookstore. Fresh literature in Tamil, English, and Sinhala.',
    metaDesc: 'Shop latest released books online in Sri Lanka. Fresh arrivals in fiction, non-fiction, school guides, and poetry at Readora.lk.',
    seoTitle: 'New Released Books & Arrivals'
  },
  'best-selling': {
    title: 'Best Selling Books',
    badge: 'Bestsellers',
    icon: <TrendingUp className="h-4.5 w-4.5 text-purple-400" />,
    tagline: 'Our most popular and highest rated literature pieces. Checked and loved by book readers across Sri Lanka.',
    metaDesc: 'Explore best-selling books in Sri Lanka. The highest rated and most popular novels, educational guides, and poetry at Readora.lk.',
    seoTitle: 'Best Selling Novels & Books'
  }
};

export default function SpecialListsPage({ type }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const config = PAGE_CONFIGS[type] || PAGE_CONFIGS['new-releases'];

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/books`);
        if (res.ok) {
          let data = await res.json();
          
          // Sort or filter based on list type
          if (type === 'offers') {
            // Mocking offers by choosing higher rating books or featured books
            data = data.filter(b => b.rating >= 4.7);
          } else if (type === 'new-releases') {
            // Sort by createdAt descending
            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          } else if (type === 'best-selling') {
            // Sort by rating descending
            data.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
          }
          
          setBooks(data.slice(0, 12)); // limit to 12 items for this showcase page
        }
      } catch (err) {
        console.error("Error fetching special collection:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [type]);

  const getSchemaMarkup = () => {
    const pageUrl = `https://readora.lk/${type}`;
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "@id": `${pageUrl}#collection`,
          "name": config.title,
          "description": config.tagline,
          "url": pageUrl
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${pageUrl}#breadcrumb`,
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://readora.lk"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": config.title,
              "item": pageUrl
            }
          ]
        }
      ]
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen space-y-12">
      <SEO 
        title={config.seoTitle}
        description={config.metaDesc}
        canonicalUrl={`https://readora.lk/${type}`}
        ogType="website"
        schemaMarkup={getSchemaMarkup()}
      />

      {/* Back button */}
      <div>
        <Link 
          to="/books" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>

      {/* Page Header */}
      <div className="p-8 sm:p-10 rounded-3xl glass-card border border-white/5 space-y-4">
        <div>
          <span className="px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-brand-600/20 text-brand-400 border border-brand-500/30 inline-flex items-center gap-1.5">
            {config.icon}
            <span>{config.badge}</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-slate-100 light:text-slate-900 mt-2">
            {config.title}
          </h1>
        </div>
        <p className="text-slate-400 leading-relaxed text-sm sm:text-base max-w-3xl">
          {config.tagline}
        </p>
      </div>

      {/* Grid listing */}
      <div className="space-y-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div key={s} className="h-[450px] rounded-2xl border border-white/5 bg-white/5 shimmer" />
            ))}
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {books.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 glass-card p-10 flex flex-col items-center justify-center border border-white/5">
            <Star className="h-12 w-12 text-slate-500 mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-300">No books found</h3>
            <p className="text-xs text-slate-400 mt-1">
              Currently there are no catalog items matching this special collection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
