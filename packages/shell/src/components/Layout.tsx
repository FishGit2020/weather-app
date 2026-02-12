import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { useTranslation } from '@weather/shared';
import ThemeToggle from './ThemeToggle';
import UnitToggle from './UnitToggle';
import UserMenu from './UserMenu';
import NotificationBell from './NotificationBell';
import OfflineIndicator from './OfflineIndicator';
import LanguageSelector from './LanguageSelector';

export default function Layout() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside (excluding the toggle button)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(target) &&
        toggleRef.current && !toggleRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:outline-none"
      >
        {t('nav.skipToContent')}
      </a>
      <OfflineIndicator />
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
              </svg>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white">Weather Tracker</h1>
              <span className="hidden sm:inline text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">MicroFE</span>
            </Link>

            {/* Desktop nav (hidden on mobile) */}
            <nav aria-label="Main navigation" className="hidden md:flex items-center space-x-4">
              <Link
                to="/"
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition"
              >
                {t('nav.home')}
              </Link>
              <Link
                to="/compare"
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition"
              >
                {t('nav.compare')}
              </Link>
              <LanguageSelector />
              <UnitToggle />
              <ThemeToggle />
              <NotificationBell />
              <UserMenu />
            </nav>

            {/* Mobile controls: small buttons + hamburger */}
            <div className="flex md:hidden items-center space-x-2">
              <LanguageSelector />
              <UnitToggle />
              <ThemeToggle />
              <NotificationBell />
              <button
                ref={toggleRef}
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none transition-colors"
                aria-label="Toggle menu"
              >
                {menuOpen ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile dropdown menu */}
          {menuOpen && (
            <div ref={menuRef} className="md:hidden mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                {t('nav.home')}
              </Link>
              <Link
                to="/compare"
                className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                {t('nav.compare')}
              </Link>
              <div className="px-3 py-2">
                <UserMenu />
              </div>
            </div>
          )}
        </div>
      </header>

      <main id="main-content" className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer role="contentinfo" className="bg-gray-800 dark:bg-gray-950 text-white py-6 mt-12 transition-colors">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            {t('footer.dataProvider')}{' '}
            <a
              href="https://openweathermap.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              OpenWeatherMap
            </a>
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {t('footer.builtWith')}
          </p>
        </div>
      </footer>
    </div>
  );
}
