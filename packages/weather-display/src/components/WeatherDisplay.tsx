import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useWeatherData, subscribeToMFEvent, MFEvents, CitySelectedEvent } from '@weather/shared';
import CurrentWeather from './CurrentWeather';
import Forecast from './Forecast';
import HourlyForecast from './HourlyForecast';
import WeatherAlerts from './WeatherAlerts';
import HourlyChart from './HourlyChart';
import WhatToWear from './WhatToWear';
import SunriseSunset from './SunriseSunset';
import './WeatherDisplay.css';

export default function WeatherDisplay() {
  const { coords } = useParams<{ coords: string }>();
  const [searchParams] = useSearchParams();
  const cityName = searchParams.get('name') || 'Unknown Location';

  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

  // Parse coordinates from URL
  useEffect(() => {
    if (coords) {
      const [lat, lon] = coords.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lon)) {
        setLocation({ lat, lon });
      }
    }
  }, [coords]);

  // Listen for city selection events from other micro frontends
  useEffect(() => {
    const unsubscribe = subscribeToMFEvent<CitySelectedEvent>(
      MFEvents.CITY_SELECTED,
      (data) => {
        setLocation({ lat: data.city.lat, lon: data.city.lon });
      }
    );
    return unsubscribe;
  }, []);

  const { current, forecast, hourly, loading, error, isLive, lastUpdate } = useWeatherData(
    location?.lat ?? null,
    location?.lon ?? null,
    true // Enable real-time updates
  );

  if (!location) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No location selected. Search for a city to see weather.</p>
      </div>
    );
  }

  if (loading && !current) {
    return (
      <div className="weather-display-container space-y-6 animate-pulse">
        {/* City name + badge skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        </div>

        {/* Current weather skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="space-y-3 flex-1">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-12" />
              </div>
            ))}
          </div>
        </div>

        {/* Hourly forecast skeleton */}
        <div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4" />
          <div className="flex gap-3 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-20 bg-white dark:bg-gray-800 rounded-lg p-3 shadow space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-10 mx-auto" />
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8 mx-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* 7-day forecast skeleton */}
        <div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-36 mb-4" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 flex-1" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="weather-display-container space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{cityName}</h2>
        {isLive && (
          <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm rounded">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Live
          </span>
        )}
      </div>

      {lastUpdate && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date(lastUpdate).toLocaleTimeString()}
        </p>
      )}

      {current && forecast && <WeatherAlerts current={current} forecast={forecast} />}

      {current && <CurrentWeather data={current} />}

      {current && <SunriseSunset data={current} />}

      {current && <WhatToWear data={current} />}

      {hourly && hourly.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Hourly Forecast</h3>
          <HourlyForecast data={hourly} />
          <div className="mt-4">
            <HourlyChart data={hourly} />
          </div>
        </section>
      )}

      {forecast && forecast.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">7-Day Forecast</h3>
          <Forecast data={forecast} />
        </section>
      )}

      <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
          Weather Display Micro Frontend
        </span>
      </div>
    </div>
  );
}
