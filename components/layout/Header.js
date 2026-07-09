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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-gradient-to-r from-[#2c5f2d] via-[#245226] to-[#173517] shadow-lg backdrop-blur">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff6b35] shadow-md">
            <i className="fas fa-hands-helping text-lg"></i>
          </div>
          <div>
            <p className="text-lg font-semibold tracking-wide">THOFA</p>
            <p className="text-xs text-green-100">Bringing hope closer to Africa</p>
          </div>
        </Link>

        <button
          className="rounded-full border border-white/20 p-2 text-white transition hover:bg-white/10 md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>

        <ul className={`${isMenuOpen ? 'flex' : 'hidden'} mt-4 w-full flex-col gap-1 md:mt-0 md:flex md:w-auto md:flex-row md:items-center md:gap-2`}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <li key={link.href} className="w-full md:w-auto">
                <Link
                  href={link.href}
                  className={`block rounded-full px-4 py-2 text-sm font-medium text-white transition ${
                    isActive ? 'bg-white/15 text-[#ffe1d2]' : 'hover:bg-white/10 hover:text-[#ff6b35]'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}

          {user ? (
            <li className="w-full md:w-auto md:ml-2">
              <div className="flex flex-col gap-2 pt-2 md:flex-row md:items-center md:pt-0">
                <Link
                  href="/dashboard"
                  className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-[#ffe1d2] transition hover:bg-white/20 hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-user mr-1"></i> {user.name || 'Dashboard'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-full border border-red-300/40 px-4 py-2 text-left text-sm font-medium text-red-200 transition hover:bg-red-500/10 hover:text-red-100"
                >
                  <i className="fas fa-sign-out-alt mr-1"></i> Logout
                </button>
              </div>
            </li>
          ) : (
            <>
              <li className="w-full md:w-auto md:ml-2">
                <Link
                  href="/login"
                  className="block rounded-full px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 hover:text-[#ff6b35]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-sign-in-alt mr-1"></i> Login
                </Link>
              </li>
              <li className="w-full md:w-auto">
                <Link
                  href="/register"
                  className="block rounded-full bg-[#ff6b35] px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-[#e55a2b]"
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
              className={`block rounded-full px-4 py-2 text-sm font-medium text-white transition ${
                pathname === '/admin/login' ? 'bg-white/15 text-[#ffe1d2]' : 'hover:bg-white/10 hover:text-[#ff6b35]'
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