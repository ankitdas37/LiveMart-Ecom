import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ 
  title = "Wifo Mart - Your one-stop shop for biscuits, perfumes, electronics, and many more",
  description = "The ultimate e-commerce experience. Explore our wide variety of products delivered straight to your door.",
  image = "/favicon.ico", 
  url,   // Callers pass explicit URL; falls back to current page
  type = "website",
  jsonLd = null
}) {
  // Safe fallback: only read window.location inside component body (never as default param)
  const canonicalUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://wifo-mart-ecom.vercel.app/');
  const siteTitle = title.includes('Wifo Mart') ? title : `${title} | Wifo Mart`;

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
