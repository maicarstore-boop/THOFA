'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminBlog() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosts, setSelectedPosts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    fetchPosts();
  }, [router]);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog?limit=50');
      const data = await response.json();
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setPosts(posts.filter(p => p.id !== id));
        alert('Post deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.length === 0) return;
    if (!confirm(`Delete ${selectedPosts.length} selected posts?`)) return;

    try {
      for (const id of selectedPosts) {
        await fetch(`/api/blog/${id}`, { method: 'DELETE' });
      }
      setPosts(posts.filter(p => !selectedPosts.includes(p.id)));
      setSelectedPosts([]);
      alert('Selected posts deleted successfully');
    } catch (error) {
      console.error('Error deleting posts:', error);
      alert('Error deleting posts');
    }
  };

  const toggleSelect = (id) => {
    setSelectedPosts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  const filteredPosts = posts.filter(post => {
    const matchesFilter = filter === 'all' || post.status === filter;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.author?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    draft: posts.filter(p => p.status === 'draft').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#2c5f2d] border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1a3a1a] text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              <i className="fas fa-newspaper text-[#ff6b35] mr-2"></i>
              Blog Posts
            </h1>
            <p className="text-sm text-gray-300">Manage your blog posts</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-white hover:text-[#ff6b35] transition-colors text-sm">
              <i className="fas fa-arrow-left mr-1"></i> Back
            </Link>
            <Link href="/admin/blog/add" className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2">
              <i className="fas fa-plus"></i> New Post
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-bold text-[#2c5f2d]">{stats.total}</h3>
            <p className="text-sm text-gray-600">Total Posts</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-bold text-green-600">{stats.published}</h3>
            <p className="text-sm text-gray-600">
              <i className="fas fa-check-circle mr-1"></i> Published
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-bold text-yellow-600">{stats.draft}</h3>
            <p className="text-sm text-gray-600">
              <i className="fas fa-edit mr-1"></i> Draft
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'all' ? 'bg-[#2c5f2d] text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('published')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'published' ? 'bg-[#2c5f2d] text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <i className="fas fa-check-circle mr-1"></i> Published
              </button>
              <button
                onClick={() => setFilter('draft')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'draft' ? 'bg-[#2c5f2d] text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <i className="fas fa-edit mr-1"></i> Draft
              </button>
            </div>
            <div className="flex-1 relative">
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
              />
            </div>
            {selectedPosts.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <i className="fas fa-trash mr-1"></i> Delete Selected ({selectedPosts.length})
              </button>
            )}
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPosts(filteredPosts.map(p => p.id));
                        } else {
                          setSelectedPosts([]);
                        }
                      }}
                      checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
                      className="h-4 w-4 text-[#2c5f2d] focus:ring-[#2c5f2d] border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedPosts.includes(post.id)}
                        onChange={() => toggleSelect(post.id)}
                        className="h-4 w-4 text-[#2c5f2d] focus:ring-[#2c5f2d] border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {post.featured_image ? (
                            <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
                          ) : (
                            <i className="fas fa-newspaper text-gray-400"></i>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{post.title}</div>
                          <div className="text-sm text-gray-500">
                            <i className="fas fa-user mr-1"></i>
                            {post.author || 'THOFA Team'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(post.category)} flex items-center gap-1 w-fit`}>
                        <i className={`fas ${getCategoryIcon(post.category)}`}></i>
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{post.views || 0}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(post.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 w-fit ${
                        post.status === 'published' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        <i className={`fas ${post.status === 'published' ? 'fa-check-circle' : 'fa-edit'}`}></i>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {/* Edit Button */}
                        <Link
                          href={`/admin/blog/edit/${post.id}`}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </Link>
                        {/* View Button */}
                        <Link
                          href={`/news/${post.id}`}
                          target="_blank"
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="View"
                        >
                          <i className="fas fa-eye"></i>
                        </Link>
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPosts.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <div className="text-6xl mb-4">📝</div>
                      <p className="text-lg font-medium">No blog posts found</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or create a new post</p>
                      <Link href="/admin/blog/add" className="inline-block mt-4 bg-[#2c5f2d] text-white px-6 py-2 rounded-lg hover:bg-[#1a3a1a] transition-colors">
                        <i className="fas fa-plus mr-2"></i> Create New Post
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Stats */}
        {filteredPosts.length > 0 && (
          <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
            <span>
              Showing {filteredPosts.length} of {posts.length} posts
              {filter !== 'all' && ` (filtered by ${filter})`}
            </span>
            <span>
              <i className="fas fa-eye mr-1"></i>
              {filteredPosts.reduce((sum, p) => sum + (p.views || 0), 0)} total views
            </span>
          </div>
        )}
      </div>
    </div>
  );
}