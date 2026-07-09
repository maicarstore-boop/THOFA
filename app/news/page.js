'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function NewsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setPosts([
        {
          id: 1,
          title: 'Welcome to THOFA Blog',
          excerpt: 'Welcome to our blog! Here we will share updates, stories, and news about our work in Africa.',
          category: 'news',
          created_at: new Date().toISOString(),
          views: 0,
          author: 'THOFA Team'
        },
        {
          id: 2,
          title: 'Clean Water Project Update',
          excerpt: 'We are making progress on our clean water project. Here is the latest update.',
          category: 'update',
          created_at: new Date().toISOString(),
          views: 0,
          author: 'THOFA Team'
        }
      ]);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-[#2c5f2d] border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium text-sm sm:text-base">Loading news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Responsive */}
      <section className="bg-gradient-to-r from-[#2c5f2d] to-[#1a3a1a] text-white py-12 sm:py-16 md:py-20 text-center px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="bg-[#ff6b35] p-2 sm:p-3 rounded-full">
              <i className="fas fa-newspaper text-xl sm:text-2xl"></i>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
            News & Stories
          </h1>
          <p className="text-sm sm:text-base md:text-lg max-w-2xl mx-auto opacity-90 px-2">
            Stay updated with the latest news, stories, and updates from our organization
          </p>
        </div>
      </section>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {posts.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-md px-4">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📰</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2">No posts found</h3>
            <p className="text-sm sm:text-base text-gray-500">Check back later for updates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {posts.map((post) => (
              <article key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(post.category)}`}>
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      <i className="far fa-clock mr-1"></i>
                      {formatDate(post.created_at)}
                    </span>
                  </div>
                  
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                    <Link href={`/news/${post.id}`} className="hover:text-[#2c5f2d] transition-colors">
                      {post.title}
                    </Link>
                  </h3>
                  
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3">
                    {post.excerpt || post.content?.substring(0, 120) + '...'}
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-gray-500">
                      <i className="fas fa-user mr-1"></i>
                      {post.author || 'THOFA Team'}
                    </span>
                    <span className="text-xs text-gray-400">
                      <i className="far fa-eye mr-1"></i>
                      {post.views || 0}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}