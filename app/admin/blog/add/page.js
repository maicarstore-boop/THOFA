'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AddBlogPost() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'news',
    status: 'published',
    author: '',
    video_url: ''
  });
  
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCoverSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGallerySelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImages = [...galleryImages, ...files];
      setGalleryImages(newImages);
      
      const newPreviews = [];
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target.result);
          if (newPreviews.length === files.length) {
            setGalleryPreviews([...galleryPreviews, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeCover = () => {
    setCoverImage(null);
    setCoverPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeGalleryImage = (index) => {
    const newImages = galleryImages.filter((_, i) => i !== index);
    const newPreviews = galleryPreviews.filter((_, i) => i !== index);
    setGalleryImages(newImages);
    setGalleryPreviews(newPreviews);
  };

  const uploadToCloudinary = async (file, folder = 'thofa_charity/blog') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Upload failed');
    }
    return data.url;
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return '';
  };

  const videoEmbedUrl = getYouTubeEmbedUrl(formData.video_url);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploading(true);
    setError('');
    setSuccess(false);

    try {
      let coverImageUrl = '';
      if (coverImage) {
        coverImageUrl = await uploadToCloudinary(coverImage, 'thofa_charity/blog/covers');
      }

      const galleryUrls = [];
      for (const image of galleryImages) {
        const url = await uploadToCloudinary(image, 'thofa_charity/blog/gallery');
        galleryUrls.push(url);
      }

      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt?.trim() || '',
        category: formData.category,
        status: formData.status,
        author: formData.author?.trim() || 'Admin',
        featured_image: coverImageUrl || '',
        video_url: formData.video_url?.trim() || '',
        gallery_images: galleryUrls
      };

      console.log('Sending post data:', postData);

      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({
          title: '',
          content: '',
          excerpt: '',
          category: 'news',
          status: 'published',
          author: '',
          video_url: ''
        });
        setCoverImage(null);
        setCoverPreview(null);
        setGalleryImages([]);
        setGalleryPreviews([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (galleryInputRef.current) galleryInputRef.current.value = '';
        
        setTimeout(() => {
          router.push('/admin/blog');
        }, 2000);
      } else {
        setError(data.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setError(error.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1a3a1a] text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              <i className="fas fa-plus-circle text-[#ff6b35] mr-2"></i>
              New Blog Post
            </h1>
            <p className="text-sm text-gray-300">Create a new blog post with images and video</p>
          </div>
          <Link href="/admin/blog" className="text-white hover:text-[#ff6b35] transition-colors text-sm">
            <i className="fas fa-arrow-left mr-1"></i> Back to Posts
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6">
              <i className="fas fa-check-circle mr-2"></i>
              Post published successfully! Redirecting...
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
              <i className="fas fa-exclamation-circle mr-2"></i> {error}
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex -mb-px space-x-4">
              <button
                onClick={() => setActiveTab('content')}
                className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'content'
                    ? 'border-[#2c5f2d] text-[#2c5f2d]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-edit mr-2"></i> Content
              </button>
              <button
                onClick={() => setActiveTab('media')}
                className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'media'
                    ? 'border-[#2c5f2d] text-[#2c5f2d]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-image mr-2"></i> Media
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'settings'
                    ? 'border-[#2c5f2d] text-[#2c5f2d]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-cog mr-2"></i> Settings
              </button>
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                    placeholder="Enter post title"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Excerpt (Short Description)
                  </label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    rows="2"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                    placeholder="Brief summary of the post..."
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    rows="10"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                    placeholder="Write your blog post content here..."
                  />
                </div>
              </div>
            )}

            {/* Media Tab */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Cover Image <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-4 flex-wrap">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-[#2c5f2d] hover:bg-[#1a3a1a] text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      <i className="fas fa-upload mr-2"></i> Upload Cover
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCoverSelect}
                      className="hidden"
                    />
                    {uploading && (
                      <span className="text-sm text-gray-500">
                        <i className="fas fa-spinner fa-spin mr-1"></i> Uploading...
                      </span>
                    )}
                    {coverPreview && (
                      <button
                        type="button"
                        onClick={removeCover}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        <i className="fas fa-times mr-1"></i> Remove
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Recommended: 1200x630px. JPG, PNG, WEBP (Max 5MB)
                  </p>
                  {coverPreview && (
                    <div className="mt-3">
                      <img
                        src={coverPreview}
                        alt="Cover Preview"
                        className="max-w-full max-h-64 rounded-lg border border-gray-200 object-cover"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Gallery Images (Multiple)
                  </label>
                  <div className="flex items-center gap-4 flex-wrap">
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors"
                    >
                      <i className="fas fa-images mr-2"></i> Add Gallery Images
                    </button>
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGallerySelect}
                      className="hidden"
                    />
                    <span className="text-sm text-gray-500">
                      {galleryImages.length} images selected
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Recommended: 800x600px. You can select multiple images at once.
                  </p>
                  {galleryPreviews.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {galleryPreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <i className="fas fa-times text-xs"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    YouTube Video URL (Optional)
                  </label>
                  <input
                    type="url"
                    name="video_url"
                    value={formData.video_url}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  {videoEmbedUrl && (
                    <div className="mt-3">
                      <p className="text-sm text-green-600 mb-2">
                        <i className="fas fa-check-circle mr-1"></i> Video preview:
                      </p>
                      <div className="aspect-video max-w-md rounded-lg overflow-hidden border border-gray-200">
                        <iframe
                          src={videoEmbedUrl}
                          className="w-full h-full"
                          allowFullScreen
                          title="Video preview"
                        ></iframe>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                    >
                      <option value="news">News</option>
                      <option value="story">Story</option>
                      <option value="update">Update</option>
                      <option value="announcement">Announcement</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Author
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                    placeholder="Author name"
                  />
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-4 flex-wrap pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading || uploading}
                className="bg-[#2c5f2d] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#1a3a1a] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading || uploading ? (
                  <><i className="fas fa-spinner fa-spin"></i> {uploading ? 'Uploading Images...' : 'Publishing...'}</>
                ) : (
                  <><i className="fas fa-save"></i> Publish Post</>
                )}
              </button>
              <Link
                href="/admin/blog"
                className="bg-gray-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}