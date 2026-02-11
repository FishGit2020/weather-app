import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { City } from '@/types/city';

interface Props {
  onCitySelect?: (city: City) => void;
}

export default function CitySearch({ onCitySelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    setLoading(true);

    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await axios.get(`/api/cities/search?q=${encodeURIComponent(query)}`);
        setResults(response.data.data);
      } catch (error) {
        console.error('City search failed:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleCityClick = (city: City) => {
    if (onCitySelect) {
      onCitySelect(city);
    } else {
      navigate(`/weather/${city.lat},${city.lon}?name=${encodeURIComponent(city.name)}`);
    }
    setQuery('');
    setResults([]);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search for a city..."
          className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg p-4 text-center z-10">
          <p className="text-gray-500">Searching...</p>
        </div>
      )}

      {results.length > 0 && !loading && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg overflow-hidden z-10">
          {results.map((city) => (
            <button
              key={city.id}
              onClick={() => handleCityClick(city)}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 transition border-b last:border-b-0"
            >
              <p className="font-medium">{city.name}</p>
              <p className="text-sm text-gray-500">
                {city.state && `${city.state}, `}{city.country}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
