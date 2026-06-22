import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Tag } from 'lucide-react';
import BookCard from '../components/BookCard';
import SEO from '../components/SEO';
import { API_BASE_URL } from '../config';

const CATEGORY_INFOS = {
  'fiction': {
    name: 'Fiction',
    desc: 'Explore imaginary worlds, historical epics, and classical narratives. Our collection of fiction books contains legendary stories, dramatic novels, and translated masterpieces from around the globe.',
    metaDesc: 'Buy fiction books online in Sri Lanka. Explore historical Tamil fiction, classical novels, and modern stories at Readora.lk with island-wide delivery.'
  },
  'non-fiction': {
    name: 'Non Fiction',
    desc: 'Expand your knowledge, build new habits, and discover real-world insights. Discover our range of history essays, biographies, and self-development guides.',
    metaDesc: 'Shop non-fiction, biographies, and self-help books online in Sri Lanka. Best prices and express delivery on non-fiction books at Readora.lk.'
  },
  'kavi-poem': {
    name: 'Kavi (Poem)',
    desc: 'Delve into the beautiful art of verses, modern poems, and classic Tamil, English, and Sinhala poetry. Discover collections that touch the heart and express profound perspectives.',
    metaDesc: 'Explore unique collections of poetry (Kavi) on Readora.lk. Buy Tamil poems and classic poetry books online in Sri Lanka with express shipping.'
  },
  'children-s-books': {
    name: "Children's Books",
    desc: 'Spark imagination and curiosity in young readers. Our curated collection of children\'s storybooks, illustrations, and learning materials is perfect for kids of all ages.',
    metaDesc: 'Buy children\'s storybooks and learning guides online in Sri Lanka. Safe payment and fast delivery on kids books at Readora.lk.'
  }
};

export default function CategoryPage() {
  const { slug } = useParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    const fetchCategoryBooks = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/books/category/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setBooks(data);
          if (data.length > 0) {
            setCategoryName(data[0].category);
          } else {
            const name = slug
              .split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            setCategoryName(name);
          }
        }
      } catch (err) {
        console.error("Error fetching books by category:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryBooks();
  }, [slug]);

  const catKey = slug ? slug.toLowerCase().trim() : '';
  const customCat = CATEGORY_INFOS[catKey] || {
    name: categoryName,
    desc: `Discover excellent literature, guides, and text editions inside the ${categoryName || 'specified'} category at Readora.lk.`,
    metaDesc: `Browse and buy books online in the ${categoryName || 'specified'} category in Sri Lanka at Readora.lk with cash on delivery and fast shipping.`
  };

  const finalName = categoryName || customCat.name;

  const getSchemaMarkup = () => {
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "@id": `https://readora.lk/categories/${slug}#collection`,
          "name": `${finalName} Books`,
          "description": customCat.desc,
          "url": `https://readora.lk/categories/${slug}`
        },
        {
          "@type": "BreadcrumbList",
          "@id": `https://readora.lk/categories/${slug}#breadcrumb`,
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
              "name": "Categories",
              "item": "https://readora.lk/books"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": finalName,
              "item": `https://readora.lk/categories/${slug}`
            }
          ]
        }
      ]
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen space-y-12">
      <SEO 
        title={`${finalName} Books`}
        description={customCat.metaDesc}
        canonicalUrl={`https://readora.lk/categories/${slug}`}
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

      {/* Category header */}
      <div className="p-8 sm:p-10 rounded-3xl glass-card border border-white/5 space-y-4">
        <div>
          <h1 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-slate-100 light:text-slate-900 mt-2">
            {finalName} Literature
          </h1>
        </div>
        <p className="text-slate-400 leading-relaxed text-sm sm:text-base max-w-3xl">
          {customCat.desc}
        </p>
      </div>

      {/* Books listing */}
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-200 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-brand-400" />
            <span>Available Books ({books.length})</span>
          </h2>
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
            <Tag className="h-12 w-12 text-slate-500 mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-300">No books found</h3>
            <p className="text-xs text-slate-400 mt-1">
              Currently there are no publications listed inside this category collection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
