import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import UnitToggle from './UnitToggle';
import UserMenu from './UserMenu';
import OfflineIndicator from './OfflineIndicator';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      <OfflineIndicator />
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
              </svg>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Weather Tracker</h1>
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full">MicroFE</span>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition"
              >
                Home
              </Link>
              <Link
                to="/compare"
                className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition"
              >
                Compare
              </Link>
              <UnitToggle />
              <ThemeToggle />
              <UserMenu />
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="bg-gray-800 dark:bg-gray-950 text-white py-6 mt-12 transition-colors">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            Weather data provided by{' '}
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
            Built with React, Vite, and Micro Frontend Architecture
          </p>
        </div>
      </footer>
    </div>
  );
}
