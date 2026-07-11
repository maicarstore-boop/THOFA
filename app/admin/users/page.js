'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminUsers() {
  const router = useRouter();
  const [adminUsers, setAdminUsers] = useState([]);
  const [clientUsers, setClientUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('admins');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    full_name: '',
    role: 'editor'
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [adminsRes, clientsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/clients')
      ]);

      const adminsData = await adminsRes.json();
      const clientsData = await clientsRes.json();

      setAdminUsers(Array.isArray(adminsData) ? adminsData : []);
      setClientUsers(Array.isArray(clientsData) ? clientsData : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setAdminUsers([]);
      setClientUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setAdminUsers([data.user, ...adminUsers]);
        setShowAddModal(false);
        setFormData({
          username: '',
          password: '',
          email: '',
          full_name: '',
          role: 'editor'
        });
        setMessage('Admin user added successfully!');
        setTimeout(() => setMessage(''), 3000);
        fetchUsers();
      } else {
        alert(data.error || 'Failed to add admin user');
      }
    } catch (error) {
      console.error('Error adding admin:', error);
      alert('Error adding admin user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBlockAdmin = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    const action = newStatus ? 'block' : 'unblock';
    
    if (!confirm(`Are you sure you want to ${action} this admin user?`)) return;

    setUpdating(id);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_blocked: newStatus })
      });

      const data = await response.json();

      if (response.ok) {
        setAdminUsers(adminUsers.map(user =>
          user.id === id ? { ...user, is_blocked: newStatus } : user
        ));
        alert(`Admin user ${action}ed successfully!`);
      } else {
        alert(data.error || `Failed to ${action} user`);
      }
    } catch (error) {
      console.error('Error updating admin:', error);
      alert(`Error ${action}ing user`);
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!confirm('Are you sure you want to delete this admin user?')) return;

    try {
      const response = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setAdminUsers(adminUsers.filter(user => user.id !== id));
        alert('Admin user deleted successfully!');
      } else {
        alert('Failed to delete admin user');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert('Error deleting admin user');
    }
  };

  const handleBlockClient = async (email, currentStatus) => {
    const newStatus = !currentStatus;
    const action = newStatus ? 'block' : 'unblock';
    
    if (!confirm(`Are you sure you want to ${action} this client user?`)) return;

    setUpdating(email);
    try {
      const response = await fetch('/api/admin/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, is_blocked: newStatus })
      });

      const data = await response.json();

      if (response.ok) {
        setClientUsers(clientUsers.map(user =>
          user.email === email ? { ...user, is_blocked: newStatus } : user
        ));
        alert(`Client user ${action}ed successfully!`);
      } else {
        alert(data.error || `Failed to ${action} user`);
      }
    } catch (error) {
      console.error('Error blocking client:', error);
      alert(`Error ${action}ing user`);
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteClient = async (email) => {
    if (!confirm(`Are you sure you want to delete client user: ${email}?`)) return;

    try {
      const response = await fetch(`/api/admin/clients?email=${encodeURIComponent(email)}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setClientUsers(clientUsers.filter(user => user.email !== email));
        alert('Client user deleted successfully!');
      } else {
        alert('Failed to delete client user');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Error deleting client user');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#2c5f2d] border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1a3a1a] text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              <i className="fas fa-users-cog text-[#ff6b35] mr-2"></i>
              User Management
            </h1>
            <p className="text-sm text-gray-300">Manage admin and client users</p>
          </div>
          <Link href="/admin/dashboard" className="text-white hover:text-[#ff6b35] transition-colors text-sm">
            <i className="fas fa-arrow-left mr-1"></i> Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6">
            <i className="fas fa-check-circle mr-2"></i> {message}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('admins')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'admins'
                    ? 'border-[#2c5f2d] text-[#2c5f2d]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-user-shield mr-2"></i>
                Admin Users ({adminUsers.length})
              </button>
              <button
                onClick={() => setActiveTab('clients')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'clients'
                    ? 'border-[#2c5f2d] text-[#2c5f2d]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-users mr-2"></i>
                Client Users ({clientUsers.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'admins' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Admin Users</h3>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-[#2c5f2d] hover:bg-[#1a3a1a] text-white px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2"
                  >
                    <i className="fas fa-plus"></i> Add Admin
                  </button>
                </div>

                {adminUsers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No admin users found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {adminUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4 font-medium text-gray-900 text-sm">{user.username}</td>
                            <td className="px-4 py-4 text-sm text-gray-700">{user.full_name || '-'}</td>
                            <td className="px-4 py-4 text-sm text-gray-700">{user.email || '-'}</td>
                            <td className="px-4 py-4">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                user.role === 'admin' 
                                  ? 'bg-purple-100 text-purple-700' 
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {user.role || 'editor'}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                user.is_blocked 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {user.is_blocked ? '🔒 Blocked' : '✅ Active'}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              {formatDate(user.created_at)}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleBlockAdmin(user.id, user.is_blocked)}
                                  disabled={updating === user.id}
                                  className={`text-sm transition-colors ${
                                    user.is_blocked 
                                      ? 'text-green-600 hover:text-green-800' 
                                      : 'text-yellow-600 hover:text-yellow-800'
                                  } ${updating === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  title={user.is_blocked ? 'Unblock' : 'Block'}
                                >
                                  {updating === user.id ? (
                                    <i className="fas fa-spinner fa-spin"></i>
                                  ) : (
                                    <i className={`fas ${user.is_blocked ? 'fa-unlock' : 'fa-lock'}`}></i>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDeleteAdmin(user.id)}
                                  className="text-red-600 hover:text-red-800 transition-colors text-sm"
                                  title="Delete"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'clients' && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Client Users</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Users who have donated or volunteered with THOFA
                </p>

                {clientUsers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No client users found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {clientUsers.map((user, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4 font-medium text-gray-900 text-sm">{user.name}</td>
                            <td className="px-4 py-4 text-sm text-gray-700">{user.email}</td>
                            <td className="px-4 py-4 text-sm text-gray-700">{user.phone || '-'}</td>
                            <td className="px-4 py-4">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                user.type === 'donor' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {user.type || 'client'}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                user.is_blocked 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {user.is_blocked ? '🔒 Blocked' : '✅ Active'}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              {formatDate(user.created_at)}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleBlockClient(user.email, user.is_blocked)}
                                  disabled={updating === user.email}
                                  className={`text-sm transition-colors ${
                                    user.is_blocked 
                                      ? 'text-green-600 hover:text-green-800' 
                                      : 'text-yellow-600 hover:text-yellow-800'
                                  } ${updating === user.email ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  title={user.is_blocked ? 'Unblock' : 'Block'}
                                >
                                  {updating === user.email ? (
                                    <i className="fas fa-spinner fa-spin"></i>
                                  ) : (
                                    <i className={`fas ${user.is_blocked ? 'fa-unlock' : 'fa-lock'}`}></i>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDeleteClient(user.email)}
                                  className="text-red-600 hover:text-red-800 transition-colors text-sm"
                                  title="Delete"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#2c5f2d]">Add Admin User</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleAddAdmin}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-sm">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-sm">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                    placeholder="Enter password (min 6 characters)"
                    minLength="6"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-sm">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-sm">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-sm">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2c5f2d]"
                  >
                    <option value="editor">Editor</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#2c5f2d] hover:bg-[#1a3a1a] text-white py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <><i className="fas fa-spinner fa-spin mr-2"></i> Adding...</>
                  ) : (
                    <><i className="fas fa-user-plus mr-2"></i> Add Admin</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}