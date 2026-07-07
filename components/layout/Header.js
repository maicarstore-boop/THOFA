'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('thofa_user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('thofa_user');
    setUser(null);
    router.push('/');
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/projects', label: 'Projects' },
    { href: '/volunteer', label: 'Volunteer' },
    { href: '/activities', label: 'Activities' },
    { href: '/news', label: 'News' },
  ];

  return (
    <header className="bg-gradient-to-r from-[#2c5f2d] to-[#1a3a1a] sticky top-0 z-50 shadow-lg">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center flex-wrap">
        <Link href="/" className="text-white text-xl font-bold flex items-center gap-2">
          <i className="fas fa-hands-helping text-[#ff6b35] text-2xl"></i>
          THOFA
        </Link>

        <button 
          className="md:hidden text-white text-2xl"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>

        <ul className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row w-full md:w-auto gap-0 md:gap-6 mt-4 md:mt-0 items-start md:items-center`}>
          {navLinks.map((link) => (
            <li key={link.href} className="w-full md:w-auto">
              <Link
                href={link.href}
                className={`block py-2 px-4 text-white hover:text-[#ff6b35] transition-colors ${
                  pathname === link.href ? 'text-[#ff6b35]' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}

          {user ? (
            <li className="w-full md:w-auto border-t md:border-t-0 border-gray-700 pt-2 md:pt-0 md:ml-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <Link
                  href="/dashboard"
                  className="block py-2 px-4 text-[#ff6b35] hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-user mr-1"></i> {user.name || 'Dashboard'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="block py-2 px-4 text-red-400 hover:text-red-300 transition-colors text-left w-full md:w-auto"
                >
                  <i className="fas fa-sign-out-alt mr-1"></i> Logout
                </button>
              </div>
            </li>
          ) : (
            <>
              <li className="w-full md:w-auto border-t md:border-t-0 border-gray-700 pt-2 md:pt-0 md:ml-4">
                <Link
                  href="/login"
                  className="block py-2 px-4 text-white hover:text-[#ff6b35] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-sign-in-alt mr-1"></i> Login
                </Link>
              </li>
              <li className="w-full md:w-auto">
                <Link
                  href="/register"
                  className="block py-2 px-4 bg-[#ff6b35] text-white rounded-lg hover:bg-[#e55a2b] transition-colors text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-user-plus mr-1"></i> Register
                </Link>
              </li>
            </>
          )}

          <li className="w-full md:w-auto">
            <Link
              href="/admin/login"
              className={`block py-2 px-4 text-white hover:text-[#ff6b35] transition-colors ${
                pathname === '/admin/login' ? 'text-[#ff6b35]' : ''
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Admin
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;