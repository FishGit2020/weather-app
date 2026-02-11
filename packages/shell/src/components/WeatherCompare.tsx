import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_CURRENT_WEATHER, getWeatherIconUrl, getWindDirection } from '@weather/shared';
import { useAuth } from '../context/AuthContext';
import { FavoriteCity, RecentCity } from '../lib/firebase';

interface WeatherData {
  currentWeather: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    wind: { speed: number; deg: number };
    clouds: { all: number };
    weather: Array<{ icon: string; main: string; description: string }>;
  };
}

type SelectableCity = FavoriteCity | RecentCity;

function CityWeatherCard({ city, label }: { city: SelectableCity | null; label: string }) {
  const { data, loading } = useQuery<WeatherData>(GET_CURRENT_WEATHER, {
    variables: { lat: city?.lat, lon: city?.lon },
    skip: !city,
    fetchPolicy: 'cache-first',
  });

  if (!city) {
    return (
      <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center min-h-[200px]">
        <p className="text-gray-400 dark:text-gray-500 text-center">Select {label}</p>
      </div>
    );
  }

  const w = data?.currentWeather;

  return (
    <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">{city.name}</h3>
      {'country' in city && city.country && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {('state' in city && city.state) ? `${city.state}, ` : ''}{city.country}
        </p>
      )}

      {loading && (
        <div className="space-y-3 animate-pulse">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      )}

      {w && (
        <>
          <div className="flex items-center gap-3 mb-4">
            {w.weather[0] && (
              <img src={getWeatherIconUrl(w.weather[0].icon)} alt={w.weather[0].main} className="w-16 h-16" />
            )}
            <div>
              <p className="text-4xl font-bold text-gray-800 dark:text-white">{Math.round(w.temp)}°C</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{w.weather[0]?.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-gray-500 dark:text-gray-400">Feels like</p>
              <p className="font-semibold dark:text-white">{Math.round(w.feels_like)}°C</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-gray-500 dark:text-gray-400">Humidity</p>
              <p className="font-semibold dark:text-white">{w.humidity}%</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-gray-500 dark:text-gray-400">Wind</p>
              <p className="font-semibold dark:text-white">{Math.round(w.wind.speed)} m/s {getWindDirection(w.wind.deg)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-gray-500 dark:text-gray-400">Pressure</p>
              <p className="font-semibold dark:text-white">{w.pressure} hPa</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function WeatherCompare() {
  const { favoriteCities, recentCities } = useAuth();
  const [cityA, setCityA] = useState<SelectableCity | null>(null);
  const [cityB, setCityB] = useState<SelectableCity | null>(null);

  const allCities: SelectableCity[] = [
    ...favoriteCities,
    ...recentCities.filter(rc => !favoriteCities.some(fc => fc.id === rc.id)),
  ];

  const CitySelector = ({ value, onChange, excludeId }: { value: SelectableCity | null; onChange: (c: SelectableCity) => void; excludeId?: string }) => (
    <select
      value={value?.id || ''}
      onChange={(e) => {
        const selected = allCities.find(c => c.id === e.target.value);
        if (selected) onChange(selected);
      }}
      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-sm mb-4"
    >
      <option value="">Choose a city...</option>
      {allCities.filter(c => c.id !== excludeId).map(c => (
        <option key={c.id} value={c.id}>{c.name}{c.country ? `, ${c.country}` : ''}</option>
      ))}
    </select>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">Compare Weather</h2>

      {allCities.length < 2 && (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            You need at least 2 cities in your favorites or recent searches to compare weather.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Search for cities and add them to your favorites first.
          </p>
        </div>
      )}

      {allCities.length >= 2 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <CitySelector value={cityA} onChange={setCityA} excludeId={cityB?.id} />
              <CityWeatherCard city={cityA} label="City A" />
            </div>
            <div>
              <CitySelector value={cityB} onChange={setCityB} excludeId={cityA?.id} />
              <CityWeatherCard city={cityB} label="City B" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
