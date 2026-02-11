import React from 'react';
import type { HourlyForecast } from '@/types/weather';
import { formatDate, formatTemperature } from '@/utils/formatters';
import { getWeatherIconUrl } from '@/utils/weatherHelpers';

interface Props {
  hourly: HourlyForecast[];
}

export default function HourlyForecast({ hourly }: Props) {
  return (
    <div className="weather-card">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Hourly Forecast</h2>

      <div className="scroll-container -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex space-x-3 sm:space-x-4 pb-4">
          {hourly.map((hour, index) => (
            <div
              key={hour.dt}
              className="flex-shrink-0 text-center bg-gray-50 rounded-lg p-3 sm:p-4 min-w-[80px] sm:min-w-[100px]"
            >
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                {index === 0 ? 'Now' : formatDate(hour.dt, 'time')}
              </p>

              <img
                src={getWeatherIconUrl(hour.weather[0].icon)}
                alt="Weather icon"
                className="w-10 h-10 sm:w-12 sm:h-12 mx-auto"
              />

              <p className="text-lg sm:text-xl font-bold mt-2">
                {formatTemperature(hour.temp)}
              </p>

              {hour.pop > 0.1 && (
                <p className="text-xs text-blue-600 mt-1">
                  {Math.round(hour.pop * 100)}%
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
