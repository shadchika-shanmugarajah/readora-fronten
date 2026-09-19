import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import BookCard from '../components/BookCard';
import SEO from '../components/SEO';
import { API_BASE_URL } from '../config';

export default function PublisherPage() {
  const { slug } = useParams();
  const [publisher, setPublisher] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublisherData = async () => {
      setLoading(true);
      try {
        // Fetch publisher profile from database
        let fetchedPublisher = null;
        try {
          const pubRes = await fetch(`${API_BASE_URL}/publishers/${slug}`);
          if (pubRes.ok) {
            fetchedPublisher = await pubRes.json();
          }
        } catch (err) {
          console.warn("Could not fetch publisher profile:", err);
        }

        // Fetch books by publisher
        const booksRes = await fetch(`${API_BASE_URL}/books/publisher/${slug}`);
        let fetchedBooks = [];
        if (booksRes.ok) {
          fetchedBooks = await booksRes.json();
        }

        const inferredName = fetchedPublisher?.name || (fetchedBooks.length > 0 
          ? fetchedBooks[0].publisher 
          : slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));

        const finalPublisher = {
          name: inferredName,
          desc: fetchedPublisher?.description || `Browse publications and books published by ${inferredName} on Readora.lk.`,
          image: fetchedPublisher?.logo || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=200'
        };

        setPublisher(finalPublisher);
        setBooks(fetchedBooks);
      } catch (err) {
        console.error("Error fetching publisher data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublisherData();
  }, [slug]);

  const displayName = publisher?.name || 'Publisher';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen space-y-12">
      <SEO 
        title={`Books published by ${displayName}`}
        description={`Explore the literature catalog published by ${displayName} on Readora.lk. Find classical Tamil, Sinhala, and English editions with fast delivery across Sri Lanka.`}
        canonicalUrl={`https://readora.lk/publishers/${slug}`}
        ogImage={publisher?.image}
        ogType="website"
      />

      {/* Back link */}
      <div>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-purple-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Publishers</span>
        </Link>
      </div>

      {/* Publisher Header card */}
      <div className="p-8 sm:p-10 rounded-3xl glass-card border border-white/5 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Cover logo */}
        <div className="md:col-span-3 flex justify-center">
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden p-1.5 bg-gradient-to-tr from-purple-600 via-slate-800 to-indigo-600 shadow-3d-glow">
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 border border-white/10 flex items-center justify-center p-3">
              {publisher?.image ? (
                <img 
                  src={publisher.image} 
                  alt={displayName} 
                  className="w-full h-full object-cover rounded-full" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=200';
                  }}
                />
              ) : (
                <BookOpen className="h-16 w-16 text-slate-500" />
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="md:col-span-9 space-y-4 text-center md:text-left">
          <div>
            <span className="px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-purple-600/20 text-purple-400 border border-purple-500/30">
              Verified Publisher
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-slate-100 light:text-slate-900 mt-2">
              {displayName}
            </h1>
          </div>
          <p className="text-slate-400 leading-relaxed text-sm sm:text-base whitespace-pre-line">
            {publisher?.desc}
          </p>
        </div>
      </div>

      {/* Publications list */}
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-200 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-400" />
            <span>Publications</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse and order all {books.length} publications from {displayName}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((s) => (
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
            <BookOpen className="h-12 w-12 text-slate-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-300">No books found</h3>
            <p className="text-xs text-slate-400 mt-1">
              Currently there are no publications listed under this publishing house.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
