import React, { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import CurrentWeather from '@/components/weather/CurrentWeather';
import ForecastCard from '@/components/weather/ForecastCard';
import HourlyForecast from '@/components/weather/HourlyForecast';
import Loading from '@/components/common/Loading';
import { useWeatherDataGraphQL } from '@/hooks/useWeatherDataGraphQL';
import { useCities } from '@/context/CitiesContext';
import type { SavedCity } from '@/types/city';

export default function CityWeatherGraphQL() {
  const { coords } = useParams<{ coords: string }>();
  const [searchParams] = useSearchParams();
  const cityName = searchParams.get('name') || 'Unknown Location';
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);

  const [lat, lon] = coords?.split(',').map(Number) || [null, null];

  const { current, forecast, hourly, loading, error, isLive, lastUpdate } = useWeatherDataGraphQL(
    lat,
    lon,
    realtimeEnabled
  );
  const { addCity, removeCity, isCitySaved } = useCities();

  const isSaved = coords ? isCitySaved(coords) : false;

  const handleToggleSave = () => {
    if (!coords || !lat || !lon) return;

    if (isSaved) {
      removeCity(coords);
    } else {
      const city: SavedCity = {
        id: coords,
        name: cityName,
        country: '',
        lat,
        lon,
        addedAt: Date.now()
      };
      addCity(city);
    }
  };

  const toggleRealtime = () => {
    setRealtimeEnabled(!realtimeEnabled);
  };

  if (loading) {
    return <Loading />;
  }

  if (error || !current) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg mb-4">{error || 'Failed to load weather data'}</p>
        <Link to="/" className="text-blue-500 hover:underline">
          Go back home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <Link to="/" className="text-blue-500 hover:underline flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

        <div className="flex gap-2 flex-wrap">
          {/* Real-time toggle */}
          <button
            onClick={toggleRealtime}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
              realtimeEnabled
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
            title={realtimeEnabled ? 'Disable real-time updates' : 'Enable real-time updates'}
          >
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-white animate-pulse' : 'bg-gray-500'}`}></span>
            {realtimeEnabled ? 'Live Updates ON' : 'Live Updates OFF'}
          </button>

          {/* Save city button */}
          <button
            onClick={handleToggleSave}
            className={`px-4 py-2 rounded-lg transition ${
              isSaved
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isSaved ? 'Remove from Saved' : 'Save City'}
          </button>
        </div>
      </div>

      {/* Live update indicator */}
      {isLive && lastUpdate && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Live:</span> Last updated {new Date(lastUpdate).toLocaleTimeString()}
          </p>
        </div>
      )}

      <div className="mb-8">
        <CurrentWeather weather={current} cityName={cityName} />
      </div>

      {hourly && hourly.length > 0 && (
        <div className="mb-8">
          <HourlyForecast hourly={hourly} />
        </div>
      )}

      {forecast && forecast.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">7-Day Forecast</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {forecast.map((day) => (
              <ForecastCard key={day.dt} forecast={day} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
