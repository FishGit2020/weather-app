import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLazyQuery } from '@apollo/client/react';
import { SEARCH_CITIES, City, eventBus, MFEvents } from '@weather/shared';
import './CitySearch.css';

interface SearchCitiesResponse {
  searchCities: City[];
}

interface RecentCity {
  id: string;
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

interface Props {
  onCitySelect?: (city: City) => void;
  recentCities?: RecentCity[];
}

export default function CitySearch({ onCitySelect, recentCities = [] }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [inputFocused, setInputFocused] = useState(false);
  const navigate = useNavigate();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [searchCities, { loading, data }] = useLazyQuery<SearchCitiesResponse>(SEARCH_CITIES);

  useEffect(() => {
    if (data?.searchCities) {
      setResults(data.searchCities);
    }
  }, [data]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setInputFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      searchCities({
        variables: { query, limit: 5 }
      });
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, searchCities]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleCityClick = (city: City | RecentCity) => {
    // Publish event for other micro frontends
    eventBus.publish(MFEvents.CITY_SELECTED, { city });

    if (onCitySelect) {
      onCitySelect(city as City);
    } else {
      navigate(`/weather/${city.lat},${city.lon}?name=${encodeURIComponent(city.name)}`);
    }
    setQuery('');
    setResults([]);
    setInputFocused(false);
  };

  // Derive dropdown visibility from current state — no stale boolean
  const showRecentCities = inputFocused && query.length < 2 && recentCities.length > 0 && !loading && results.length === 0;

  return (
    <div className="city-search-container max-w-xl mx-auto" ref={containerRef}>
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setInputFocused(true)}
            placeholder="Search for a city..."
            className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
          />
          <svg
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {loading && (
          <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 text-center z-10">
            <p className="text-gray-500 dark:text-gray-400">Searching...</p>
          </div>
        )}

        {results.length > 0 && !loading && (
          <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-10">
            {results.map((city) => (
              <button
                key={city.id}
                onClick={() => handleCityClick(city)}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700 transition border-b dark:border-gray-700 last:border-b-0"
              >
                <p className="font-medium dark:text-white">{city.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {city.state && `${city.state}, `}{city.country}
                </p>
              </button>
            ))}
          </div>
        )}

        {showRecentCities && (
          <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-10">
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Recent Searches</p>
            </div>
            {recentCities.slice(0, 5).map((city) => (
              <button
                key={city.id}
                onClick={() => handleCityClick(city)}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700 transition border-b dark:border-gray-700 last:border-b-0"
              >
                <p className="font-medium dark:text-white">{city.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {city.state && `${city.state}, `}{city.country}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
          City Search Micro Frontend
        </span>
      </div>
    </div>
  );
}
