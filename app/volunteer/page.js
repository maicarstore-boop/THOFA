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

    // Validate
    const errors = [];
    if (!formData.full_name.trim()) errors.push('Full name is required');
    if (!formData.email.trim()) errors.push('Email is required');
    if (!formData.phone.trim()) errors.push('Phone number is required');
    if (!formData.message.trim()) errors.push('Message is required');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Invalid email format');
    }

    if (errors.length > 0) {
      setError(errors.join(', '));
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({
          full_name: '',
          email: '',
          phone: '',
          skills: '',
          availability: 'flexible',
          message: ''
        });
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: 'fa-heart',
      title: 'Make an Impact',
      description: 'Directly contribute to improving lives in African communities through meaningful work.'
    },
    {
      icon: 'fa-users',
      title: 'Join a Community',
      description: 'Connect with like-minded individuals passionate about creating positive change.'
    },
    {
      icon: 'fa-chalkboard-teacher',
      title: 'Develop Skills',
      description: 'Gain valuable experience and develop new skills while helping others.'
    }
  ];

  const faqs = [
    {
      question: 'What are the requirements to volunteer?',
      answer: 'We welcome volunteers of all backgrounds! Basic requirements include being at least 18 years old, having a passion for helping others, and being committed to our mission.'
    },
    {
      question: 'How much time do I need to commit?',
      answer: 'The time commitment varies based on the role. Some opportunities require just a few hours per week, while others may need more dedication. We work with your schedule.'
    },
    {
      question: 'Will I receive training?',
      answer: 'Yes! All volunteers receive orientation and role-specific training to ensure you\'re prepared and confident in your volunteer activities.'
    },
    {
      question: 'Can I volunteer remotely?',
      answer: 'Yes! We offer both in-person and remote volunteer opportunities. Remote volunteers can help with social media, fundraising, content creation, and more.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#2c5f2d] to-[#1a3a1a] text-white py-16 md:py-20 text-center px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-center mb-4">
            <div className="bg-[#ff6b35] p-3 rounded-full">
              <i className="fas fa-hands-helping text-2xl"></i>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Become a Volunteer
          </h1>
          <p className="text-base md:text-lg max-w-2xl mx-auto opacity-90">
            Join our mission to bring hope closer to Africa. Your time and skills can make a real difference.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-users text-2xl text-[#2c5f2d]"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">500+</h3>
            <p className="text-gray-600">Active Volunteers</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-project-diagram text-2xl text-blue-600"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">25+</h3>
            <p className="text-gray-600">Active Projects</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-heart text-2xl text-purple-600"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">50,000+</h3>
            <p className="text-gray-600">Lives Impacted</p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-[#2c5f2d] text-center mb-4">Why Volunteer With Us?</h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Join a community of changemakers dedicated to transforming lives across Africa
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className={`fas ${benefit.icon} text-2xl text-[#2c5f2d]`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 mb-12 max-w-3xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="text-4xl text-[#2c5f2d] opacity-30">"</div>
            <div>
              <p className="text-gray-700 italic text-lg mb-4">
                Volunteering with THOFA has been one of the most rewarding experiences of my life. 
                Seeing the smiles on children's faces when they receive educational materials is priceless.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#2c5f2d] rounded-full flex items-center justify-center text-white text-xl font-bold">
                  M
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Marie U.</p>
                  <p className="text-sm text-gray-500">Education Volunteer</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#2c5f2d] text-center mb-6">
              Volunteer Application Form
            </h2>

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                <i className="fas fa-check-circle mr-2"></i>
                Thank you for applying! We will contact you within 3-5 business days.
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                    placeholder="+250 XXX XXX XXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Availability
                </label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                >
                  <option value="weekdays">Weekdays (Monday - Friday)</option>
                  <option value="weekends">Weekends (Saturday - Sunday)</option>
                  <option value="evenings">Evenings (After 5 PM)</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Skills / Expertise
                </label>
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                  placeholder="List your skills, qualifications, or areas of expertise..."
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Why do you want to volunteer? <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                  placeholder="Tell us why you're interested in volunteering..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#ff6b35] hover:bg-[#e55a2b] text-white py-3 rounded-lg font-bold text-lg transition-colors disabled:opacity-50"
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

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-12">
          <h2 className="text-3xl font-bold text-[#2c5f2d] text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-bold text-[#2c5f2d] mb-2">
                  <i className="fas fa-question-circle mr-2 text-[#ff6b35]"></i>
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Have more questions? We're here to help!</p>
          <Link href="/#contact" className="inline-block bg-[#2c5f2d] hover:bg-[#1a3a1a] text-white px-8 py-3 rounded-lg font-medium transition-colors">
            <i className="fas fa-envelope mr-2"></i> Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}