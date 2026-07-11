'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminIndex() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    setIsLoggedIn(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#2c5f2d] border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#2c5f2d] to-[#1a3a1a] text-white py-16 md:py-24 text-center px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-center mb-6">
            <div className="bg-[#ff6b35] p-4 rounded-full">
              <i className="fas fa-hands-helping text-4xl"></i>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Admin Panel
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90">
            Manage your charity organization
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            {isLoggedIn ? (
              <Link
                href="/admin/dashboard"
                className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105"
              >
                <i className="fas fa-tachometer-alt mr-2"></i> Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/admin/login"
                className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105"
              >
                <i className="fas fa-sign-in-alt mr-2"></i> Login
              </Link>
            )}
            <Link
              href="/"
              className="border-2 border-white hover:bg-white hover:text-[#2c5f2d] text-white px-8 py-3 rounded-full font-bold transition-all"
            >
              <i className="fas fa-arrow-left mr-2"></i> Back to Website
            </Link>
          </div>
        </div>
      </section>

      {/* Admin Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#2c5f2d] text-center mb-12">Admin Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-project-diagram text-2xl text-[#2c5f2d]"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Manage Projects</h3>
              <p className="text-gray-600 text-sm">Create, edit, and delete charity projects</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-hand-holding-heart text-2xl text-blue-600"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">View Donations</h3>
              <p className="text-gray-600 text-sm">Track and manage all donations</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-users text-2xl text-yellow-600"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Manage Volunteers</h3>
              <p className="text-gray-600 text-sm">Review and approve volunteer applications</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-envelope text-2xl text-purple-600"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Contact Messages</h3>
              <p className="text-gray-600 text-sm">Read and reply to messages</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-newspaper text-2xl text-red-600"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Blog Management</h3>
              <p className="text-gray-600 text-sm">Create and manage blog posts</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-users-cog text-2xl text-indigo-600"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">User Management</h3>
              <p className="text-gray-600 text-sm">Manage admin and client users</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      {isLoggedIn && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-md p-4 text-center">
                <div className="text-2xl font-bold text-[#2c5f2d]">0</div>
                <p className="text-sm text-gray-600">Projects</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4 text-center">
                <div className="text-2xl font-bold text-[#2c5f2d]">RWF 0</div>
                <p className="text-sm text-gray-600">Donations</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4 text-center">
                <div className="text-2xl font-bold text-[#2c5f2d]">0</div>
                <p className="text-sm text-gray-600">Volunteers</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4 text-center">
                <div className="text-2xl font-bold text-[#2c5f2d]">0</div>
                <p className="text-sm text-gray-600">Messages</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}