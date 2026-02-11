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
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const navigate = useNavigate();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Reset highlighted index when the list changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [results, query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleCityClick = (city: City | RecentCity) => {
    eventBus.publish(MFEvents.CITY_SELECTED, { city });

    if (onCitySelect) {
      onCitySelect(city as City);
    } else {
      navigate(`/weather/${city.lat},${city.lon}?name=${encodeURIComponent(city.name)}`);
    }
    setQuery('');
    setResults([]);
    setInputFocused(false);
    setHighlightedIndex(-1);
  };

  // Derive dropdown visibility from current state
  const showSearchResults = results.length > 0 && !loading;
  const showRecentCities = inputFocused && query.length < 2 && recentCities.length > 0 && !loading && results.length === 0;

  // Get the currently visible list for keyboard navigation
  const visibleItems: (City | RecentCity)[] = showSearchResults
    ? results
    : showRecentCities
      ? recentCities.slice(0, 5)
      : [];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (visibleItems.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < visibleItems.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : visibleItems.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < visibleItems.length) {
          handleCityClick(visibleItems[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setInputFocused(false);
        setHighlightedIndex(-1);
        (e.target as HTMLInputElement).blur();
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const items = dropdownRef.current.querySelectorAll('[data-dropdown-item]');
      items[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  return (
    <div className="city-search-container max-w-xl mx-auto" ref={containerRef}>
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setInputFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search for a city..."
            className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
            role="combobox"
            aria-expanded={visibleItems.length > 0}
            aria-activedescendant={highlightedIndex >= 0 ? `city-option-${highlightedIndex}` : undefined}
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

        {showSearchResults && (
          <div ref={dropdownRef} className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-10" role="listbox">
            {results.map((city, index) => (
              <button
                key={city.id}
                id={`city-option-${index}`}
                data-dropdown-item
                onClick={() => handleCityClick(city)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`w-full text-left px-4 py-3 transition border-b dark:border-gray-700 last:border-b-0 ${
                  index === highlightedIndex
                    ? 'bg-blue-50 dark:bg-gray-700'
                    : 'hover:bg-blue-50 dark:hover:bg-gray-700'
                }`}
                role="option"
                aria-selected={index === highlightedIndex}
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
          <div ref={dropdownRef} className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-10" role="listbox">
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Recent Searches</p>
            </div>
            {recentCities.slice(0, 5).map((city, index) => (
              <button
                key={city.id}
                id={`city-option-${index}`}
                data-dropdown-item
                onClick={() => handleCityClick(city)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`w-full text-left px-4 py-3 transition border-b dark:border-gray-700 last:border-b-0 ${
                  index === highlightedIndex
                    ? 'bg-blue-50 dark:bg-gray-700'
                    : 'hover:bg-blue-50 dark:hover:bg-gray-700'
                }`}
                role="option"
                aria-selected={index === highlightedIndex}
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
