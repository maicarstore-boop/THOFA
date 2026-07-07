'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EditBlogPost() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id;
  
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
  const [currentCoverImage, setCurrentCoverImage] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [existingGalleryImages, setExistingGalleryImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    if (postId) {
      fetchPost();
    }
  }, [postId, router]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/blog/${postId}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          title: data.title || '',
          content: data.content || '',
          excerpt: data.excerpt || '',
          category: data.category || 'news',
          status: data.status || 'published',
          author: data.author || '',
          video_url: data.video_url || ''
        });
        setCurrentCoverImage(data.featured_image || '');
        setExistingGalleryImages(data.gallery_images || []);
      } else {
        setError('Post not found');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Error loading post');
    } finally {
      setLoading(false);
    }
  };

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
    setCurrentCoverImage('');
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

  const removeExistingGalleryImage = (index) => {
    const newImages = existingGalleryImages.filter((_, i) => i !== index);
    setExistingGalleryImages(newImages);
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
    setSaving(true);
    setUploading(true);
    setError('');
    setSuccess(false);

    try {
      let coverImageUrl = currentCoverImage;
      if (coverImage) {
        coverImageUrl = await uploadToCloudinary(coverImage, 'thofa_charity/blog/covers');
      }

      // Upload new gallery images
      const galleryUrls = [...existingGalleryImages];
      for (const image of galleryImages) {
        const url = await uploadToCloudinary(image, 'thofa_charity/blog/gallery');
        galleryUrls.push(url);
      }

      const postData = {
        ...formData,
        featured_image: coverImageUrl,
        gallery_images: galleryUrls
      };

      const response = await fetch(`/api/blog/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/blog');
        }, 2000);
      } else {
        setError(data.error || 'Failed to update post');
      }
    } catch (error) {
      console.error('Update error:', error);
      setError(error.message || 'Network error. Please try again.');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#2c5f2d] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1a3a1a] text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              <i className="fas fa-edit text-[#ff6b35] mr-2"></i>
              Edit Blog Post
            </h1>
            <p className="text-sm text-gray-300">Update your blog post</p>
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
              Post updated successfully! Redirecting...
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
                    Cover Image
                  </label>
                  <div className="flex items-center gap-4 flex-wrap">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-[#2c5f2d] hover:bg-[#1a3a1a] text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      <i className="fas fa-upload mr-2"></i> Change Cover
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
                    {(coverPreview || currentCoverImage) && (
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
                  {(coverPreview || currentCoverImage) && (
                    <div className="mt-3">
                      <img
                        src={coverPreview || currentCoverImage}
                        alt="Cover Preview"
                        className="max-w-full max-h-64 rounded-lg border border-gray-200 object-cover"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Gallery Images
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
                      {existingGalleryImages.length + galleryImages.length} images
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Recommended: 800x600px. You can select multiple images at once.
                  </p>
                  
                  {/* Existing Gallery Images */}
                  {existingGalleryImages.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {existingGalleryImages.map((img, index) => (
                        <div key={`existing-${index}`} className="relative group">
                          <img
                            src={img}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingGalleryImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <i className="fas fa-times text-xs"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* New Gallery Images */}
                  {galleryPreviews.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {galleryPreviews.map((preview, index) => (
                        <div key={`new-${index}`} className="relative group">
                          <img
                            src={preview}
                            alt={`New Gallery ${index + 1}`}
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
                disabled={saving || uploading}
                className="bg-[#2c5f2d] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#1a3a1a] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving || uploading ? (
                  <><i className="fas fa-spinner fa-spin"></i> {uploading ? 'Uploading Images...' : 'Saving...'}</>
                ) : (
                  <><i className="fas fa-save"></i> Update Post</>
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