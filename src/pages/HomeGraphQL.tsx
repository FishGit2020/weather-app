import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CitySearchGraphQL from '@/components/city/CitySearchGraphQL';
import SavedCities from '@/components/city/SavedCities';
import Loading from '@/components/common/Loading';
import { useGeolocation } from '@/hooks/useGeolocation';

export default function HomeGraphQL() {
  const navigate = useNavigate();
  const { latitude, longitude, error, loading } = useGeolocation();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (!loading && !error && latitude && longitude && !hasRedirected) {
      setHasRedirected(true);
      navigate(`/weather/${latitude},${longitude}?name=Your Location`);
    }
  }, [latitude, longitude, loading, error, hasRedirected, navigate]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
          Welcome to Weather Tracker
        </h1>
        <p className="text-base sm:text-lg text-gray-600 px-4">
          Search for a city to view current weather and real-time forecasts
        </p>
        <div className="mt-2 flex items-center justify-center gap-2 text-sm text-green-600">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span>Powered by GraphQL with Live Updates</span>
        </div>
      </div>

      <div className="mb-6 sm:mb-8">
        <CitySearchGraphQL />
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 sm:mb-8 mx-4 sm:mx-0">
          <p className="text-sm sm:text-base text-yellow-800">
            Location access denied. Please search for a city manually.
          </p>
        </div>
      )}

      <SavedCities />
    </div>
  );
}
