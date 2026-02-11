import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
            </svg>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Weather Tracker
            </h1>
          </Link>
          <nav>
            <Link
              to="/"
              className="text-sm sm:text-base text-gray-600 hover:text-blue-500 transition touch-target"
            >
              Home
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
