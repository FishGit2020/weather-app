import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Loading from './components/Loading';
import ErrorBoundary from './components/ErrorBoundary';
import UseMyLocation from './components/UseMyLocation';
import CitySearchWrapper from './components/CitySearchWrapper';

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
    </div>
  );
}

// Weather page with full weather display
function WeatherPage() {
  return (
    <ErrorBoundary fallback={<WeatherDisplayFallback />}>
      <Suspense fallback={<Loading />}>
        <WeatherDisplayMF />
      </Suspense>
    </ErrorBoundary>
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
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
