'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminVolunteers() {
  const router = useRouter();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updating, setUpdating] = useState(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    fetchVolunteers();
  }, [router]);

  const fetchVolunteers = async () => {
    try {
      const response = await fetch('/api/volunteers?limit=100');
      const data = await response.json();
      
      const volunteersArray = Array.isArray(data) ? data : [];
      setVolunteers(volunteersArray);
      
      const pending = volunteersArray.filter(v => v.status === 'pending').length;
      const approved = volunteersArray.filter(v => v.status === 'approved').length;
      const rejected = volunteersArray.filter(v => v.status === 'rejected').length;
      
      setStats({
        total: volunteersArray.length,
        pending,
        approved,
        rejected
      });
    } catch (error) {
      console.error('Error fetching volunteers:', error);
      setVolunteers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdating(id);
    try {
      const response = await fetch('/api/volunteers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });

      const data = await response.json();

      if (response.ok) {
        const updatedVolunteers = volunteers.map(v => 
          v.id === id ? { ...v, status: newStatus } : v
        );
        setVolunteers(updatedVolunteers);
        
        const oldVolunteer = volunteers.find(v => v.id === id);
        if (oldVolunteer) {
          const oldStatus = oldVolunteer.status;
          setStats(prev => {
            const newStats = { ...prev };
            if (oldStatus !== newStatus) {
              newStats[oldStatus] = Math.max(0, (newStats[oldStatus] || 0) - 1);
              newStats[newStatus] = (newStats[newStatus] || 0) + 1;
            }
            return newStats;
          });
        }
        
        alert(`Volunteer status updated to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}!`);
      } else {
        alert(data.error || 'Failed to update volunteer status');
      }
    } catch (error) {
      console.error('Error updating volunteer:', error);
      alert('Error updating volunteer status');
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this volunteer application?')) return;
    
    try {
      const response = await fetch(`/api/volunteers?id=${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const deletedVolunteer = volunteers.find(v => v.id === id);
        const updatedVolunteers = volunteers.filter(v => v.id !== id);
        setVolunteers(updatedVolunteers);
        
        if (deletedVolunteer) {
          setStats(prev => ({
            ...prev,
            total: Math.max(0, prev.total - 1),
            [deletedVolunteer.status]: Math.max(0, prev[deletedVolunteer.status] - 1)
          }));
        }
        alert('Volunteer application deleted successfully!');
      } else {
        alert('Failed to delete volunteer application');
      }
    } catch (error) {
      console.error('Error deleting volunteer:', error);
      alert('Error deleting volunteer application');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: 'fa-clock',
      approved: 'fa-check-circle',
      rejected: 'fa-times-circle'
    };
    return icons[status] || 'fa-circle';
  };

  const filteredVolunteers = Array.isArray(volunteers) ? volunteers.filter(volunteer => {
    const matchesFilter = filter === 'all' || volunteer.status === filter;
    const matchesSearch = volunteer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          volunteer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          volunteer.skills?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  }) : [];

  const viewDetails = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#2c5f2d] border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading volunteers...</p>
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
              <i className="fas fa-users text-[#ff6b35] mr-2"></i>
              Volunteers
            </h1>
            <p className="text-sm text-gray-300">Manage volunteer applications</p>
          </div>
          <Link href="/admin/dashboard" className="text-white hover:text-[#ff6b35] transition-colors text-sm">
            <i className="fas fa-arrow-left mr-1"></i> Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-bold text-[#2c5f2d]">{stats.total}</h3>
            <p className="text-sm text-gray-600">Total Applications</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-bold text-yellow-600">{stats.pending}</h3>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-bold text-green-600">{stats.approved}</h3>
            <p className="text-sm text-gray-600">Approved</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-bold text-red-600">{stats.rejected}</h3>
            <p className="text-sm text-gray-600">Rejected</p>
          </div>
        </div>

        {/* Pending Volunteers Alert */}
        {stats.pending > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className="fas fa-clock text-yellow-500 text-xl"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-800">
                  {stats.pending} volunteer application{stats.pending > 1 ? 's' : ''} pending review
                </p>
                <p className="text-xs text-yellow-700">Review and approve or reject applications</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                  filter === 'all' ? 'bg-[#2c5f2d] text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                  filter === 'pending' ? 'bg-[#2c5f2d] text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <i className="fas fa-clock mr-1"></i> Pending
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                  filter === 'approved' ? 'bg-[#2c5f2d] text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <i className="fas fa-check-circle mr-1"></i> Approved
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                  filter === 'rejected' ? 'bg-[#2c5f2d] text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <i className="fas fa-times-circle mr-1"></i> Rejected
              </button>
            </div>
            <div className="flex-1 relative">
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search by name, email, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2c5f2d] text-sm"
              />
            </div>
          </div>
        </div>

        {/* Volunteers Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volunteer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredVolunteers.length > 0 ? (
                  filteredVolunteers.map((volunteer) => (
                    <tr key={volunteer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900 text-sm">{volunteer.full_name}</div>
                        <div className="text-xs text-gray-500 line-clamp-1">{volunteer.message?.substring(0, 30)}...</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-700">{volunteer.email}</div>
                        <div className="text-xs text-gray-500">{volunteer.phone}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-xs text-gray-600 line-clamp-2">
                          {volunteer.skills || 'No skills listed'}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {formatDate(volunteer.created_at)}
                      </td>
                      <td className="px-4 py-4">
                        {/* Status dropdown - ALL volunteers can change status */}
                        <select
                          value={volunteer.status}
                          onChange={(e) => handleStatusUpdate(volunteer.id, e.target.value)}
                          disabled={updating === volunteer.id}
                          className={`text-xs px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-[#2c5f2d] cursor-pointer ${getStatusColor(volunteer.status)} ${
                            updating === volunteer.id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <option value="pending" className="bg-yellow-100 text-yellow-700">⏳ Pending</option>
                          <option value="approved" className="bg-green-100 text-green-700">✅ Approved</option>
                          <option value="rejected" className="bg-red-100 text-red-700">❌ Rejected</option>
                        </select>
                        {updating === volunteer.id && (
                          <span className="ml-2 text-xs text-gray-400">
                            <i className="fas fa-spinner fa-spin"></i>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewDetails(volunteer)}
                            className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(volunteer.id)}
                            className="text-red-600 hover:text-red-800 transition-colors text-sm"
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <div className="text-6xl mb-4">👥</div>
                      <p className="text-lg font-medium">No volunteers found</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search terms</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Stats */}
        {filteredVolunteers.length > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-500 gap-2">
            <span>
              Showing {filteredVolunteers.length} of {volunteers.length} volunteers
              {filter !== 'all' && ` (filtered by ${filter})`}
            </span>
          </div>
        )}
      </div>

      {/* Volunteer Details Modal */}
      {showDetailsModal && selectedVolunteer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#2c5f2d]">Volunteer Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium text-gray-900">{selectedVolunteer.full_name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{selectedVolunteer.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{selectedVolunteer.phone || 'Not provided'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Availability</p>
                <p className="font-medium text-gray-900 capitalize">{selectedVolunteer.availability || 'Flexible'}</p>
              </div>

              {selectedVolunteer.skills && (
                <div>
                  <p className="text-sm text-gray-500">Skills / Expertise</p>
                  <p className="font-medium text-gray-900 whitespace-pre-wrap">{selectedVolunteer.skills}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500">Application Date</p>
                <p className="font-medium text-gray-900">{formatDate(selectedVolunteer.created_at)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`text-sm px-3 py-1 rounded-full ${getStatusColor(selectedVolunteer.status)}`}>
                  <i className={`fas ${getStatusIcon(selectedVolunteer.status)} mr-1`}></i>
                  {selectedVolunteer.status.charAt(0).toUpperCase() + selectedVolunteer.status.slice(1)}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500">Message</p>
                <div className="bg-gray-50 p-3 rounded-lg mt-1">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedVolunteer.message}</p>
                </div>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                {selectedVolunteer.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedVolunteer.id, 'approved');
                        setShowDetailsModal(false);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
                    >
                      <i className="fas fa-check mr-2"></i> Approve
                    </button>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedVolunteer.id, 'rejected');
                        setShowDetailsModal(false);
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
                    >
                      <i className="fas fa-times mr-2"></i> Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}