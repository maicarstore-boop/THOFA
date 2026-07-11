'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('thofa_user');
    if (!userData) {
      router.push('/login');
      return;
    }

    try {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setFormData({
        name: parsed.name || '',
        email: parsed.email || '',
        phone: parsed.phone || '',
        bio: parsed.bio || '',
        location: parsed.location || '',
        website: parsed.website || ''
      });
      if (parsed.profile_image) {
        setProfileImage(parsed.profile_image);
        setImagePreview(parsed.profile_image);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPG, PNG, GIF, or WEBP)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Store the file for upload
      const fileInput = e.target;
      setProfileImage(fileInput.files[0]);
    }
  };

  const uploadImageToCloudinary = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'thofa_charity/profiles');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      let profileImageUrl = user?.profile_image || '';

      // Upload new profile image if selected
      if (profileImage && typeof profileImage !== 'string') {
        try {
          profileImageUrl = await uploadImageToCloudinary(profileImage);
        } catch (uploadError) {
          setError('Failed to upload profile image: ' + uploadError.message);
          setSaving(false);
          return;
        }
      }

      // Update user in localStorage
      const updatedUser = {
        ...user,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        profile_image: profileImageUrl,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem('thofa_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setProfileImage(profileImageUrl);
      setMessage('Profile updated successfully!');
      
      window.dispatchEvent(new Event('storage'));

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('thofa_user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#2c5f2d] border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-[#2c5f2d]">
            <i className="fas fa-user mr-2"></i> My Profile
          </h1>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard" className="text-gray-500 hover:text-[#2c5f2d] transition-colors text-sm flex items-center">
              <i className="fas fa-arrow-left mr-1"></i> Back to Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-700 transition-colors text-sm flex items-center"
            >
              <i className="fas fa-sign-out-alt mr-1"></i> Logout
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-[#2c5f2d] to-[#1a3a1a] p-6 text-white">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Profile Image */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-4 border-white/50">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-white">
                      {user.name?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-[#ff6b35] hover:bg-[#e55a2b] text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors shadow-lg"
                  title="Change profile picture"
                >
                  <i className="fas fa-camera text-sm"></i>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                {imagePreview && (
                  <button
                    onClick={removeProfileImage}
                    className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors text-xs"
                    title="Remove image"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>

              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold">{user.name || 'User'}</h2>
                <p className="text-gray-300">{user.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Member since {user.registeredAt ? new Date(user.registeredAt).toLocaleDateString() : 'N/A'}
                </p>
                {uploading && (
                  <p className="text-xs text-yellow-300 mt-1">
                    <i className="fas fa-spinner fa-spin mr-1"></i> Uploading image...
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Profile Body */}
          <div className="p-6">
            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6">
                <i className="fas fa-check-circle mr-2"></i> {message}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
                <i className="fas fa-exclamation-circle mr-2"></i> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-sm">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d] text-sm"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-sm">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d] text-sm"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-sm">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d] text-sm"
                    placeholder="+250 788 000 000"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-sm">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d] text-sm"
                    placeholder="Kigali, Rwanda"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-2 text-sm">
                    Website / Social Media
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d] text-sm"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-2 text-sm">
                    Bio / About Me
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d] text-sm"
                    placeholder="Tell us a little about yourself..."
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="bg-[#2c5f2d] hover:bg-[#1a3a1a] text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving || uploading ? (
                    <><i className="fas fa-spinner fa-spin mr-2"></i> {uploading ? 'Uploading Image...' : 'Saving...'}</>
                  ) : (
                    <><i className="fas fa-save mr-2"></i> Save Changes</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      name: user.name || '',
                      email: user.email || '',
                      phone: user.phone || '',
                      bio: user.bio || '',
                      location: user.location || '',
                      website: user.website || ''
                    });
                    setImagePreview(user.profile_image || null);
                    setProfileImage(user.profile_image || null);
                    setError('');
                    setMessage('');
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Account Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-[#2c5f2d]">0</div>
            <p className="text-sm text-gray-600">Donations Made</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-[#2c5f2d]">0</div>
            <p className="text-sm text-gray-600">Projects Supported</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-[#2c5f2d]">0</div>
            <p className="text-sm text-gray-600">Volunteer Hours</p>
          </div>
        </div>
      </div>
    </div>
  );
}