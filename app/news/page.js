'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function NewsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog');
      const data = await response.json();
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
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

  const getCategoryIcon = (category) => {
    const icons = {
      news: 'fa-newspaper',
      story: 'fa-book-open',
      update: 'fa-sync-alt',
      announcement: 'fa-bullhorn'
    };
    return icons[category] || 'fa-newspaper';
  };

  const filteredPosts = filter === 'all' 
    ? posts 
    : posts.filter(p => p.category === filter);

  // Get unique categories for filter
  const categories = ['all', ...new Set(posts.map(p => p.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#2c5f2d] border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading news...</p>
          <p className="text-sm text-gray-400">Fetching the latest stories</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#2c5f2d] to-[#1a3a1a] text-white py-16 md:py-20 text-center px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-center mb-4">
            <div className="bg-[#ff6b35] p-3 rounded-full">
              <i className="fas fa-newspaper text-2xl"></i>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            News & Stories
          </h1>
          <p className="text-base md:text-lg max-w-2xl mx-auto opacity-90">
            Stay updated with the latest news, stories, and updates from our organization
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Filter Buttons */}
        {categories.length > 1 && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${
                    filter === category
                      ? 'bg-[#2c5f2d] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? (
                    <><i className="fas fa-th-list mr-1"></i> All</>
                  ) : (
                    <><i className={`fas ${getCategoryIcon(category)} mr-1`}></i> {category.charAt(0).toUpperCase() + category.slice(1)}</>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Featured Post */}
        {filteredPosts.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative h-64 lg:h-auto bg-gray-200">
                  {filteredPosts[0].featured_image ? (
                    <img 
                      src={filteredPosts[0].featured_image} 
                      alt={filteredPosts[0].title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <i className="fas fa-newspaper text-6xl"></i>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`text-xs px-3 py-1 rounded-full ${getCategoryColor(filteredPosts[0].category)}`}>
                      Featured
                    </span>
                  </div>
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs px-3 py-1 rounded-full ${getCategoryColor(filteredPosts[0].category)}`}>
                      {filteredPosts[0].category}
                    </span>
                    <span className="text-xs text-gray-500">
                      <i className="far fa-calendar mr-1"></i>
                      {formatDate(filteredPosts[0].created_at)}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                    <Link href={`/news/${filteredPosts[0].id}`} className="hover:text-[#2c5f2d] transition-colors">
                      {filteredPosts[0].title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {filteredPosts[0].excerpt || filteredPosts[0].content?.substring(0, 200) + '...'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      <i className="fas fa-user mr-1"></i>
                      {filteredPosts[0].author || 'THOFA Team'}
                    </span>
                    <Link 
                      href={`/news/${filteredPosts[0].id}`}
                      className="text-[#2c5f2d] hover:text-[#1a3a1a] font-medium"
                    >
                      Read More <i className="fas fa-arrow-right ml-1"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* News Grid */}
        {filteredPosts.length > 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.slice(1).map((post) => (
              <article key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow group">
                {/* Featured Image */}
                <Link href={`/news/${post.id}`}>
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {post.featured_image ? (
                      <img 
                        src={post.featured_image} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <i className="fas fa-newspaper text-4xl"></i>
                      </div>
                    )}
                  </div>
                </Link>
                
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(post.category)}`}>
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      <i className="far fa-clock mr-1"></i>
                      {formatDate(post.created_at)}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                    <Link href={`/news/${post.id}`} className="hover:text-[#2c5f2d] transition-colors">
                      {post.title}
                    </Link>
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.excerpt || post.content?.substring(0, 120) + '...'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      <i className="fas fa-user mr-1"></i>
                      {post.author || 'THOFA Team'}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">
                        <i className="far fa-eye mr-1"></i>
                        {post.views || 0}
                      </span>
                      <Link 
                        href={`/news/${post.id}`}
                        className="text-[#2c5f2d] hover:text-[#1a3a1a] text-sm font-medium"
                      >
                        Read <i className="fas fa-arrow-right ml-1"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : filteredPosts.length === 1 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <p className="text-gray-500">More posts coming soon. Check back later!</p>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No posts found</h3>
            <p className="text-gray-500">Try selecting a different category or check back later.</p>
          </div>
        )}

        {/* Newsletter Subscription */}
        <div className="mt-12 bg-gradient-to-r from-[#2c5f2d] to-[#1a3a1a] rounded-xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">
            <i className="fas fa-envelope mr-2"></i> Subscribe to Our Newsletter
          </h3>
          <p className="opacity-90 mb-4">Get the latest updates and stories delivered to your inbox.</p>
          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
              required
            />
            <button className="bg-[#ff6b35] hover:bg-[#e55a2b] px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap">
              <i className="fas fa-paper-plane mr-2"></i> Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}