import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-12">
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
          Built with React, Vite, and Express
        </p>
      </div>
    </footer>
  );
}
