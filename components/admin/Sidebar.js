'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get admin user from localStorage
    const userData = localStorage.getItem('admin_user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      router.push('/admin/login');
    }
  };

  const navItems = [
    {
      href: '/admin/dashboard',
      icon: 'fa-tachometer-alt',
      label: 'Dashboard',
      exact: true
    },
    {
      href: '/admin/projects',
      icon: 'fa-project-diagram',
      label: 'Projects'
    },
    {
      href: '/admin/donations',
      icon: 'fa-hand-holding-heart',
      label: 'Donations'
    },
    {
      href: '/admin/volunteers',
      icon: 'fa-users',
      label: 'Volunteers'
    },
    {
      href: '/admin/messages',
      icon: 'fa-envelope',
      label: 'Messages'
    },
    {
      href: '/admin/blog',
      icon: 'fa-newspaper',
      label: 'Blog'
    },
    {
      href: '/admin/users',
      icon: 'fa-users-cog',
      label: 'User Management'
    },
    {
      href: '/admin/settings',
      icon: 'fa-cog',
      label: 'Settings'
    }
  ];

  const isActive = (href, exact = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-[#1a3a1a] text-white p-2 rounded-lg shadow-lg hover:bg-[#2c5f2d] transition-colors"
      >
        <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40
        w-64 bg-[#1a3a1a] text-white
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        h-screen overflow-y-auto
        flex flex-col
        shadow-2xl
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-700 flex-shrink-0">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="bg-[#ff6b35] p-2 rounded-lg flex-shrink-0">
              <i className="fas fa-hands-helping text-white"></i>
            </div>
            <div>
              <h1 className="text-lg font-bold">THOFA Admin</h1>
              <p className="text-xs text-gray-400">Management Panel</p>
            </div>
          </Link>
        </div>

        {/* User Info */}
        {user && (
          <div className="px-6 py-3 border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#ff6b35] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {user.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.username}</p>
                <p className="text-xs text-gray-400 truncate">{user.role || 'Admin'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive(item.href, item.exact)
                      ? 'bg-[#2c5f2d] text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                  onClick={() => setIsOpen(false)}
                >
                  <i className={`fas ${item.icon} w-5 text-center text-sm`}></i>
                  <span className="text-sm flex-1">{item.label}</span>
                  {item.href === '/admin/users' && (
                    <span className="text-[8px] bg-[#ff6b35] px-1.5 py-0.5 rounded-full text-white font-bold uppercase">
                      New
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex-shrink-0">
          <Link
            href="/admin/logout"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200"
          >
            <i className="fas fa-sign-out-alt w-5 text-center text-sm"></i>
            <span className="text-sm">Logout</span>
          </Link>
          <div className="mt-3 text-center">
            <Link
              href="/"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              <i className="fas fa-external-link-alt mr-1"></i> View Website
            </Link>
          </div>
          <div className="mt-2 text-center text-[10px] text-gray-600">
            v1.0.0
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;