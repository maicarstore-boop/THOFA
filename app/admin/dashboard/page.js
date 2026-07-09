'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
);

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    upcomingProjects: 0,
    completedProjects: 0,
    totalRaised: 0,
    totalVolunteers: 0,
    unreadMessages: 0,
    totalBeneficiaries: 0,
    totalDonations: 0,
    totalBlogPosts: 0
  });
  const [user, setUser] = useState(null);
  const [recentDonations, setRecentDonations] = useState([]);
  const [recentVolunteers, setRecentVolunteers] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [monthlyDonations, setMonthlyDonations] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const userData = localStorage.getItem('admin_user');
    
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const responses = await Promise.allSettled([
        fetch('/api/stats', { signal: controller.signal }),
        fetch('/api/donations?limit=5', { signal: controller.signal }),
        fetch('/api/volunteers?limit=5', { signal: controller.signal }),
        fetch('/api/contact?limit=5', { signal: controller.signal }),
        fetch('/api/donations/monthly', { signal: controller.signal })
      ]);
      
      clearTimeout(timeoutId);
      
      const results = responses.map(async (r, index) => {
        if (r.status === 'fulfilled' && r.value.ok) {
          return r.value.json();
        }
        return index === 0 ? {
          totalProjects: 0,
          activeProjects: 0,
          upcomingProjects: 0,
          completedProjects: 0,
          totalRaised: 0,
          totalVolunteers: 0,
          unreadMessages: 0,
          totalBeneficiaries: 0,
          totalDonations: 0,
          totalBlogPosts: 0
        } : [];
      });

      const [statsData, donationsData, volunteersData, messagesData, monthlyData] = await Promise.all(results);
      
      setStats(statsData || {
        totalProjects: 0,
        activeProjects: 0,
        upcomingProjects: 0,
        completedProjects: 0,
        totalRaised: 0,
        totalVolunteers: 0,
        unreadMessages: 0,
        totalBeneficiaries: 0,
        totalDonations: 0,
        totalBlogPosts: 0
      });
      setRecentDonations(donationsData || []);
      setRecentVolunteers(volunteersData || []);
      setRecentMessages(messagesData || []);
      setMonthlyDonations(monthlyData || []);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    sessionStorage.removeItem('admin_stats');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.replace('/admin/login');
  };

  const formatCurrency = (amount) => {
    return 'RWF ' + new Intl.NumberFormat().format(amount || 0);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      failed: 'bg-red-100 text-red-700',
      read: 'bg-gray-100 text-gray-700',
      unread: 'bg-blue-100 text-blue-700',
      active: 'bg-green-100 text-green-700',
      upcoming: 'bg-yellow-100 text-yellow-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  // Chart Data
  const donationChartData = {
    labels: monthlyDonations.length > 0 ? monthlyDonations.map(d => d.month) : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Donations (RWF)',
        data: monthlyDonations.length > 0 ? monthlyDonations.map(d => d.total) : [0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(44, 95, 45, 0.2)',
        borderColor: '#2c5f2d',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const projectStatusData = {
    labels: ['Active', 'Upcoming', 'Completed'],
    datasets: [
      {
        data: [
          stats?.activeProjects || 0,
          stats?.upcomingProjects || 0,
          stats?.completedProjects || 0,
        ],
        backgroundColor: ['#2c5f2d', '#ff6b35', '#6c757d'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return 'RWF ' + value.toLocaleString();
          }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-[#2c5f2d] to-[#1a3a1a] rounded-xl shadow-lg p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">
                <i className="fas fa-wave-square mr-2"></i>
                Welcome back, {user?.username || 'Admin'}!
              </h2>
              <p className="text-gray-300 mt-1">Here's what's happening with your organization today.</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/projects/add"
                className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <i className="fas fa-plus"></i> New Project
              </Link>
              <Link
                href="/admin/blog/add"
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <i className="fas fa-newspaper"></i> Write Post
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <i className="fas fa-project-diagram text-2xl text-[#2c5f2d]"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{stats?.totalProjects || 0}</h3>
                <p className="text-sm text-gray-500">Total Projects</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <i className="fas fa-hand-holding-heart text-2xl text-blue-600"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{stats ? formatCurrency(stats.totalRaised) : 'RWF 0'}</h3>
                <p className="text-sm text-gray-500">Total Donations</p>
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
                <i className="fas fa-envelope text-2xl text-purple-600"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{stats?.unreadMessages || 0}</h3>
                <p className="text-sm text-gray-500">Unread Messages</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              <i className="fas fa-chart-line text-[#2c5f2d] mr-2"></i>
              Donation Trends
            </h3>
            <div className="h-64">
              {monthlyDonations.length > 0 ? (
                <Line data={donationChartData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>No donation data available</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              <i className="fas fa-chart-pie text-[#2c5f2d] mr-2"></i>
              Project Status
            </h3>
            <div className="h-64 flex items-center justify-center">
              {(stats?.activeProjects > 0 || stats?.upcomingProjects > 0 || stats?.completedProjects > 0) ? (
                <div className="w-64 h-64">
                  <Doughnut data={projectStatusData} options={doughnutOptions} />
                </div>
              ) : (
                <p className="text-gray-400">No project data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                <i className="fas fa-clock text-[#2c5f2d] mr-2"></i>
                Recent Donations
              </h3>
              <Link href="/admin/donations" className="text-[#2c5f2d] hover:underline text-sm">
                View All →
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
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(donation.status)}`}>
                        {donation.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-inbox text-4xl mb-2"></i>
                <p>No donations yet</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                <i className="fas fa-user-plus text-[#2c5f2d] mr-2"></i>
                Recent Volunteers
              </h3>
              <Link href="/admin/volunteers" className="text-[#2c5f2d] hover:underline text-sm">
                View All →
              </Link>
            </div>
            {recentVolunteers.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {recentVolunteers.map((volunteer) => (
                  <div key={volunteer.id} className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <div>
                      <p className="font-medium text-gray-800">{volunteer.full_name}</p>
                      <p className="text-sm text-gray-500">{volunteer.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(volunteer.status)}`}>
                      {volunteer.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-users text-4xl mb-2"></i>
                <p>No volunteers yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            <i className="fas fa-bolt text-[#2c5f2d] mr-2"></i>
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <Link
              href="/admin/projects"
              className="bg-gray-50 hover:bg-[#2c5f2d] hover:text-white p-4 rounded-lg text-center transition-colors group"
            >
              <i className="fas fa-project-diagram text-2xl block mb-2 text-[#2c5f2d] group-hover:text-white"></i>
              <span className="text-sm">Projects</span>
            </Link>
            <Link
              href="/admin/projects/add"
              className="bg-gray-50 hover:bg-[#2c5f2d] hover:text-white p-4 rounded-lg text-center transition-colors group"
            >
              <i className="fas fa-plus-circle text-2xl block mb-2 text-[#2c5f2d] group-hover:text-white"></i>
              <span className="text-sm">Add Project</span>
            </Link>
            <Link
              href="/admin/donations"
              className="bg-gray-50 hover:bg-[#2c5f2d] hover:text-white p-4 rounded-lg text-center transition-colors group"
            >
              <i className="fas fa-hand-holding-heart text-2xl block mb-2 text-[#2c5f2d] group-hover:text-white"></i>
              <span className="text-sm">Donations</span>
            </Link>
            <Link
              href="/admin/volunteers"
              className="bg-gray-50 hover:bg-[#2c5f2d] hover:text-white p-4 rounded-lg text-center transition-colors group"
            >
              <i className="fas fa-users text-2xl block mb-2 text-[#2c5f2d] group-hover:text-white"></i>
              <span className="text-sm">Volunteers</span>
            </Link>
            <Link
              href="/admin/messages"
              className="bg-gray-50 hover:bg-[#2c5f2d] hover:text-white p-4 rounded-lg text-center transition-colors group"
            >
              <i className="fas fa-envelope text-2xl block mb-2 text-[#2c5f2d] group-hover:text-white"></i>
              <span className="text-sm">Messages</span>
            </Link>
            <Link
              href="/admin/blog"
              className="bg-gray-50 hover:bg-[#2c5f2d] hover:text-white p-4 rounded-lg text-center transition-colors group"
            >
              <i className="fas fa-newspaper text-2xl block mb-2 text-[#2c5f2d] group-hover:text-white"></i>
              <span className="text-sm">Blog</span>
            </Link>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            <i className="fas fa-sitemap text-[#2c5f2d] mr-2"></i>
            Admin Navigation
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <Link
              href="/admin/dashboard"
              className="bg-[#2c5f2d] text-white p-4 rounded-lg text-center hover:bg-[#1a3a1a] transition-colors"
            >
              <i className="fas fa-tachometer-alt text-2xl block mb-2"></i>
              <span className="text-sm font-medium">Dashboard</span>
            </Link>

            <Link
              href="/admin/projects"
              className="bg-gray-50 hover:bg-[#2c5f2d] hover:text-white p-4 rounded-lg text-center transition-colors group"
            >
              <i className="fas fa-project-diagram text-2xl block mb-2 text-[#2c5f2d] group-hover:text-white"></i>
              <span className="text-sm">Projects</span>
            </Link>

            <Link
              href="/admin/projects/add"
              className="bg-gray-50 hover:bg-[#2c5f2d] hover:text-white p-4 rounded-lg text-center transition-colors group"
            >
              <i className="fas fa-plus-circle text-2xl block mb-2 text-[#2c5f2d] group-hover:text-white"></i>
              <span className="text-sm">Add Project</span>
            </Link>

            <Link
              href="/admin/donations"
              className="bg-gray-50 hover:bg-[#2c5f2d] hover:text-white p-4 rounded-lg text-center transition-colors group"
            >
              <i className="fas fa-hand-holding-heart text-2xl block mb-2 text-[#2c5f2d] group-hover:text-white"></i>
              <span className="text-sm">Donations</span>
            </Link>

            <Link
              href="/admin/volunteers"
              className="bg-gray-50 hover:bg-[#2c5f2d] hover:text-white p-4 rounded-lg text-center transition-colors group"
            >
              <i className="fas fa-users text-2xl block mb-2 text-[#2c5f2d] group-hover:text-white"></i>
              <span className="text-sm">Volunteers</span>
            </Link>

            <Link
              href="/admin/messages"
              className="bg-gray-50 hover:bg-[#2c5f2d] hover:text-white p-4 rounded-lg text-center transition-colors group"
            >
              <i className="fas fa-envelope text-2xl block mb-2 text-[#2c5f2d] group-hover:text-white"></i>
              <span className="text-sm">Messages</span>
            </Link>

            <Link
              href="/admin/blog"
              className="bg-gray-50 hover:bg-[#2c5f2d] hover:text-white p-4 rounded-lg text-center transition-colors group"
            >
              <i className="fas fa-newspaper text-2xl block mb-2 text-[#2c5f2d] group-hover:text-white"></i>
              <span className="text-sm">Blog</span>
            </Link>

            <Link
              href="/admin/blog/add"
              className="bg-gray-50 hover:bg-[#2c5f2d] hover:text-white p-4 rounded-lg text-center transition-colors group"
            >
              <i className="fas fa-plus-circle text-2xl block mb-2 text-[#2c5f2d] group-hover:text-white"></i>
              <span className="text-sm">New Post</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}