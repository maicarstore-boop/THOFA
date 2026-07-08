'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#2c5f2d] to-[#1a3a1a] text-white py-20 text-center px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-center mb-6">
            <div className="bg-[#ff6b35] p-4 rounded-full">
              <i className="fas fa-hands-helping text-4xl"></i>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            THOFA - Bringing Hope Closer to Africa
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto opacity-90 mb-8">
            Together we can make a difference in the lives of those who need it most.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/projects" className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white px-8 py-4 rounded-full font-bold text-lg transition-all">
              <i className="fas fa-heart mr-2"></i> Donate Now
            </Link>
            <Link href="/projects" className="border-2 border-white hover:bg-white hover:text-[#2c5f2d] text-white px-8 py-4 rounded-full font-bold text-lg transition-all">
              <i className="fas fa-eye mr-2"></i> View Projects
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2c5f2d]">Our Impact</h2>
            <p className="text-gray-600 mt-2">Making a difference in communities across Africa</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-xl text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-hand-holding-heart text-2xl text-[#2c5f2d]"></i>
              </div>
              <div className="text-2xl font-bold text-[#2c5f2d]">RWF 0</div>
              <div className="text-sm text-gray-600">Total Raised</div>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-project-diagram text-2xl text-blue-600"></i>
              </div>
              <div className="text-2xl font-bold text-[#2c5f2d]">0</div>
              <div className="text-sm text-gray-600">Projects</div>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-smile text-2xl text-yellow-600"></i>
              </div>
              <div className="text-2xl font-bold text-[#2c5f2d]">0+</div>
              <div className="text-sm text-gray-600">Lives Impacted</div>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-users text-2xl text-purple-600"></i>
              </div>
              <div className="text-2xl font-bold text-[#2c5f2d]">0+</div>
              <div className="text-sm text-gray-600">Volunteers</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}