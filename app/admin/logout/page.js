'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLogout() {
  const router = useRouter();

  useEffect(() => {
    // Clear all admin-related data from localStorage
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    
    // Clear any cookies that might be set
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });

    // Redirect to admin login after 2 seconds
    const timer = setTimeout(() => {
      router.push('/admin/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <i className="fas fa-check-circle text-4xl text-green-600"></i>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Logged Out Successfully</h2>
        <p className="text-gray-600 mb-6">You have been logged out of the admin panel.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/admin/login"
            className="bg-[#2c5f2d] hover:bg-[#1a3a1a] text-white px-6 py-2 rounded-lg transition-colors"
          >
            <i className="fas fa-sign-in-alt mr-2"></i> Login Again
          </Link>
          <Link
            href="/"
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            <i className="fas fa-home mr-2"></i> Back to Home
          </Link>
        </div>
        <div className="mt-4 text-sm text-gray-400">
          Redirecting to login page in a few seconds...
        </div>
      </div>
    </div>
  );
}