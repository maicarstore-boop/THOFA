'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  
  // Organization Settings
  const [settings, setSettings] = useState({
    org_name: '',
    org_short_name: '',
    org_tagline: '',
    org_email: '',
    org_phone1: '',
    org_phone2: '',
    org_address: '',
    org_website: ''
  });

  // Admin Password Change
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    fetchSettings();
  }, [router]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setSettings({
        org_name: data.org_name || process.env.NEXT_PUBLIC_ORG_NAME || '',
        org_short_name: data.org_short_name || process.env.NEXT_PUBLIC_ORG_SHORT_NAME || '',
        org_tagline: data.org_tagline || process.env.NEXT_PUBLIC_ORG_TAGLINE || '',
        org_email: data.org_email || process.env.NEXT_PUBLIC_ORG_EMAIL || '',
        org_phone1: data.org_phone1 || process.env.NEXT_PUBLIC_ORG_PHONE1 || '',
        org_phone2: data.org_phone2 || process.env.NEXT_PUBLIC_ORG_PHONE2 || '',
        org_address: data.org_address || process.env.NEXT_PUBLIC_ORG_ADDRESS || '',
        org_website: data.org_website || process.env.NEXT_PUBLIC_ORG_WEBSITE || ''
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Use env defaults if API fails
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const saveGeneralSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      setSaving(false);
      return;
    }

    if (passwordData.new_password.length < 6) {
      setError('New password must be at least 6 characters');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password changed successfully!');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#2c5f2d] border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading settings...</p>
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
              <i className="fas fa-cog text-[#ff6b35] mr-2"></i>
              Settings
            </h1>
            <p className="text-sm text-gray-300">Manage your organization settings</p>
          </div>
          <Link href="/admin/dashboard" className="text-white hover:text-[#ff6b35] transition-colors text-sm">
            <i className="fas fa-arrow-left mr-1"></i> Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
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

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              <button
                onClick={() => setActiveTab('general')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'general'
                    ? 'border-[#2c5f2d] text-[#2c5f2d]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-building mr-2"></i> General
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'security'
                    ? 'border-[#2c5f2d] text-[#2c5f2d]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-lock mr-2"></i> Security
              </button>
              <button
                onClick={() => setActiveTab('system')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'system'
                    ? 'border-[#2c5f2d] text-[#2c5f2d]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-server mr-2"></i> System Info
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* General Settings Tab */}
            {activeTab === 'general' && (
              <form onSubmit={saveGeneralSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      name="org_name"
                      value={settings.org_name}
                      onChange={handleSettingChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d] text-sm"
                      placeholder="Organization name"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                      Short Name (Acronym)
                    </label>
                    <input
                      type="text"
                      name="org_short_name"
                      value={settings.org_short_name}
                      onChange={handleSettingChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d] text-sm"
                      placeholder="e.g., THOFA"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                      Tagline / Slogan
                    </label>
                    <input
                      type="text"
                      name="org_tagline"
                      value={settings.org_tagline}
                      onChange={handleSettingChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d] text-sm"
                      placeholder="e.g., Bringing Hope Closer to Africa"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                      Website URL
                    </label>
                    <input
                      type="url"
                      name="org_website"
                      value={settings.org_website}
                      onChange={handleSettingChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d] text-sm"
                      placeholder="https://thofa.org"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="org_email"
                      value={settings.org_email}
                      onChange={handleSettingChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d] text-sm"
                      placeholder="contact@thofa.org"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                      Phone Number 1
                    </label>
                    <input
                      type="text"
                      name="org_phone1"
                      value={settings.org_phone1}
                      onChange={handleSettingChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d] text-sm"
                      placeholder="+250 788 499 920"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                      Phone Number 2
                    </label>
                    <input
                      type="text"
                      name="org_phone2"
                      value={settings.org_phone2}
                      onChange={handleSettingChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d] text-sm"
                      placeholder="+250 783 460 937"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                      Address
                    </label>
                    <input
                      type="text"
                      name="org_address"
                      value={settings.org_address}
                      onChange={handleSettingChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d] text-sm"
                      placeholder="Kigali, Rwanda"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-[#2c5f2d] hover:bg-[#1a3a1a] text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <><i className="fas fa-spinner fa-spin mr-2"></i> Saving...</>
                    ) : (
                      <><i className="fas fa-save mr-2"></i> Save Settings</>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Change Password</h3>
                <form onSubmit={changePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                      Current Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="current_password"
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d] text-sm"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="new_password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d] text-sm"
                      placeholder="Enter new password (min 6 characters)"
                      minLength="6"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="confirm_password"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d] text-sm"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-[#2c5f2d] hover:bg-[#1a3a1a] text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <><i className="fas fa-spinner fa-spin mr-2"></i> Changing...</>
                    ) : (
                      <><i className="fas fa-key mr-2"></i> Change Password</>
                    )}
                  </button>
                </form>

                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Admin Users</h3>
                  <Link
                    href="/admin/users"
                    className="inline-block bg-[#ff6b35] hover:bg-[#e55a2b] text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    <i className="fas fa-users-cog mr-2"></i> Manage Admin Users
                  </Link>
                </div>
              </div>
            )}

            {/* System Info Tab */}
            {activeTab === 'system' && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">System Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Node.js Version</p>
                    <p className="font-medium text-gray-900">{process.version || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Next.js Version</p>
                    <p className="font-medium text-gray-900">14.0.4</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">React Version</p>
                    <p className="font-medium text-gray-900">18.2.0</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Environment</p>
                    <p className="font-medium text-gray-900">
                      {process.env.NODE_ENV || 'development'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">
                    <i className="fas fa-info-circle mr-2"></i> About THOFA
                  </h4>
                  <p className="text-sm text-blue-700">
                    Tumuri Hafi Organization For Africa (THOFA) is a non-profit organization dedicated to 
                    bringing hope and transforming lives across Africa.
                  </p>
                  <p className="text-sm text-blue-700 mt-2">
                    <strong>Version:</strong> 1.0.0
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}