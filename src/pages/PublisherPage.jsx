import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, ShieldCheck } from 'lucide-react';
import BookCard from '../components/BookCard';
import SEO from '../components/SEO';
import { API_BASE_URL } from '../config';

const PUBLISHER_DETAILS = {
  'vikatan-publications': {
    name: 'Vikatan Publications',
    desc: 'Vikatan Publications is one of the most prominent Tamil book publishers, division of the legendary Vikatan Media Group. Established in Chennai, India, it is highly regarded for printing classical novels, historical fiction, contemporary essays, and poetry from elite Tamil writers.',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600'
  },
  'vasagasalai-publications': {
    name: 'வாசகசாலை பதிப்பகம் (Vasagasalai Publications)',
    desc: 'Vasagasalai Publications is a prominent independent publisher focusing on modern Tamil literature, poetry collections (Kavi), and translations. It serves as a creative hub for new age writers and classical literature enthusiasts.',
    image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=600'
  }
};

export default function PublisherPage() {
  const { slug } = useParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publisherName, setPublisherName] = useState('');

  useEffect(() => {
    const fetchPublisherBooks = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/books/publisher/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setBooks(data);
          if (data.length > 0) {
            setPublisherName(data[0].publisher);
          } else {
            const name = slug
              .split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            setPublisherName(name);
          }
        }
      } catch (err) {
        console.error("Error fetching books by publisher:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublisherBooks();
  }, [slug]);

  const publisherKey = slug ? slug.toLowerCase().trim() : '';
  const customPub = PUBLISHER_DETAILS[publisherKey] || {
    name: publisherName,
    desc: `Browse the extensive collection of books and novels published by ${publisherName || 'this publisher'}, available online for quick delivery in Sri Lanka at Readora.lk.`,
    image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600'
  };

  const finalName = publisherName || customPub.name;

  const getSchemaMarkup = () => {
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `https://readora.lk/publishers/${slug}#publisher`,
          "name": finalName,
          "description": customPub.desc,
          "logo": customPub.image
        },
        {
          "@type": "BreadcrumbList",
          "@id": `https://readora.lk/publishers/${slug}#breadcrumb`,
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
              "name": "Publishers",
              "item": "https://readora.lk/books"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": finalName,
              "item": `https://readora.lk/publishers/${slug}`
            }
          ]
        }
      ]
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen space-y-12">
      <SEO 
        title={`Books published by ${finalName}`}
        description={`Explore the literature catalog published by ${finalName} on Readora.lk. Find classical Tamil, Sinhala, and English editions with fast delivery across Sri Lanka.`}
        canonicalUrl={`https://readora.lk/publishers/${slug}`}
        ogImage={customPub.image}
        ogType="website"
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

      {/* Publisher Header card */}
      <div className="p-8 sm:p-10 rounded-3xl glass-card border border-white/5 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Cover logo */}
        <div className="md:col-span-3 flex justify-center">
          <div className="w-40 h-40 rounded-2xl overflow-hidden bg-slate-900 border border-white/10 flex items-center justify-center shadow-3d-glow">
            {customPub.image ? (
              <img src={customPub.image} alt={finalName} className="w-full h-full object-cover" />
            ) : (
              <BookOpen className="h-16 w-16 text-slate-500" />
            )}
          </div>
        </div>

        {/* Info */}
        <div className="md:col-span-9 space-y-4 text-center md:text-left">
          <div>
            <span className="px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-purple-600/20 text-purple-400 border border-purple-500/30">
              Verified Publisher
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-slate-100 light:text-slate-900 mt-2">
              {finalName}
            </h1>
          </div>
          <p className="text-slate-400 leading-relaxed text-sm sm:text-base">
            {customPub.desc}
          </p>
        </div>
      </div>

      {/* Publications list */}
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-200 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-brand-400" />
            <span>Published Publications</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse and order all {books.length} publications from {finalName}
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
            <BookOpen className="h-12 w-12 text-slate-500 mb-4 animate-bounce" />
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
