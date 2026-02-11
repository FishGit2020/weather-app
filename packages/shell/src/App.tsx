import React, { Suspense, lazy, useState } from 'react';
import { Routes, Route, useParams, useSearchParams, useNavigate } from 'react-router';
import Layout from './components/Layout';
import Loading from './components/Loading';
import ErrorBoundary from './components/ErrorBoundary';
import UseMyLocation from './components/UseMyLocation';
import CitySearchWrapper from './components/CitySearchWrapper';
import FavoriteCities from './components/FavoriteCities';
import WeatherCompare from './components/WeatherCompare';
import { useAuth } from './context/AuthContext';

// Lazy load remote micro frontends
const WeatherDisplayMF = lazy(() => import('weatherDisplay/WeatherDisplay'));

// Fallback components for when remote modules fail to load
const WeatherDisplayFallback = () => (
  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
    <p className="text-yellow-700 dark:text-yellow-300">Weather Display module is loading...</p>
  </div>
);

// Home page combining micro frontends
function HomePage() {
  return (
    <div className="space-y-8">
      <section className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          Find Weather for Any City
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
          Search for a city to get current weather conditions, forecasts, and more.
        </p>
        <UseMyLocation />
        <div className="mt-4 text-gray-400 dark:text-gray-500 text-sm">or search below</div>
      </section>

      <CitySearchWrapper />

      <FavoriteCities />
    </div>
  );
}

// Favorite star button for weather page
function FavoriteButton() {
  const { coords } = useParams<{ coords: string }>();
  const [searchParams] = useSearchParams();
  const { user, favoriteCities, toggleFavorite } = useAuth();

  if (!user || !coords) return null;

  const [lat, lon] = coords.split(',').map(Number);
  if (isNaN(lat) || isNaN(lon)) return null;

  const cityName = searchParams.get('name') || 'Unknown';
  const cityId = `${lat},${lon}`;
  const isFavorite = favoriteCities.some(c => c.id === cityId);

  const handleToggle = async () => {
    await toggleFavorite({
      id: cityId,
      name: cityName,
      country: '',
      lat,
      lon,
    });
  };

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
        isFavorite
          ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
      }`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
      {isFavorite ? 'Favorited' : 'Favorite'}
    </button>
  );
}

// Share button for weather page
function ShareButton() {
  const [copied, setCopied] = useState(false);
  const { coords } = useParams<{ coords: string }>();
  const [searchParams] = useSearchParams();
  const cityName = searchParams.get('name') || 'Weather';

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Check out the weather in ${cityName}!`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `${cityName} Weather`, text, url });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
      title="Share weather"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
      {copied ? 'Copied!' : 'Share'}
    </button>
  );
}

// Weather page with full weather display
function WeatherPage() {
  return (
    <div>
      <div className="flex justify-end gap-2 mb-4">
        <ShareButton />
        <FavoriteButton />
      </div>
      <ErrorBoundary fallback={<WeatherDisplayFallback />}>
        <Suspense fallback={<Loading />}>
          <WeatherDisplayMF />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

// 404 Not Found
function NotFound() {
  return (
    <div className="text-center py-16">
      <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">404</h2>
      <p className="text-gray-600 dark:text-gray-400">Page not found</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="weather/:coords" element={<WeatherPage />} />
        <Route path="compare" element={<WeatherCompare />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
