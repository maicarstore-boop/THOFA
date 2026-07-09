'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    type: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const formatCurrency = (amount) => {
    return 'RWF ' + new Intl.NumberFormat().format(amount);
  };

  const filteredProjects = projects.filter(project => {
    const searchMatch = project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                        project.description?.toLowerCase().includes(filters.search.toLowerCase());
    const locationMatch = !filters.location || 
                          project.location?.toLowerCase().includes(filters.location.toLowerCase());
    const typeMatch = !filters.type || project.project_type === filters.type;
    return searchMatch && locationMatch && typeMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-[#2c5f2d] border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium text-sm sm:text-base">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Responsive */}
      <section className="bg-gradient-to-r from-[#2c5f2d] to-[#1a3a1a] text-white py-12 sm:py-16 md:py-20 text-center px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="bg-[#ff6b35] p-2 sm:p-3 rounded-full">
              <i className="fas fa-project-diagram text-xl sm:text-2xl"></i>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
            Our Projects
          </h1>
          <p className="text-sm sm:text-base md:text-lg max-w-2xl mx-auto opacity-90 px-2">
            Explore our initiatives and see how you can make a difference in communities across Africa
          </p>
        </div>
      </section>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Filter Section - Responsive */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 className="font-semibold text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
            <i className="fas fa-filter mr-2 text-[#2c5f2d]"></i> Filter Projects
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <input
              type="text"
              name="search"
              placeholder="Search projects..."
              value={filters.search}
              onChange={handleFilter}
              className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
            />
            <input
              type="text"
              name="location"
              placeholder="Location..."
              value={filters.location}
              onChange={handleFilter}
              className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
            />
            <select
              name="type"
              value={filters.type}
              onChange={handleFilter}
              className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
            >
              <option value="">All Types</option>
              <option value="education">Education</option>
              <option value="healthcare">Healthcare</option>
              <option value="food">Food Relief</option>
              <option value="water">Clean Water</option>
              <option value="shelter">Shelter</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>

        {/* Results Count - Responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 sm:mb-6">
          <p className="text-sm sm:text-base text-gray-600">
            <span className="font-semibold text-[#2c5f2d]">{filteredProjects.length}</span> projects found
          </p>
        </div>

        {/* Projects Grid - Fully Responsive */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProjects.map((project) => {
              const progress = Math.min(100, Math.round((project.raised_amount / project.goal_amount) * 100));
              return (
                <div key={project.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <Link href={`/projects/${project.id}`}>
                    <div className="relative h-40 sm:h-48 md:h-52 bg-gray-200">
                      {project.featured_image ? (
                        <img src={project.featured_image} alt={project.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <i className="fas fa-image text-4xl sm:text-5xl"></i>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-[#2c5f2d] text-white text-xs px-2 py-1 sm:px-3 sm:py-1 rounded-full font-medium">
                        {project.status || 'Active'}
                      </div>
                    </div>
                  </Link>

                  <div className="p-4 sm:p-5">
                    <Link href={`/projects/${project.id}`}>
                      <h3 className="text-base sm:text-lg font-bold text-gray-800 hover:text-[#2c5f2d] transition-colors line-clamp-1">
                        {project.title}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center text-gray-500 text-xs sm:text-sm mt-1 mb-2 sm:mb-3">
                      <i className="fas fa-map-marker-alt mr-1 text-[#2c5f2d]"></i>
                      {project.location || 'Rwanda'}
                    </div>

                    <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                      {project.description?.substring(0, 100) || 'No description available'}...
                    </p>

                    {/* Progress Bar - Responsive */}
                    <div className="mb-2 sm:mb-3">
                      <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm text-gray-600 mb-1">
                        <span className="font-medium text-[#2c5f2d]">{formatCurrency(project.raised_amount)} raised</span>
                        <span>Goal: {formatCurrency(project.goal_amount)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                        <div className="bg-[#2c5f2d] h-2 sm:h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>

                    <Link href={`/projects/${project.id}`} className="w-full bg-[#2c5f2d] hover:bg-[#1a3a1a] text-white text-center py-2 rounded-lg transition-colors font-medium text-sm sm:text-base block">
                      <i className="fas fa-eye mr-2"></i> View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-md px-4">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🔍</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2">No projects found</h3>
            <p className="text-sm sm:text-base text-gray-500">Try adjusting your filters or check back later for new projects.</p>
          </div>
        )}
      </div>
    </div>
  );
}