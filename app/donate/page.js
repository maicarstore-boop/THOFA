'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function DonatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project_id');
  const amountParam = searchParams.get('amount');
  
  const [formData, setFormData] = useState({
    project_id: projectId || '',
    donor_name: '',
    donor_email: '',
    donor_phone: '',
    amount: amountParam || '',
    donation_type: 'one-time',
    message: ''
  });
  const [selectedAmount, setSelectedAmount] = useState(amountParam || null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
    if (amountParam) {
      setSelectedAmount(amountParam);
      setFormData(prev => ({ ...prev, amount: amountParam }));
    }
  }, [projectId, amountParam]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setFormData({ ...formData, amount: amount.toString() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDebugInfo('');
    setSuccess(false);

    // Validate amount
    const amountValue = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amountValue) || amountValue <= 0) {
      setError('Please select or enter a valid donation amount');
      setLoading(false);
      return;
    }

    // Validate required fields
    if (!formData.donor_name.trim()) {
      setError('Please enter your full name');
      setLoading(false);
      return;
    }

    if (!formData.donor_email.trim()) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.donor_email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      setDebugInfo('Sending donation data...');
      console.log('Sending data:', formData);

      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: amountValue
        })
      });

      const data = await response.json();
      console.log('Response:', { status: response.status, data });
      setDebugInfo(`Status: ${response.status}`);

      if (response.ok) {
        setSuccess(true);
        setDebugInfo('Donation submitted successfully!');
        setFormData({
          ...formData,
          donor_name: '',
          donor_email: '',
          donor_phone: '',
          message: ''
        });
        setSelectedAmount(null);
        alert('Thank you for your donation! Your donation is pending verification. We will confirm once the payment is received.');
        setTimeout(() => {
          router.push(`/thank-you?donation_id=${data.donation?.id || ''}`);
        }, 2000);
      } else {
        setError(data.error || 'Donation failed. Please try again.');
        setDebugInfo(`Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Donation error:', error);
      setError('Network error. Please check your connection.');
      setDebugInfo(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return 'RWF ' + new Intl.NumberFormat().format(amount);
  };

  const presetAmounts = [5000, 10000, 25000, 50000, 100000];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#2c5f2d] to-[#1a3a1a] text-white py-12 md:py-16 text-center px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-center mb-4">
            <div className="bg-[#ff6b35] p-3 rounded-full">
              <i className="fas fa-heart text-2xl"></i>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Make a Donation
          </h1>
          <p className="text-base md:text-lg max-w-2xl mx-auto opacity-90">
            Your generosity helps us bring hope and transform lives across Africa
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Project Info */}
        {project && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-[#2c5f2d]">
                  <i className="fas fa-project-diagram mr-2"></i> Supporting:
                </h2>
                <p className="text-lg font-medium mt-1">{project.title}</p>
                <p className="text-sm text-gray-500 mt-1">
                  <i className="fas fa-map-marker-alt mr-1"></i> {project.location || 'Rwanda'}
                </p>
              </div>
              <div className="bg-gray-50 px-4 py-2 rounded-lg text-center">
                <p className="text-sm text-gray-500">Goal</p>
                <p className="font-bold text-[#2c5f2d]">{formatCurrency(project.goal_amount)}</p>
              </div>
              <div className="bg-gray-50 px-4 py-2 rounded-lg text-center">
                <p className="text-sm text-gray-500">Raised</p>
                <p className="font-bold text-[#2c5f2d]">{formatCurrency(project.raised_amount)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6">
            <i className="fas fa-check-circle mr-2"></i>
            Thank you for your donation! Redirecting...
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        )}

        {/* Donation Form */}
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
          <h2 className="text-2xl font-bold text-[#2c5f2d] mb-6">
            <i className="fas fa-hand-holding-heart mr-2"></i> Donation Details
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project ID (hidden) */}
            <input type="hidden" name="project_id" value={formData.project_id} />

            {/* Donation Amount */}
            <div>
              <label className="block text-gray-700 font-medium mb-3">
                Select Amount <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {presetAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => handleAmountSelect(amount)}
                    className={`py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                      selectedAmount == amount
                        ? 'border-[#2c5f2d] bg-[#2c5f2d] text-white'
                        : 'border-gray-300 hover:border-[#2c5f2d] hover:bg-gray-50'
                    }`}
                  >
                    {formatCurrency(amount)}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAmount('custom');
                    setFormData({ ...formData, amount: '' });
                  }}
                  className={`py-3 px-4 rounded-lg border-2 font-medium transition-colors col-span-3 md:col-span-1 ${
                    selectedAmount === 'custom'
                      ? 'border-[#2c5f2d] bg-[#2c5f2d] text-white'
                      : 'border-gray-300 hover:border-[#2c5f2d] hover:bg-gray-50'
                  }`}
                >
                  Custom
                </button>
              </div>
              {selectedAmount === 'custom' && (
                <div className="mt-3">
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="Enter amount in RWF"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                    min="1"
                  />
                </div>
              )}
            </div>

            {/* Donation Type */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Donation Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, donation_type: 'one-time' })}
                  className={`py-2 px-4 rounded-lg border-2 font-medium transition-colors ${
                    formData.donation_type === 'one-time'
                      ? 'border-[#2c5f2d] bg-[#2c5f2d] text-white'
                      : 'border-gray-300 hover:border-[#2c5f2d]'
                  }`}
                >
                  <i className="fas fa-hand-holding-heart mr-2"></i> One-time
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, donation_type: 'monthly' })}
                  className={`py-2 px-4 rounded-lg border-2 font-medium transition-colors ${
                    formData.donation_type === 'monthly'
                      ? 'border-[#2c5f2d] bg-[#2c5f2d] text-white'
                      : 'border-gray-300 hover:border-[#2c5f2d]'
                  }`}
                >
                  <i className="fas fa-calendar-alt mr-2"></i> Monthly
                </button>
              </div>
            </div>

            {/* Donor Name */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Your Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="donor_name"
                value={formData.donor_name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                placeholder="Enter your full name"
              />
            </div>

            {/* Donor Email */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Your Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="donor_email"
                value={formData.donor_email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                placeholder="Enter your email"
              />
            </div>

            {/* Donor Phone */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Your Phone Number (optional)
              </label>
              <input
                type="tel"
                name="donor_phone"
                value={formData.donor_phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Leave a Message (optional)
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                placeholder="Write a message of support..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ff6b35] text-white py-3 rounded-lg font-bold text-lg hover:bg-[#e55a2b] transition-colors disabled:opacity-50"
            >
              {loading ? (
                <><i className="fas fa-spinner fa-spin mr-2"></i> Processing...</>
              ) : (
                <><i className="fas fa-heart mr-2"></i> Complete Donation</>
              )}
            </button>

            <div className="text-center text-sm text-gray-500 mt-4">
              <i className="fas fa-lock mr-1"></i> Secure donation processing
            </div>

            {/* Debug Info */}
            {debugInfo && (
              <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
                <strong>Debug:</strong> {debugInfo}
              </div>
            )}
          </form>

          {/* Trust Badges */}
          <div className="mt-6 pt-6 border-t border-gray-200 flex flex-wrap justify-center gap-6 text-xs text-gray-400">
            <span><i className="fas fa-lock mr-1"></i> Secure Payment</span>
            <span><i className="fas fa-shield-alt mr-1"></i> 100% Protected</span>
            <span><i className="fas fa-receipt mr-1"></i> Tax Receipt Available</span>
          </div>
        </div>
      </div>
    </div>
  );
}