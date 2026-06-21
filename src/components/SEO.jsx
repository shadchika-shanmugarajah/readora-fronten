import { useEffect } from 'react';

export default function SEO({ 
  title, 
  description, 
  canonicalUrl, 
  ogImage, 
  ogType = 'website', 
  schemaMarkup 
}) {
  useEffect(() => {
    // 1. Title
    const defaultTitle = 'Readora.lk | Online Bookstore Sri Lanka';
    const finalTitle = title ? `${title} | Readora.lk` : defaultTitle;
    document.title = finalTitle;
    
    // Helper to add or update meta tag
    const updateMetaTag = (name, value, isProperty = false) => {
      if (value === undefined || value === null) return;
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (isProperty) {
          el.setAttribute('property', name);
        } else {
          el.setAttribute('name', name);
        }
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };

    // 2. Meta Description
    const defaultDesc = 'Buy English, Tamil, and Sinhala books online in Sri Lanka. Fast delivery islandwide. Explore fiction, novels, competitive exams, school books, and poetry.';
    const finalDesc = description || defaultDesc;
    updateMetaTag('description', finalDesc);

    // 3. Open Graph Tags
    updateMetaTag('og:title', finalTitle, true);
    updateMetaTag('og:description', finalDesc, true);
    updateMetaTag('og:type', ogType, true);
    updateMetaTag('og:url', canonicalUrl || window.location.href, true);
    
    const defaultOgImg = 'https://readora-backend-2.onrender.com/readaura_emblem.png'; // fallback logo
    updateMetaTag('og:image', ogImage || defaultOgImg, true);

    // 4. Twitter Card Tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', finalTitle);
    updateMetaTag('twitter:description', finalDesc);
    updateMetaTag('twitter:image', ogImage || defaultOgImg);

    // 5. Canonical Link
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalUrl || window.location.href);

    // 6. Robots Directives (Allow index for all clean pages)
    updateMetaTag('robots', 'index, follow');

    // 7. Schema.org JSON-LD injection
    let script = document.querySelector('script[type="application/ld+json"]#seo-schema');
    if (schemaMarkup) {
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.setAttribute('id', 'seo-schema');
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(schemaMarkup);
    } else if (script) {
      script.remove();
    }
  }, [title, description, canonicalUrl, ogImage, ogType, schemaMarkup]);

  return null;
}
