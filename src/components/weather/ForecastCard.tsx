import React from 'react';
import type { ForecastDay } from '@/types/weather';
import { formatDate, formatTemperature, formatPercentage } from '@/utils/formatters';
import WeatherIcon from './WeatherIcon';

interface Props {
  forecast: ForecastDay;
}

export default function ForecastCard({ forecast }: Props) {
  return (
    <div className="weather-card text-center">
      <h3 className="font-semibold mb-2">{formatDate(forecast.dt, 'short')}</h3>

      <WeatherIcon code={forecast.weather[0].icon} size="medium" />

      <div className="mt-3">
        <p className="text-sm text-gray-600 capitalize">{forecast.weather[0].description}</p>

        <div className="flex justify-center items-center space-x-2 mt-2">
          <span className="text-2xl font-bold text-red-500">
            {formatTemperature(forecast.temp.max)}
          </span>
          <span className="text-xl text-gray-400">/</span>
          <span className="text-xl text-blue-500">
            {formatTemperature(forecast.temp.min)}
          </span>
        </div>

        {forecast.pop > 0.1 && (
          <p className="text-sm text-blue-600 mt-2">
            Rain: {formatPercentage(forecast.pop)}
          </p>
        )}
      </div>
    </div>
  );
}
