'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function VolunteerPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    skills: '',
    availability: 'flexible',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        skills: '',
        availability: 'flexible',
        message: ''
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Responsive */}
      <section className="bg-gradient-to-r from-[#2c5f2d] to-[#1a3a1a] text-white py-12 sm:py-16 md:py-20 text-center px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="bg-[#ff6b35] p-2 sm:p-3 rounded-full">
              <i className="fas fa-hands-helping text-xl sm:text-2xl"></i>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
            Become a Volunteer
          </h1>
          <p className="text-sm sm:text-base md:text-lg max-w-2xl mx-auto opacity-90 px-2">
            Join our mission to bring hope closer to Africa. Your time and skills can make a real difference.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Stats Section - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 text-center hover:shadow-lg transition-shadow">
            <div className="bg-green-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <i className="fas fa-users text-xl sm:text-2xl text-[#2c5f2d]"></i>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">500+</h3>
            <p className="text-xs sm:text-sm text-gray-600">Active Volunteers</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 text-center hover:shadow-lg transition-shadow">
            <div className="bg-blue-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <i className="fas fa-project-diagram text-xl sm:text-2xl text-blue-600"></i>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">25+</h3>
            <p className="text-xs sm:text-sm text-gray-600">Active Projects</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 text-center hover:shadow-lg transition-shadow sm:col-span-2 md:col-span-1">
            <div className="bg-purple-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <i className="fas fa-heart text-xl sm:text-2xl text-purple-600"></i>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">50,000+</h3>
            <p className="text-xs sm:text-sm text-gray-600">Lives Impacted</p>
          </div>
        </div>

        {/* Form Section - Responsive */}
        <div className="max-w-3xl mx-auto px-1 sm:px-0">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2c5f2d] text-center mb-4 sm:mb-6">
              Volunteer Application Form
            </h2>

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base">
                <i className="fas fa-check-circle mr-2"></i>
                Thank you for applying! We will contact you within 3-5 business days.
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base">
                <i className="fas fa-exclamation-circle mr-2"></i> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                    placeholder="+250 XXX XXX XXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">
                  Skills / Expertise
                </label>
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                  placeholder="List your skills, qualifications, or areas of expertise..."
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">
                  Why do you want to volunteer? <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                  placeholder="Tell us why you're interested in volunteering..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#ff6b35] hover:bg-[#e55a2b] text-white py-2 sm:py-3 rounded-lg font-bold text-base sm:text-lg transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i> Submitting...</>
                ) : (
                  <><i className="fas fa-paper-plane mr-2"></i> Submit Application</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}