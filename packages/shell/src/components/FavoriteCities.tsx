import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function FavoriteCities() {
  const { user, favoriteCities } = useAuth();
  const navigate = useNavigate();

  if (!user || favoriteCities.length === 0) return null;

  return (
    <section className="mt-8">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
        <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        Favorite Cities
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {favoriteCities.map((city) => (
          <button
            key={city.id}
            onClick={() => navigate(`/weather/${city.lat},${city.lon}?name=${encodeURIComponent(city.name)}`)}
            className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow hover:shadow-md transition text-left border border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
          >
            <p className="font-medium text-gray-800 dark:text-white text-sm truncate">{city.name}</p>
            {city.country && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {city.state && `${city.state}, `}{city.country}
              </p>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
