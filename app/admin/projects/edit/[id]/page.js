'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EditProject() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    goal_amount: '',
    raised_amount: '',
    project_type: 'other',
    beneficiaries: '',
    start_date: '',
    end_date: '',
    status: 'active',
    video_url: '',
    owner_name: '',
    owner_contact: '',
    account_holder_name: '',
    account_number: '',
    bank_name: '',
    mobile_money_number: '',
    mobile_money_provider: ''
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
  const [activeTab, setActiveTab] = useState('basic');
  
  const coverInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    if (projectId) {
      fetchProject();
    }
  }, [projectId, router]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          title: data.title || '',
          description: data.description || '',
          location: data.location || '',
          goal_amount: data.goal_amount || '',
          raised_amount: data.raised_amount || '',
          project_type: data.project_type || 'other',
          beneficiaries: data.beneficiaries || '',
          start_date: data.start_date || '',
          end_date: data.end_date || '',
          status: data.status || 'active',
          video_url: data.video_url || '',
          owner_name: data.owner_name || '',
          owner_contact: data.owner_contact || '',
          account_holder_name: data.account_holder_name || '',
          account_number: data.account_number || '',
          bank_name: data.bank_name || '',
          mobile_money_number: data.mobile_money_number || '',
          mobile_money_provider: data.mobile_money_provider || ''
        });
        setCurrentCoverImage(data.featured_image || '');
        setExistingGalleryImages(data.images || []);
      } else {
        setError('Project not found');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('Error loading project');
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
    if (coverInputRef.current) {
      coverInputRef.current.value = '';
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

  const uploadToCloudinary = async (file, folder = 'thofa_charity/projects') => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setUploading(true);
    setError('');
    setSuccess(false);

    try {
      let coverImageUrl = currentCoverImage;
      if (coverImage) {
        coverImageUrl = await uploadToCloudinary(coverImage, 'thofa_charity/projects/covers');
      }

      // Upload new gallery images
      const galleryUrls = [...existingGalleryImages.map(img => img.image_path || img)];
      for (const image of galleryImages) {
        const url = await uploadToCloudinary(image, 'thofa_charity/projects/gallery');
        galleryUrls.push(url);
      }

      const projectData = {
        ...formData,
        goal_amount: parseFloat(formData.goal_amount),
        raised_amount: parseFloat(formData.raised_amount) || 0,
        beneficiaries: parseInt(formData.beneficiaries) || 0,
        featured_image: coverImageUrl,
        gallery_images: galleryUrls
      };

      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/projects');
        }, 2000);
      } else {
        setError(data.error || 'Failed to update project');
      }
    } catch (error) {
      console.error('Update error:', error);
      setError(error.message || 'Network error. Please try again.');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const formatCurrency = (amount) => {
    return 'RWF ' + new Intl.NumberFormat().format(amount);
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
              Edit Project
            </h1>
            <p className="text-sm text-gray-300">Update project details</p>
          </div>
          <Link href="/admin/projects" className="text-white hover:text-[#ff6b35] transition-colors text-sm">
            <i className="fas fa-arrow-left mr-1"></i> Back to Projects
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6">
              <i className="fas fa-check-circle mr-2"></i>
              Project updated successfully! Redirecting...
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
                onClick={() => setActiveTab('basic')}
                className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'basic'
                    ? 'border-[#2c5f2d] text-[#2c5f2d]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-info-circle mr-2"></i> Basic Info
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
                onClick={() => setActiveTab('account')}
                className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'account'
                    ? 'border-[#2c5f2d] text-[#2c5f2d]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-university mr-2"></i> Account Info
              </button>
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Project Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                      placeholder="Enter project title"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                      placeholder="Kigali, Rwanda"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Goal Amount (RWF) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="goal_amount"
                      value={formData.goal_amount}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                      placeholder="5000000"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Raised Amount (RWF)
                    </label>
                    <input
                      type="number"
                      name="raised_amount"
                      value={formData.raised_amount}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-400 mt-1">This updates automatically from donations</p>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Project Type
                    </label>
                    <select
                      name="project_type"
                      value={formData.project_type}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                    >
                      <option value="education">Education</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="food">Food Relief</option>
                      <option value="water">Clean Water</option>
                      <option value="shelter">Shelter</option>
                      <option value="emergency">Emergency</option>
                      <option value="other">Other</option>
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
                      <option value="active">Active</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                    placeholder="Describe the project in detail..."
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Video URL (YouTube)
                  </label>
                  <input
                    type="url"
                    name="video_url"
                    value={formData.video_url}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Coordinator Name
                    </label>
                    <input
                      type="text"
                      name="owner_name"
                      value={formData.owner_name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                      placeholder="Project coordinator name"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Coordinator Contact
                    </label>
                    <input
                      type="text"
                      name="owner_contact"
                      value={formData.owner_contact}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                      placeholder="Phone number"
                    />
                  </div>
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
                      onClick={() => coverInputRef.current?.click()}
                      className="bg-[#2c5f2d] hover:bg-[#1a3a1a] text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      <i className="fas fa-upload mr-2"></i> Change Cover
                    </button>
                    <input
                      ref={coverInputRef}
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
                            src={img.image_path || img}
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
              </div>
            )}

            {/* Account Info Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <p className="text-sm text-gray-500 mb-4">
                  This information will be displayed on the project page for donors.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      name="account_holder_name"
                      value={formData.account_holder_name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                      placeholder="Full name on the account"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Account Number
                    </label>
                    <input
                      type="text"
                      name="account_number"
                      value={formData.account_number}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                      placeholder="Bank account number"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Bank Name
                    </label>
                    <select
                      name="bank_name"
                      value={formData.bank_name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                    >
                      <option value="">Select Bank</option>
                      <option value="Bank of Kigali">Bank of Kigali</option>
                      <option value="Equity Bank">Equity Bank</option>
                      <option value="I&M Bank">I&M Bank</option>
                      <option value="Access Bank">Access Bank</option>
                      <option value="KCB Bank">KCB Bank</option>
                      <option value="GTBank">GTBank</option>
                      <option value="Ecobank">Ecobank</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Mobile Money Number
                    </label>
                    <input
                      type="text"
                      name="mobile_money_number"
                      value={formData.mobile_money_number}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                      placeholder="e.g., 0788 000 000"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Mobile Money Provider
                    </label>
                    <select
                      name="mobile_money_provider"
                      value={formData.mobile_money_provider}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                    >
                      <option value="">Select Provider</option>
                      <option value="MTN Mobile Money">MTN Mobile Money (MoMo)</option>
                      <option value="Airtel Money">Airtel Money</option>
                      <option value="Tigo Cash">Tigo Cash</option>
                    </select>
                  </div>
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
                  <><i className="fas fa-save"></i> Update Project</>
                )}
              </button>
              <Link
                href="/admin/projects"
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