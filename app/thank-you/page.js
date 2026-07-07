'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ThankYouPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const donationId = searchParams.get('donation_id');
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (donationId) {
      fetchDonation();
    } else {
      // If no donation ID, redirect to home after 3 seconds
      setTimeout(() => router.push('/'), 3000);
    }
  }, [donationId, router]);

  const fetchDonation = async () => {
    try {
      const response = await fetch(`/api/donations/${donationId}`);
      if (response.ok) {
        const data = await response.json();
        setDonation(data);
      } else {
        setError('Donation not found');
      }
    } catch (error) {
      console.error('Error fetching donation:', error);
      setError('Error loading donation details');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return 'RWF ' + new Intl.NumberFormat().format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#2c5f2d] border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading donation details...</p>
        </div>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Something went wrong</h2>
          <p className="text-gray-500 mb-6">{error || 'We could not find your donation details.'}</p>
          <Link
            href="/"
            className="inline-block bg-[#2c5f2d] text-white px-6 py-2 rounded-lg hover:bg-[#1a3a1a] transition-colors"
          >
            <i className="fas fa-home mr-2"></i> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2c5f2d] to-[#1a3a1a] text-white p-8 text-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-check-circle text-5xl text-[#2c5f2d]"></i>
            </div>
            <h1 className="text-3xl font-bold">Thank You!</h1>
            <p className="text-gray-300 mt-1">Your generosity makes a difference</p>
          </div>

          {/* Body */}
          <div className="p-6 md:p-8">
            <div className="text-center mb-6">
              <p className="text-gray-600">
                Your donation has been successfully processed. 
                You will receive a confirmation email shortly.
              </p>
            </div>

            {/* Donation Details */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-700 mb-4">
                <i className="fas fa-receipt text-[#2c5f2d] mr-2"></i>
                Donation Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-500">Donation ID</span>
                  <span className="font-medium text-gray-700">#{donation.id}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-500">Donor</span>
                  <span className="font-medium text-gray-700">{donation.donor_name}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-bold text-[#2c5f2d] text-lg">{formatCurrency(donation.amount)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium text-gray-700 capitalize">{donation.donation_type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium text-gray-700">{formatDate(donation.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Message from Donor */}
            {donation.message && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600 italic">
                  <i className="fas fa-quote-left text-[#2c5f2d] mr-1"></i>
                  {donation.message}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/"
                className="flex-1 bg-[#2c5f2d] hover:bg-[#1a3a1a] text-white text-center px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <i className="fas fa-home mr-2"></i> Back to Home
              </Link>
              <Link
                href="/projects"
                className="flex-1 bg-[#ff6b35] hover:bg-[#e55a2b] text-white text-center px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <i className="fas fa-heart mr-2"></i> Support More Projects
              </Link>
            </div>

            {/* Share Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center mb-3">
                <i className="fas fa-share-alt mr-1"></i> Share your support
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                  className="w-10 h-10 rounded-full bg-[#1877f2] text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  <i className="fab fa-facebook-f"></i>
                </button>
                <button
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('I just donated to THOFA! Join me in making a difference.')}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                  className="w-10 h-10 rounded-full bg-[#1da1f2] text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  <i className="fab fa-twitter"></i>
                </button>
                <button
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('I just donated to THOFA! Join me in making a difference. ' + window.location.href)}`, '_blank')}
                  className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  <i className="fab fa-whatsapp"></i>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }}
                  className="w-10 h-10 rounded-full bg-gray-600 text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  <i className="fas fa-link"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <Link href="/" className="hover:text-[#2c5f2d] mx-3">Home</Link>
          <Link href="/projects" className="hover:text-[#2c5f2d] mx-3">Projects</Link>
          <Link href="/volunteer" className="hover:text-[#2c5f2d] mx-3">Volunteer</Link>
          <Link href="/contact" className="hover:text-[#2c5f2d] mx-3">Contact</Link>
        </div>
      </div>
    </div>
  );
}