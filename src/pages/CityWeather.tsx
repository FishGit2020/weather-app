import React from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import CurrentWeather from '@/components/weather/CurrentWeather';
import ForecastCard from '@/components/weather/ForecastCard';
import HourlyForecast from '@/components/weather/HourlyForecast';
import Loading from '@/components/common/Loading';
import { useWeatherData } from '@/hooks/useWeatherData';
import { useCities } from '@/context/CitiesContext';
import type { SavedCity } from '@/types/city';

export default function CityWeather() {
  const { coords } = useParams<{ coords: string }>();
  const [searchParams] = useSearchParams();
  const cityName = searchParams.get('name') || 'Unknown Location';

  const [lat, lon] = coords?.split(',').map(Number) || [null, null];

  const { current, forecast, hourly, loading, error } = useWeatherData(lat, lon);
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
      <div className="flex items-center justify-between mb-6">
        <Link to="/" className="text-blue-500 hover:underline flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

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
