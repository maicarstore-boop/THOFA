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
      {/* Hero Section with Background Image */}
      <section className="relative text-white py-20 md:py-32 text-center px-4 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/images.jpg)' }}>
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="relative z-10 container mx-auto max-w-4xl">
          <div className="flex justify-center mb-6">
            <div className="bg-[#ff6b35] p-4 rounded-full">
              <i className="fas fa-hands-helping text-4xl"></i>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight">
            {process.env.NEXT_PUBLIC_ORG_NAME || 'THOFA'}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto opacity-90 mb-8">
            {process.env.NEXT_PUBLIC_ORG_TAGLINE || 'Bringing Hope Closer to Africa'}
          </p>
          <p className="text-base md:text-lg max-w-2xl mx-auto opacity-80 mb-8">
            Together we can make a difference in the lives of those who need it most.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/projects" className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105">
              <i className="fas fa-heart mr-2"></i> Donate Now
            </Link>
            <Link href="/projects" className="border-2 border-white hover:bg-white hover:text-[#2c5f2d] text-white px-8 py-4 rounded-full font-bold text-lg transition-all">
              <i className="fas fa-eye mr-2"></i> View Projects
            </Link>
            {user ? (
              <Link href="/dashboard" className="border-2 border-white hover:bg-white hover:text-[#2c5f2d] text-white px-8 py-4 rounded-full font-bold text-lg transition-all">
                <i className="fas fa-user mr-2"></i> Dashboard
              </Link>
            ) : (
              <Link href="/login" className="border-2 border-white hover:bg-white hover:text-[#2c5f2d] text-white px-8 py-4 rounded-full font-bold text-lg transition-all">
                <i className="fas fa-sign-in-alt mr-2"></i> Login
              </Link>
            )}
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
          
          {statsLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#2c5f2d] border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading statistics...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-lg transition-shadow">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-hand-holding-heart text-2xl text-[#2c5f2d]"></i>
                </div>
                <div className="text-2xl font-bold text-[#2c5f2d]">
                  {stats ? formatCurrency(stats.totalRaised) : 'RWF 0'}
                </div>
                <div className="text-sm text-gray-600">Total Raised</div>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-lg transition-shadow">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-project-diagram text-2xl text-blue-600"></i>
                </div>
                <div className="text-2xl font-bold text-[#2c5f2d]">
                  {stats ? stats.totalProjects : 0}
                </div>
                <div className="text-sm text-gray-600">Projects</div>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-lg transition-shadow">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-smile text-2xl text-yellow-600"></i>
                </div>
                <div className="text-2xl font-bold text-[#2c5f2d]">
                  {stats ? stats.totalBeneficiaries?.toLocaleString() + '+' : '0+'}
                </div>
                <div className="text-sm text-gray-600">Lives Impacted</div>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-lg transition-shadow">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-users text-2xl text-purple-600"></i>
                </div>
                <div className="text-2xl font-bold text-[#2c5f2d]">
                  {stats ? stats.totalVolunteers + '+' : '0+'}
                </div>
                <div className="text-sm text-gray-600">Volunteers</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2c5f2d]">Featured Projects</h2>
            <p className="text-gray-600 mt-2">Help us make a difference through these initiatives</p>
          </div>

          {projectsLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#2c5f2d] border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading projects...</p>
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {projects.map((project) => (
                <div key={project.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-48">
                    {project.featured_image ? (
                      <img src={project.featured_image} alt={project.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                        <i className="fas fa-image text-4xl"></i>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-[#2c5f2d] text-white text-xs px-3 py-1 rounded-full">
                      {project.status}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{project.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <i className="fas fa-map-marker-alt mr-1"></i>
                      {project.location || 'Rwanda'}
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {project.description?.substring(0, 120)}...
                    </p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[#2c5f2d] font-bold">{formatCurrency(project.raised_amount)} raised</span>
                      <span className="text-sm text-gray-500">Goal: {formatCurrency(project.goal_amount)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div className="bg-[#2c5f2d] h-2 rounded-full" style={{ width: `${Math.min(100, (project.raised_amount / project.goal_amount) * 100)}%` }}></div>
                    </div>
                    <Link href={`/projects/${project.id}`} className="block text-center bg-[#2c5f2d] hover:bg-[#1a3a1a] text-white py-2 rounded-lg transition-colors">
                      <i className="fas fa-eye mr-2"></i> View Project
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <div className="text-6xl mb-4">📁</div>
              <p className="text-gray-500 text-lg">No projects available at the moment.</p>
              <p className="text-gray-400 text-sm mt-1">Check back soon for new initiatives.</p>
            </div>
          )}

          <div className="text-center mt-8">
            <Link href="/projects" className="inline-block bg-[#ff6b35] hover:bg-[#e55a2b] text-white px-8 py-3 rounded-lg font-medium transition-colors">
              View All Projects <i className="fas fa-arrow-right ml-2"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-r from-[#2c5f2d] to-[#1a3a1a] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {user ? 'Welcome Back!' : 'Ready to Make a Difference?'}
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            {user 
              ? `Thank you for being part of our community, ${user.name || 'Member'}! Your support helps us bring hope to those who need it most.`
              : 'Join us in our mission to bring hope closer to Africa. Every contribution, big or small, makes a difference.'
            }
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {user ? (
              <>
                <Link href="/donate" className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white px-8 py-3 rounded-full font-bold transition-colors">
                  <i className="fas fa-heart mr-2"></i> Make a Donation
                </Link>
                <Link href="/dashboard" className="bg-white hover:bg-gray-100 text-[#2c5f2d] px-8 py-3 rounded-full font-bold transition-colors">
                  <i className="fas fa-user mr-2"></i> Go to Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link href="/register" className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white px-8 py-3 rounded-full font-bold transition-colors">
                  <i className="fas fa-user-plus mr-2"></i> Get Started
                </Link>
                <Link href="/login" className="bg-white hover:bg-gray-100 text-[#2c5f2d] px-8 py-3 rounded-full font-bold transition-colors">
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