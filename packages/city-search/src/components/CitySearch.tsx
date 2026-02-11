import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLazyQuery } from '@apollo/client/react';
import { SEARCH_CITIES, REVERSE_GEOCODE, City, eventBus, MFEvents } from '@weather/shared';
import WeatherPreview from './WeatherPreview';
import './CitySearch.css';

interface SearchCitiesResponse {
  searchCities: City[];
}

interface ReverseGeocodeResponse {
  reverseGeocode: City | null;
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
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const navigate = useNavigate();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [searchCities, { loading, data }] = useLazyQuery<SearchCitiesResponse>(SEARCH_CITIES);
  const [reverseGeocode] = useLazyQuery<ReverseGeocodeResponse>(REVERSE_GEOCODE, {
    onCompleted: (data) => {
      setGeoLoading(false);
      if (data.reverseGeocode) {
        handleCityClick(data.reverseGeocode);
      } else {
        setGeoError('Could not determine location');
      }
    },
    onError: () => {
      setGeoLoading(false);
      setGeoError('Failed to look up location');
    }
  });

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
    setGeoError(null);
  };

  const handleCityClick = useCallback((city: City | RecentCity) => {
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
    setGeoError(null);
  }, [onCitySelect, navigate]);

  const handleUseMyLocation = useCallback(() => {
    setGeoError(null);
    setGeoLoading(true);

    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported');
      setGeoLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        reverseGeocode({
          variables: { lat: position.coords.latitude, lon: position.coords.longitude }
        });
      },
      (err) => {
        setGeoLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGeoError('Location permission denied');
            break;
          case err.POSITION_UNAVAILABLE:
            setGeoError('Location unavailable');
            break;
          case err.TIMEOUT:
            setGeoError('Location request timed out');
            break;
          default:
            setGeoError('Unable to get location');
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, [reverseGeocode]);

  // Derive dropdown visibility from current state
  const showSearchResults = results.length > 0 && !loading;
  const showDropdown = inputFocused && query.length < 2 && !loading && results.length === 0;

  // Get the currently visible list for keyboard navigation
  const visibleItems: (City | RecentCity)[] = showSearchResults
    ? results
    : showDropdown
      ? recentCities.slice(0, 5)
      : [];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setInputFocused(false);
      setHighlightedIndex(-1);
      (e.target as HTMLInputElement).blur();
      return;
    }

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
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const items = dropdownRef.current.querySelectorAll('[data-dropdown-item]');
      items[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const LocationButton = () => (
    <button
      onClick={handleUseMyLocation}
      disabled={geoLoading}
      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-gray-700 transition border-b dark:border-gray-700 text-blue-600 dark:text-blue-400"
    >
      {geoLoading ? (
        <svg className="animate-spin h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )}
      <span className="text-sm font-medium">
        {geoLoading ? 'Getting location...' : 'Use my current location'}
      </span>
    </button>
  );

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
            aria-expanded={visibleItems.length > 0 || showDropdown}
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
                className={`w-full text-left px-4 py-3 transition border-b dark:border-gray-700 last:border-b-0 flex items-center ${
                  index === highlightedIndex
                    ? 'bg-blue-50 dark:bg-gray-700'
                    : 'hover:bg-blue-50 dark:hover:bg-gray-700'
                }`}
                role="option"
                aria-selected={index === highlightedIndex}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium dark:text-white">{city.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {city.state && `${city.state}, `}{city.country}
                  </p>
                </div>
                <WeatherPreview lat={city.lat} lon={city.lon} />
              </button>
            ))}
          </div>
        )}

        {showDropdown && (
          <div ref={dropdownRef} className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-10" role="listbox">
            <LocationButton />
            {geoError && (
              <div className="px-4 py-2 text-xs text-red-500 dark:text-red-400 border-b dark:border-gray-700">
                {geoError}
              </div>
            )}
            {recentCities.length > 0 && (
              <>
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
              </>
            )}
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
