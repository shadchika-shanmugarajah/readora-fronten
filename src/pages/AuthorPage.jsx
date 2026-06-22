import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, BookOpen, ShieldCheck } from 'lucide-react';
import BookCard from '../components/BookCard';
import SEO from '../components/SEO';
import { API_BASE_URL } from '../config';

// Custom rich biographies for notable authors
const AUTHOR_BIOS = {
  'kalki-krishnamurthy': {
    name: 'Kalki Krishnamurthy',
    role: 'Legendary Tamil Novelist & Journalist',
    bio: 'Ramaswamy Krishnamurthy (9 September 1899 – 5 December 1954), better known by his pen name Kalki, was a pioneering Tamil writer, journalist, poet, critic, and Indian independence activist. He is widely acclaimed for his monumental historical fiction novels, including Ponniyin Selvan and Sivagamiyin Sabatham, which continue to capture the imagination of readers worldwide.',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600'
  },
  'martin-wickramasinghe': {
    name: 'Martin Wickramasinghe',
    role: 'Father of Modern Sinhala Literature',
    bio: 'Martin Wickramasinghe (29 May 1890 – 23 July 1976) was a highly respected Sri Lankan novelist and search scholar. Known as the father of modern Sinhala literature, his writings explored the life of Sri Lankan villagers, cultural transitions, and social developments. His famous works include Madol Doova and Gamperaliya.',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600'
  },
  'james-clear': {
    name: 'James Clear',
    role: 'Best-selling Author & Productivity Expert',
    bio: 'James Clear is an American author, speaker, and productivity expert. He is best known for his #1 New York Times bestseller Atomic Habits, which has sold over 15 million copies worldwide. Clear focuses on habits, decision-making, and continuous improvement, offering practical strategies to help individuals build positive behaviors and break negative ones.',
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600'
  }
};

export default function AuthorPage() {
  const { slug } = useParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorName, setAuthorName] = useState('');

  useEffect(() => {
    const fetchAuthorBooks = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/books/author/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setBooks(data);
          if (data.length > 0) {
            setAuthorName(data[0].author);
          } else {
            // Reconstruct name from slug as fallback
            const name = slug
              .split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            setAuthorName(name);
          }
        }
      } catch (err) {
        console.error("Error fetching books by author:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuthorBooks();
  }, [slug]);

  const authorKey = slug ? slug.toLowerCase().trim() : '';
  const customAuthor = AUTHOR_BIOS[authorKey] || {
    name: authorName,
    role: 'Distinguished Author',
    bio: `Discover literature and titles written by ${authorName || 'this author'}, available for fast online ordering and island-wide delivery across Sri Lanka from Readora.lk.`,
    image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600'
  };

  const finalName = authorName || customAuthor.name;

  const getSchemaMarkup = () => {
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Person",
          "@id": `https://readora.lk/authors/${slug}#person`,
          "name": finalName,
          "description": customAuthor.bio,
          "mainEntityOfPage": `https://readora.lk/authors/${slug}`,
          "jobTitle": customAuthor.role
        },
        {
          "@type": "BreadcrumbList",
          "@id": `https://readora.lk/authors/${slug}#breadcrumb`,
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
              "name": "Authors",
              "item": "https://readora.lk/books"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": finalName,
              "item": `https://readora.lk/authors/${slug}`
            }
          ]
        }
      ]
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen space-y-12">
      <SEO 
        title={`Books by ${finalName}`}
        description={`Explore the collection of books written by ${finalName} on Readora.lk. Find biographies, novels, and educational guides with express delivery in Sri Lanka.`}
        canonicalUrl={`https://readora.lk/authors/${slug}`}
        ogImage={customAuthor.image}
        ogType="profile"
        schemaMarkup={getSchemaMarkup()}
      />

      {/* Back link */}
      <div>
        <Link 
          to="/books" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>

      {/* Author Card header */}
      <div className="p-8 sm:p-10 rounded-3xl glass-card border border-white/5 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Profile icon/image */}
        <div className="md:col-span-3 flex justify-center">
          <div className="w-40 h-40 rounded-2xl overflow-hidden bg-slate-900 border border-white/10 flex items-center justify-center shadow-3d-glow">
            {customAuthor.image ? (
              <img src={customAuthor.image} alt={finalName} className="w-full h-full object-cover" />
            ) : (
              <User className="h-16 w-16 text-slate-500" />
            )}
          </div>
        </div>

        {/* Bio info */}
        <div className="md:col-span-9 space-y-4 text-center md:text-left">
          <div>
            <span className="px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-brand-600/20 text-brand-400 border border-brand-500/30">
              {customAuthor.role}
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-slate-100 light:text-slate-900 mt-2">
              {finalName}
            </h1>
          </div>
          <p className="text-slate-400 leading-relaxed text-sm sm:text-base">
            {customAuthor.bio}
          </p>
        </div>
      </div>

      {/* Author Books catalog */}
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-200 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-brand-400" />
            <span>Literature Bibliography</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse and buy all {books.length} available books by {finalName}
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
            <User className="h-12 w-12 text-slate-500 mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-300">No books found</h3>
            <p className="text-xs text-slate-400 mt-1">
              Currently there are no catalog entries listed under this writer. Check back soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
