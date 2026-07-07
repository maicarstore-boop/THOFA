'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchPost();
    }
  }, [params.id]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/blog/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data);
        // Update page title dynamically
        document.title = `${data.title} - THOFA Blog`;
        fetchRelatedPosts(data.category);
      } else {
        router.push('/news');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      router.push('/news');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async (category) => {
    try {
      const response = await fetch(`/api/blog?category=${category}&limit=3`);
      const data = await response.json();
      setRelatedPosts(data.filter(p => p.id !== parseInt(params.id)));
    } catch (error) {
      console.error('Error fetching related posts:', error);
    }
  };

  const openLightbox = (image) => {
    setLightboxImage(image);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      news: 'bg-blue-100 text-blue-700',
      story: 'bg-green-100 text-green-700',
      update: 'bg-yellow-100 text-yellow-700',
      announcement: 'bg-purple-100 text-purple-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#2c5f2d] border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="fas fa-newspaper text-5xl text-gray-300 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-700">Post Not Found</h2>
          <p className="text-gray-500 mt-2">The blog post you're looking for doesn't exist.</p>
          <Link href="/news" className="text-[#2c5f2d] hover:underline mt-4 inline-block">
            <i className="fas fa-arrow-left mr-2"></i> Back to News
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO Optimization */}
      <Head>
        <title>{post.title} - THOFA Blog</title>
        <meta name="description" content={post.excerpt || post.content?.substring(0, 160) || 'Read this inspiring story from THOFA.'} />
        <meta name="keywords" content={`${post.title}, THOFA, charity, Africa, ${post.category}, blog, story, news`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://thofa-charity.vercel.app/news/${post.id}`} />
        <meta property="og:title" content={`${post.title} - THOFA Blog`} />
        <meta property="og:description" content={post.excerpt || post.content?.substring(0, 160) || 'Read this inspiring story from THOFA.'} />
        <meta property="og:image" content={post.featured_image || 'https://thofa-charity.vercel.app/images/og-image.jpg'} />
        <meta property="article:published_time" content={post.created_at} />
        <meta property="article:author" content={post.author || 'THOFA Team'} />
        <meta property="article:section" content={post.category} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${post.title} - THOFA Blog`} />
        <meta name="twitter:description" content={post.excerpt || post.content?.substring(0, 160) || 'Read this inspiring story from THOFA.'} />
        <meta name="twitter:image" content={post.featured_image || 'https://thofa-charity.vercel.app/images/og-image.jpg'} />
        <meta name="twitter:label1" content="Written by" />
        <meta name="twitter:data1" content={post.author || 'THOFA Team'} />
        <meta name="twitter:label2" content="Category" />
        <meta name="twitter:data2" content={post.category} />
        
        {/* Additional SEO */}
        <link rel="canonical" href={`https://thofa-charity.vercel.app/news/${post.id}`} />
        <meta name="robots" content="index, follow" />
        <meta name="author" content={post.author || 'THOFA Team'} />
        
        {/* Structured Data / JSON-LD - Blog Post */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "headline": post.title,
              "description": post.excerpt || post.content?.substring(0, 160),
              "image": post.featured_image || 'https://thofa-charity.vercel.app/images/og-image.jpg',
              "datePublished": post.created_at,
              "dateModified": post.updated_at || post.created_at,
              "author": {
                "@type": "Person",
                "name": post.author || 'THOFA Team'
              },
              "publisher": {
                "@type": "Organization",
                "name": "THOFA Charity",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://thofa-charity.vercel.app/images/logo.png"
                }
              },
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": `https://thofa-charity.vercel.app/news/${post.id}`
              },
              "keywords": `${post.category}, THOFA, charity, Africa, ${post.title}`
            })
          }}
        />
        
        {/* Breadcrumb Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://thofa-charity.vercel.app/"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "News",
                  "item": "https://thofa-charity.vercel.app/news"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": post.title,
                  "item": `https://thofa-charity.vercel.app/news/${post.id}`
                }
              ]
            })
          }}
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Lightbox Modal */}
        {lightboxImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={closeLightbox}
          >
            <div className="relative max-w-4xl w-full">
              <button
                onClick={closeLightbox}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 text-3xl"
              >
                <i className="fas fa-times"></i>
              </button>
              <img
                src={lightboxImage}
                alt="Gallery image"
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-[#2c5f2d]">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/news" className="hover:text-[#2c5f2d]">News</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700">{post.title}</span>
          </nav>

          <article className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Featured Image */}
            {post.featured_image && (
              <div className="relative h-64 md:h-96">
                <img 
                  src={post.featured_image} 
                  alt={post.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full ${getCategoryColor(post.category)}`}>
                      {post.category}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 md:p-8">
              {/* Category & Date */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {!post.featured_image && (
                  <span className={`text-sm px-3 py-1 rounded-full ${getCategoryColor(post.category)}`}>
                    {post.category}
                  </span>
                )}
                <span className="text-sm text-gray-500">
                  <i className="far fa-calendar mr-1"></i>
                  {formatDate(post.created_at)}
                </span>
                <span className="text-sm text-gray-500">
                  <i className="far fa-eye mr-1"></i>
                  {post.views || 0} views
                </span>
                <span className="text-sm text-gray-500">
                  <i className="fas fa-user mr-1"></i>
                  {post.author || 'THOFA Team'}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                {post.title}
              </h1>

              {/* Content */}
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {post.content}
                </div>
              </div>

              {/* Video Section */}
              {post.video_url && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    <i className="fas fa-video mr-2"></i> Video
                  </h3>
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-900">
                    <iframe
                      src={post.video_url.replace('watch?v=', 'embed/')}
                      className="w-full h-full"
                      allowFullScreen
                      title="Video"
                    />
                  </div>
                </div>
              )}

              {/* Gallery Images */}
              {post.gallery_images && post.gallery_images.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    <i className="fas fa-images mr-2"></i> Gallery
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {post.gallery_images.map((image, index) => (
                      <div 
                        key={index} 
                        className="relative overflow-hidden rounded-lg cursor-pointer group aspect-square"
                        onClick={() => openLightbox(image)}
                      >
                        <img
                          src={image}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                          <i className="fas fa-search-plus text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity"></i>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-500 font-medium mr-2">Tags:</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{post.category}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">THOFA</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">Charity</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">Africa</span>
                </div>
              </div>

              {/* Share Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  <i className="fas fa-share-alt mr-2"></i> Share this story:
                </h4>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                    className="bg-[#1877f2] text-white px-4 py-2 rounded-lg hover:opacity-80 transition-opacity"
                  >
                    <i className="fab fa-facebook-f mr-2"></i> Facebook
                  </button>
                  <button 
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                    className="bg-[#1da1f2] text-white px-4 py-2 rounded-lg hover:opacity-80 transition-opacity"
                  >
                    <i className="fab fa-twitter mr-2"></i> Twitter
                  </button>
                  <button 
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(post.title + ' - ' + window.location.href)}`, '_blank')}
                    className="bg-[#25D366] text-white px-4 py-2 rounded-lg hover:opacity-80 transition-opacity"
                  >
                    <i className="fab fa-whatsapp mr-2"></i> WhatsApp
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:opacity-80 transition-opacity"
                  >
                    <i className="fas fa-link mr-2"></i> Copy Link
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* Author Box */}
          <div className="mt-8 bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-[#2c5f2d] rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {(post.author || 'THOFA')[0]}
              </div>
              <div>
                <h4 className="font-bold text-gray-800">{post.author || 'THOFA Team'}</h4>
                <p className="text-sm text-gray-500 mt-1">
                  {post.author ? 'Guest Author' : 'Official THOFA Blog'} - Sharing stories of hope and transformation across Africa.
                </p>
              </div>
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-[#2c5f2d] mb-4">
                <i className="fas fa-newspaper mr-2"></i> Related Stories
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedPosts.map((related) => (
                  <Link 
                    key={related.id} 
                    href={`/news/${related.id}`}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    <div className="relative h-40 bg-gray-200 overflow-hidden">
                      {related.featured_image ? (
                        <img 
                          src={related.featured_image} 
                          alt={related.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <i className="fas fa-newspaper text-3xl"></i>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(related.category)}`}>
                          {related.category}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-800 text-sm line-clamp-2">
                        {related.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(related.created_at)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back Button */}
          <div className="mt-6">
            <Link href="/news" className="text-[#2c5f2d] hover:underline inline-flex items-center">
              <i className="fas fa-arrow-left mr-2"></i> Back to all news
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}