import React from 'react';
import { CurrentWeather as CurrentWeatherType, getWeatherIconUrl, getWindDirection, getWeatherDescription } from '@weather/shared';

interface Props {
  data: CurrentWeatherType;
}

export default function CurrentWeather({ data }: Props) {
  const { color, bgColor } = getWeatherDescription(data.weather[0]?.main || 'Clear');

  return (
    <div className={`${bgColor} dark:bg-gray-800 rounded-xl p-6 shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-6xl font-bold ${color} dark:text-white`}>{Math.round(data.temp)}°C</p>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Feels like {Math.round(data.feels_like)}°C
          </p>
          <p className={`text-lg capitalize mt-1 ${color} dark:text-gray-200`}>
            {data.weather[0]?.description}
          </p>
        </div>

        {data.weather[0] && (
          <img
            src={getWeatherIconUrl(data.weather[0].icon)}
            alt={data.weather[0].description}
            className="w-24 h-24"
          />
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Humidity</p>
          <p className="text-xl font-semibold dark:text-white">{data.humidity}%</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Wind</p>
          <p className="text-xl font-semibold dark:text-white">
            {Math.round(data.wind.speed)} m/s {getWindDirection(data.wind.deg)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Pressure</p>
          <p className="text-xl font-semibold dark:text-white">{data.pressure} hPa</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Cloudiness</p>
          <p className="text-xl font-semibold dark:text-white">{data.clouds.all}%</p>
        </div>
      </div>
    </div>
  );
}
