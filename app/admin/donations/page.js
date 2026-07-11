'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDonations() {
  const router = useRouter();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0
  });
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    fetchDonations();
  }, [router]);

  const fetchDonations = async () => {
    try {
      const response = await fetch('/api/donations?limit=100');
      const data = await response.json();
      
      const donationsArray = Array.isArray(data) ? data : [];
      setDonations(donationsArray);
      
      const completed = donationsArray.filter(d => d.status === 'completed').length;
      const pending = donationsArray.filter(d => d.status === 'pending').length;
      const failed = donationsArray.filter(d => d.status === 'failed').length;
      
      setStats({
        total: donationsArray.length,
        completed,
        pending,
        failed
      });
    } catch (error) {
      console.error('Error fetching donations:', error);
      setDonations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdating(id);
    try {
      const response = await fetch(`/api/donations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (response.ok) {
        // Update donations list
        const updatedDonations = donations.map(d => 
          d.id === id ? { ...d, status: newStatus } : d
        );
        setDonations(updatedDonations);
        
        // Update stats
        const oldDonation = donations.find(d => d.id === id);
        if (oldDonation) {
          const oldStatus = oldDonation.status;
          setStats(prev => {
            const newStats = { ...prev };
            if (oldStatus !== newStatus) {
              newStats[oldStatus] = Math.max(0, (newStats[oldStatus] || 0) - 1);
              newStats[newStatus] = (newStats[newStatus] || 0) + 1;
            }
            return newStats;
          });
        }
        
        alert(`Donation status updated to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} successfully!`);
      } else {
        alert(data.error || 'Failed to update donation status');
      }
    } catch (error) {
      console.error('Error updating donation:', error);
      alert('Error updating donation status');
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this donation?')) return;
    
    try {
      const response = await fetch(`/api/donations/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const deletedDonation = donations.find(d => d.id === id);
        const updatedDonations = donations.filter(d => d.id !== id);
        setDonations(updatedDonations);
        
        if (deletedDonation) {
          setStats(prev => ({
            ...prev,
            total: Math.max(0, prev.total - 1),
            [deletedDonation.status]: Math.max(0, prev[deletedDonation.status] - 1)
          }));
        }
        alert('Donation deleted successfully!');
      } else {
        alert('Failed to delete donation');
      }
    } catch (error) {
      console.error('Error deleting donation:', error);
      alert('Error deleting donation');
    }
  };

  const formatCurrency = (amount) => {
    return 'RWF ' + new Intl.NumberFormat().format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: 'fa-clock',
      completed: 'fa-check-circle',
      failed: 'fa-times-circle'
    };
    return icons[status] || 'fa-circle';
  };

  const filteredDonations = Array.isArray(donations) ? donations.filter(donation => {
    const matchesFilter = filter === 'all' || donation.status === filter;
    const matchesSearch = donation.donor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          donation.donor_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          donation.projects?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  }) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#2c5f2d] border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading donations...</p>
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
              <i className="fas fa-hand-holding-heart text-[#ff6b35] mr-2"></i>
              Donations
            </h1>
            <p className="text-sm text-gray-300">View and manage all donations</p>
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
            <p className="text-sm text-gray-600">Total Donations</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-bold text-green-600">{stats.completed}</h3>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-bold text-yellow-600">{stats.pending}</h3>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-bold text-red-600">{stats.failed}</h3>
            <p className="text-sm text-gray-600">Failed</p>
          </div>
        </div>

        {/* Pending Donations Alert */}
        {stats.pending > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className="fas fa-clock text-yellow-500 text-xl"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-800">
                  {stats.pending} donation{stats.pending > 1 ? 's' : ''} pending verification
                </p>
                <p className="text-xs text-yellow-700">Select a pending donation and change its status</p>
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
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                  filter === 'completed' ? 'bg-[#2c5f2d] text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <i className="fas fa-check-circle mr-1"></i> Completed
              </button>
              <button
                onClick={() => setFilter('failed')}
                className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                  filter === 'failed' ? 'bg-[#2c5f2d] text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <i className="fas fa-times-circle mr-1"></i> Failed
              </button>
            </div>
            <div className="flex-1 relative">
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search by donor, email, or project..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2c5f2d] text-sm"
              />
            </div>
          </div>
        </div>

        {/* Donations Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDonations.length > 0 ? (
                  filteredDonations.map((donation) => (
                    <tr key={donation.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900 text-sm">{donation.donor_name}</div>
                        <div className="text-xs text-gray-500">{donation.donor_email}</div>
                        {donation.donor_phone && (
                          <div className="text-xs text-gray-400">{donation.donor_phone}</div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {donation.projects?.title || 'General Donation'}
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-[#2c5f2d]">
                        {formatCurrency(donation.amount)}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                          {donation.donation_type}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {new Date(donation.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={donation.status}
                          onChange={(e) => handleStatusUpdate(donation.id, e.target.value)}
                          disabled={updating === donation.id}
                          className={`text-xs px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-[#2c5f2d] cursor-pointer ${getStatusColor(donation.status)} ${
                            updating === donation.id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <option value="pending" className="bg-yellow-100 text-yellow-700">⏳ Pending</option>
                          <option value="completed" className="bg-green-100 text-green-700">✅ Completed</option>
                          <option value="failed" className="bg-red-100 text-red-700">❌ Failed</option>
                        </select>
                        {updating === donation.id && (
                          <span className="ml-2 text-xs text-gray-400">
                            <i className="fas fa-spinner fa-spin"></i>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleDelete(donation.id)}
                          className="text-red-600 hover:text-red-800 transition-colors text-sm"
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <div className="text-6xl mb-4">💳</div>
                      <p className="text-lg font-medium">No donations found</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search terms</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Stats */}
        {filteredDonations.length > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-500 gap-2">
            <span>
              Showing {filteredDonations.length} of {donations.length} donations
              {filter !== 'all' && ` (filtered by ${filter})`}
            </span>
            <span>
              <i className="fas fa-hand-holding-heart mr-1"></i>
              Total: {formatCurrency(donations.reduce((sum, d) => sum + d.amount, 0))}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}