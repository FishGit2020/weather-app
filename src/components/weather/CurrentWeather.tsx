import React from 'react';
import type { CurrentWeather } from '@/types/weather';
import { formatTemperature, formatWindSpeed } from '@/utils/formatters';
import { getWeatherIconUrl } from '@/utils/weatherHelpers';

interface Props {
  weather: CurrentWeather;
  cityName: string;
}

export default function CurrentWeather({ weather, cityName }: Props) {
  return (
    <div className="weather-card weather-gradient">
      <div className="text-center mb-4">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">{cityName}</h2>
        <p className="text-base sm:text-lg opacity-90 capitalize">
          {weather.weather[0].description}
        </p>
      </div>

      <div className="flex items-center justify-center mb-6">
        <img
          src={getWeatherIconUrl(weather.weather[0].icon)}
          alt="Weather icon"
          className="w-20 h-20 sm:w-24 sm:h-24"
        />
        <div className="text-5xl sm:text-6xl font-bold ml-2 sm:ml-4">
          {formatTemperature(weather.temp)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white bg-opacity-20 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm opacity-75">Feels Like</p>
          <p className="text-xl sm:text-2xl font-semibold">
            {formatTemperature(weather.feels_like)}
          </p>
        </div>

        <div className="bg-white bg-opacity-20 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm opacity-75">Humidity</p>
          <p className="text-xl sm:text-2xl font-semibold">{weather.humidity}%</p>
        </div>

        <div className="bg-white bg-opacity-20 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm opacity-75">Wind</p>
          <p className="text-lg sm:text-2xl font-semibold">
            {formatWindSpeed(weather.wind.speed)}
          </p>
        </div>

        <div className="bg-white bg-opacity-20 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm opacity-75">Pressure</p>
          <p className="text-lg sm:text-2xl font-semibold">{weather.pressure}</p>
        </div>
      </div>
    </div>
  );
}
