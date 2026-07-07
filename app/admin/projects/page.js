'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminProjects() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjects, setSelectedProjects] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    fetchProjects();
  }, [router]);

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

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setProjects(projects.filter(p => p.id !== id));
        alert('Project deleted successfully');
      } else {
        alert('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProjects.length === 0) return;
    if (!confirm(`Delete ${selectedProjects.length} selected projects?`)) return;

    try {
      for (const id of selectedProjects) {
        await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      }
      setProjects(projects.filter(p => !selectedProjects.includes(p.id)));
      setSelectedProjects([]);
      alert('Selected projects deleted successfully');
    } catch (error) {
      console.error('Error deleting projects:', error);
      alert('Error deleting projects');
    }
  };

  const toggleSelect = (id) => {
    setSelectedProjects(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const formatCurrency = (amount) => {
    return 'RWF ' + new Intl.NumberFormat().format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      upcoming: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      active: 'fa-play-circle',
      upcoming: 'fa-clock',
      completed: 'fa-check-circle'
    };
    return icons[status] || 'fa-circle';
  };

  const filteredProjects = projects.filter(project => {
    const matchesFilter = filter === 'all' || project.status === filter;
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.location?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    upcoming: projects.filter(p => p.status === 'upcoming').length,
    completed: projects.filter(p => p.status === 'completed').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#2c5f2d] border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1a3a1a] text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              <i className="fas fa-project-diagram text-[#ff6b35] mr-2"></i>
              Projects
            </h1>
            <p className="text-sm text-gray-300">Manage all your charity projects</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-white hover:text-[#ff6b35] transition-colors text-sm">
              <i className="fas fa-arrow-left mr-1"></i> Back
            </Link>
            <Link href="/admin/projects/add" className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2">
              <i className="fas fa-plus"></i> Add Project
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-bold text-[#2c5f2d]">{stats.total}</h3>
            <p className="text-sm text-gray-600">Total Projects</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-bold text-green-600">{stats.active}</h3>
            <p className="text-sm text-gray-600">
              <i className="fas fa-play-circle mr-1"></i> Active
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-bold text-yellow-600">{stats.upcoming}</h3>
            <p className="text-sm text-gray-600">
              <i className="fas fa-clock mr-1"></i> Upcoming
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-bold text-gray-600">{stats.completed}</h3>
            <p className="text-sm text-gray-600">
              <i className="fas fa-check-circle mr-1"></i> Completed
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'all' ? 'bg-[#2c5f2d] text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'active' ? 'bg-[#2c5f2d] text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <i className="fas fa-play-circle mr-1"></i> Active
              </button>
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'upcoming' ? 'bg-[#2c5f2d] text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <i className="fas fa-clock mr-1"></i> Upcoming
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'completed' ? 'bg-[#2c5f2d] text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <i className="fas fa-check-circle mr-1"></i> Completed
              </button>
            </div>
            <div className="flex-1 relative">
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
              />
            </div>
            {selectedProjects.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <i className="fas fa-trash mr-1"></i> Delete Selected ({selectedProjects.length})
              </button>
            )}
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProjects(filteredProjects.map(p => p.id));
                        } else {
                          setSelectedProjects([]);
                        }
                      }}
                      checked={selectedProjects.length === filteredProjects.length && filteredProjects.length > 0}
                      className="h-4 w-4 text-[#2c5f2d] focus:ring-[#2c5f2d] border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Raised</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProjects.includes(project.id)}
                        onChange={() => toggleSelect(project.id)}
                        className="h-4 w-4 text-[#2c5f2d] focus:ring-[#2c5f2d] border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {project.featured_image ? (
                            <img src={project.featured_image} alt={project.title} className="w-full h-full object-cover" />
                          ) : (
                            <i className="fas fa-image text-gray-400"></i>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{project.title}</div>
                          <div className="text-sm text-gray-500">
                            <i className="fas fa-map-marker-alt mr-1"></i>
                            {project.location || 'Rwanda'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 capitalize">
                        {project.project_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(project.goal_amount)}</td>
                    <td className="px-6 py-4 text-sm text-[#2c5f2d] font-medium">{formatCurrency(project.raised_amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(project.status)} flex items-center gap-1 w-fit`}>
                        <i className={`fas ${getStatusIcon(project.status)}`}></i>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/projects/edit/${project.id}`}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </Link>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                        <Link
                          href={`/projects/${project.id}`}
                          target="_blank"
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="View"
                        >
                          <i className="fas fa-eye"></i>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProjects.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <div className="text-6xl mb-4">📁</div>
                      <p className="text-lg font-medium">No projects found</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or create a new project</p>
                      <Link href="/admin/projects/add" className="inline-block mt-4 bg-[#2c5f2d] text-white px-6 py-2 rounded-lg hover:bg-[#1a3a1a] transition-colors">
                        <i className="fas fa-plus mr-2"></i> Create New Project
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Stats */}
        {filteredProjects.length > 0 && (
          <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
            <span>
              Showing {filteredProjects.length} of {projects.length} projects
              {filter !== 'all' && ` (filtered by ${filter})`}
            </span>
            <span>
              <i className="fas fa-users mr-1"></i>
              {filteredProjects.reduce((sum, p) => sum + (p.beneficiaries || 0), 0)} total beneficiaries
            </span>
          </div>
        )}
      </div>
    </div>
  );
}