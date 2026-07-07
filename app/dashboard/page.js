'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentDonations, setRecentDonations] = useState([]);
  const [userDonations, setUserDonations] = useState([]);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('thofa_user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    try {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      fetchDashboardData(parsed);
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchDashboardData = async (userData) => {
    try {
      const [statsRes, donationsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/donations?limit=5')
      ]);

      const statsData = await statsRes.json();
      const donationsData = await donationsRes.json();

      setStats(statsData);
      setRecentDonations(donationsData || []);
      
      // Filter user's donations (in a real app, this would be filtered by user email)
      if (userData.email) {
        const userDonationsFiltered = donationsData.filter(
          d => d.donor_email === userData.email
        );
        setUserDonations(userDonationsFiltered);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('thofa_user');
    router.push('/');
  };

  const formatCurrency = (amount) => {
    return 'RWF ' + new Intl.NumberFormat().format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#2c5f2d] border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <header className="bg-gradient-to-r from-[#2c5f2d] to-[#1a3a1a] text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#ff6b35] p-2 rounded-lg">
              <i className="fas fa-user text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold">My Dashboard</h1>
              <p className="text-xs text-gray-300">Welcome back, {user.name || 'Member'}!</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/profile" 
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2"
            >
              <i className="fas fa-user-edit"></i>
              <span className="hidden sm:inline">Profile</span>
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2"
            >
              <i className="fas fa-sign-out-alt"></i>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#2c5f2d]">
                <i className="fas fa-wave-square mr-2"></i>
                Welcome, {user.name || 'Member'}!
              </h2>
              <p className="text-gray-600 mt-1">
                {user.email} • Member since {user.registeredAt ? formatDate(user.registeredAt) : 'N/A'}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/donate"
                className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <i className="fas fa-heart"></i> Donate Now
              </Link>
              <Link
                href="/volunteer"
                className="bg-[#2c5f2d] hover:bg-[#1a3a1a] text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <i className="fas fa-hands-helping"></i> Volunteer
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <i className="fas fa-hand-holding-heart text-2xl text-[#2c5f2d]"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{stats ? formatCurrency(stats.totalRaised) : 'RWF 0'}</h3>
                <p className="text-sm text-gray-500">Total Raised</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <i className="fas fa-project-diagram text-2xl text-blue-600"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{stats?.totalProjects || 0}</h3>
                <p className="text-sm text-gray-500">Projects</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <i className="fas fa-users text-2xl text-yellow-600"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{stats?.totalVolunteers || 0}</h3>
                <p className="text-sm text-gray-500">Volunteers</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <i className="fas fa-smile text-2xl text-purple-600"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{stats?.totalBeneficiaries?.toLocaleString() || 0}+</h3>
                <p className="text-sm text-gray-500">Lives Impacted</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              <i className="fas fa-bolt text-[#2c5f2d] mr-2"></i>
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/donate"
                className="bg-gray-50 hover:bg-[#2c5f2d] hover:text-white p-4 rounded-lg text-center transition-colors group"
              >
                <i className="fas fa-hand-holding-heart text-2xl block mb-2 text-[#2c5f2d] group-hover:text-white"></i>
                <span className="text-sm">Make a Donation</span>
              </Link>
              <Link
                href="/volunteer"
                className="bg-gray-50 hover:bg-[#2c5f2d] hover:text-white p-4 rounded-lg text-center transition-colors group"
              >
                <i className="fas fa-users text-2xl block mb-2 text-[#2c5f2d] group-hover:text-white"></i>
                <span className="text-sm">Volunteer</span>
              </Link>
              <Link
                href="/projects"
                className="bg-gray-50 hover:bg-[#2c5f2d] hover:text-white p-4 rounded-lg text-center transition-colors group"
              >
                <i className="fas fa-project-diagram text-2xl block mb-2 text-[#2c5f2d] group-hover:text-white"></i>
                <span className="text-sm">View Projects</span>
              </Link>
              <Link
                href="/profile"
                className="bg-gray-50 hover:bg-[#2c5f2d] hover:text-white p-4 rounded-lg text-center transition-colors group"
              >
                <i className="fas fa-user text-2xl block mb-2 text-[#2c5f2d] group-hover:text-white"></i>
                <span className="text-sm">My Profile</span>
              </Link>
            </div>
          </div>

          {/* Recent Donations */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                <i className="fas fa-clock text-[#2c5f2d] mr-2"></i>
                Recent Donations
              </h3>
              <Link href="/donate" className="text-[#2c5f2d] hover:underline text-sm">
                Donate Now →
              </Link>
            </div>
            {recentDonations.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {recentDonations.map((donation) => (
                  <div key={donation.id} className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <div>
                      <p className="font-medium text-gray-800">{donation.donor_name}</p>
                      <p className="text-sm text-gray-500">{donation.projects?.title || 'General Donation'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#2c5f2d]">{formatCurrency(donation.amount)}</p>
                      <span className="text-xs text-gray-400">{formatDate(donation.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-inbox text-4xl mb-2"></i>
                <p>No donations yet</p>
                <Link href="/donate" className="text-[#2c5f2d] hover:underline text-sm mt-2 inline-block">
                  Make your first donation
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Your Donations */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              <i className="fas fa-history text-[#2c5f2d] mr-2"></i>
              Your Donation History
            </h3>
          </div>
          {userDonations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {userDonations.map((donation) => (
                    <tr key={donation.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(donation.created_at)}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{donation.projects?.title || 'General Donation'}</td>
                      <td className="px-4 py-3 text-sm font-medium text-[#2c5f2d]">{formatCurrency(donation.amount)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          donation.status === 'completed' 
                            ? 'bg-green-100 text-green-700' 
                            : donation.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {donation.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-heart text-4xl mb-2"></i>
              <p>You haven't made any donations yet</p>
              <Link href="/donate" className="text-[#2c5f2d] hover:underline text-sm mt-2 inline-block">
                Start your giving journey
              </Link>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-[#2c5f2d] to-[#1a3a1a] rounded-xl p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">
            <i className="fas fa-hand-holding-heart mr-2"></i>
            Make a Difference Today
          </h3>
          <p className="opacity-90 mb-4">
            Your support helps us bring hope to those who need it most.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/donate"
              className="bg-[#ff6b35] hover:bg-[#e55a2b] px-6 py-2 rounded-lg transition-colors font-medium"
            >
              <i className="fas fa-heart mr-2"></i> Donate Now
            </Link>
            <Link
              href="/volunteer"
              className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-lg transition-colors font-medium"
            >
              <i className="fas fa-hands-helping mr-2"></i> Volunteer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}