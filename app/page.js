'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  useEffect(() => {
    fetchData();
    checkUser();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, projectsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/projects?status=active&limit=3')
      ]);
      
      const statsData = await statsRes.json();
      const projectsData = await projectsRes.json();
      
      setStats(statsData);
      setProjects(projectsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setStatsLoading(false);
      setProjectsLoading(false);
    }
  };

  const checkUser = () => {
    const userData = localStorage.getItem('thofa_user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        setUser(null);
      }
    }
  };

  const formatCurrency = (amount) => {
    return 'RWF ' + new Intl.NumberFormat().format(amount);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Fully Responsive */}
      <section className="relative text-white py-12 sm:py-16 md:py-20 lg:py-32 text-center px-4 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/images.jpg)' }}>
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="relative z-10 container mx-auto max-w-4xl">
          {/* Logo Icon - Responsive */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="bg-[#ff6b35] p-3 sm:p-4 rounded-full">
              <i className="fas fa-hands-helping text-2xl sm:text-3xl md:text-4xl"></i>
            </div>
          </div>
          
          {/* Title - Responsive */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-4 leading-tight px-2">
            {process.env.NEXT_PUBLIC_ORG_NAME || 'THOFA'}
          </h1>
          
          {/* Tagline - Responsive */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto opacity-90 mb-4 sm:mb-6 px-2">
            {process.env.NEXT_PUBLIC_ORG_TAGLINE || 'Bringing Hope Closer to Africa'}
          </p>
          
          {/* Description - Responsive */}
          <p className="text-sm sm:text-base md:text-lg max-w-2xl mx-auto opacity-80 mb-6 sm:mb-8 px-2">
            Together we can make a difference in the lives of those who need it most.
          </p>
          
          {/* Buttons - Responsive */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2">
            <Link href="/projects" className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base md:text-lg transition-all transform hover:scale-105 text-center">
              <i className="fas fa-heart mr-2"></i> Donate Now
            </Link>
            <Link href="/projects" className="border-2 border-white hover:bg-white hover:text-[#2c5f2d] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base md:text-lg transition-all text-center">
              <i className="fas fa-eye mr-2"></i> View Projects
            </Link>
            {user ? (
              <Link href="/dashboard" className="border-2 border-white hover:bg-white hover:text-[#2c5f2d] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base md:text-lg transition-all text-center">
                <i className="fas fa-user mr-2"></i> Dashboard
              </Link>
            ) : (
              <Link href="/login" className="border-2 border-white hover:bg-white hover:text-[#2c5f2d] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base md:text-lg transition-all text-center">
                <i className="fas fa-sign-in-alt mr-2"></i> Login
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section - Fully Responsive */}
      <section className="py-8 sm:py-12 md:py-16 bg-white px-3 sm:px-4">
        <div className="container mx-auto">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2c5f2d]">Our Impact</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2 px-2">Making a difference in communities across Africa</p>
          </div>
          
          {statsLoading ? (
            <div className="text-center py-6 sm:py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-4 border-[#2c5f2d] border-t-transparent"></div>
              <p className="mt-2 sm:mt-4 text-gray-600 text-sm sm:text-base">Loading statistics...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-4xl mx-auto">
              <div className="bg-gray-50 p-4 sm:p-5 md:p-6 rounded-xl text-center hover:shadow-lg transition-shadow">
                <div className="bg-green-100 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <i className="fas fa-hand-holding-heart text-lg sm:text-xl md:text-2xl text-[#2c5f2d]"></i>
                </div>
                <div className="text-base sm:text-lg md:text-2xl font-bold text-[#2c5f2d]">
                  {stats ? formatCurrency(stats.totalRaised) : 'RWF 0'}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Total Raised</div>
              </div>
              <div className="bg-gray-50 p-4 sm:p-5 md:p-6 rounded-xl text-center hover:shadow-lg transition-shadow">
                <div className="bg-blue-100 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <i className="fas fa-project-diagram text-lg sm:text-xl md:text-2xl text-blue-600"></i>
                </div>
                <div className="text-base sm:text-lg md:text-2xl font-bold text-[#2c5f2d]">
                  {stats ? stats.totalProjects : 0}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Projects</div>
              </div>
              <div className="bg-gray-50 p-4 sm:p-5 md:p-6 rounded-xl text-center hover:shadow-lg transition-shadow">
                <div className="bg-yellow-100 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <i className="fas fa-smile text-lg sm:text-xl md:text-2xl text-yellow-600"></i>
                </div>
                <div className="text-base sm:text-lg md:text-2xl font-bold text-[#2c5f2d]">
                  {stats ? stats.totalBeneficiaries?.toLocaleString() + '+' : '0+'}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Lives Impacted</div>
              </div>
              <div className="bg-gray-50 p-4 sm:p-5 md:p-6 rounded-xl text-center hover:shadow-lg transition-shadow">
                <div className="bg-purple-100 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <i className="fas fa-users text-lg sm:text-xl md:text-2xl text-purple-600"></i>
                </div>
                <div className="text-base sm:text-lg md:text-2xl font-bold text-[#2c5f2d]">
                  {stats ? stats.totalVolunteers + '+' : '0+'}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Volunteers</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Projects Section - Fully Responsive */}
      <section className="py-8 sm:py-12 md:py-16 bg-gray-50 px-3 sm:px-4">
        <div className="container mx-auto">
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2c5f2d]">Featured Projects</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2 px-2">Help us make a difference through these initiatives</p>
          </div>

          {projectsLoading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-4 border-[#2c5f2d] border-t-transparent"></div>
              <p className="mt-2 sm:mt-4 text-gray-600 text-sm sm:text-base">Loading projects...</p>
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
              {projects.map((project) => (
                <div key={project.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-40 sm:h-48">
                    {project.featured_image ? (
                      <img src={project.featured_image} alt={project.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                        <i className="fas fa-image text-3xl sm:text-4xl"></i>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-[#2c5f2d] text-white text-xs px-2 py-1 sm:px-3 sm:py-1 rounded-full">
                      {project.status}
                    </div>
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1 sm:mb-2">{project.title}</h3>
                    <div className="flex items-center text-gray-500 text-xs sm:text-sm mb-2 sm:mb-3">
                      <i className="fas fa-map-marker-alt mr-1"></i>
                      {project.location || 'Rwanda'}
                    </div>
                    <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                      {project.description?.substring(0, 100)}...
                    </p>
                    <div className="flex flex-wrap justify-between items-center mb-2 sm:mb-3">
                      <span className="text-[#2c5f2d] font-bold text-xs sm:text-sm">{formatCurrency(project.raised_amount)} raised</span>
                      <span className="text-xs sm:text-sm text-gray-500">Goal: {formatCurrency(project.goal_amount)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 mb-3 sm:mb-4">
                      <div className="bg-[#2c5f2d] h-1.5 sm:h-2 rounded-full" style={{ width: `${Math.min(100, (project.raised_amount / project.goal_amount) * 100)}%` }}></div>
                    </div>
                    <Link href={`/projects/${project.id}`} className="block text-center bg-[#2c5f2d] hover:bg-[#1a3a1a] text-white py-2 rounded-lg transition-colors text-sm sm:text-base">
                      <i className="fas fa-eye mr-2"></i> View Project
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 sm:py-12 bg-white rounded-xl shadow-md px-4">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📁</div>
              <p className="text-base sm:text-lg text-gray-500">No projects available at the moment.</p>
              <p className="text-sm sm:text-base text-gray-400 mt-1">Check back soon for new initiatives.</p>
            </div>
          )}

          <div className="text-center mt-6 sm:mt-8">
            <Link href="/projects" className="inline-block bg-[#ff6b35] hover:bg-[#e55a2b] text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base transition-colors">
              View All Projects <i className="fas fa-arrow-right ml-2"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action Section - Fully Responsive */}
      <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-r from-[#2c5f2d] to-[#1a3a1a] text-white px-3 sm:px-4">
        <div className="container mx-auto px-2 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4">
            {user ? 'Welcome Back!' : 'Ready to Make a Difference?'}
          </h2>
          <p className="text-sm sm:text-base md:text-lg opacity-90 max-w-2xl mx-auto mb-4 sm:mb-6 px-2">
            {user 
              ? `Thank you for being part of our community, ${user.name || 'Member'}! Your support helps us bring hope to those who need it most.`
              : 'Join us in our mission to bring hope closer to Africa. Every contribution, big or small, makes a difference.'
            }
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center px-2">
            {user ? (
              <>
                <Link href="/donate" className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-base transition-colors">
                  <i className="fas fa-heart mr-2"></i> Make a Donation
                </Link>
                <Link href="/dashboard" className="bg-white hover:bg-gray-100 text-[#2c5f2d] px-6 sm:px-8 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-base transition-colors">
                  <i className="fas fa-user mr-2"></i> Go to Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link href="/register" className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-base transition-colors">
                  <i className="fas fa-user-plus mr-2"></i> Get Started
                </Link>
                <Link href="/login" className="bg-white hover:bg-gray-100 text-[#2c5f2d] px-6 sm:px-8 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-base transition-colors">
                  <i className="fas fa-sign-in-alt mr-2"></i> Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}