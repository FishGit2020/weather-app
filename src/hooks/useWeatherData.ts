import { useState, useEffect } from 'react';
import axios from 'axios';
import type { CurrentWeather, ForecastDay, HourlyForecast } from '@/types/weather';

interface WeatherData {
  current: CurrentWeather | null;
  forecast: ForecastDay[] | null;
  hourly: HourlyForecast[] | null;
  loading: boolean;
  error: string | null;
}

export function useWeatherData(lat: number | null, lon: number | null) {
  const [data, setData] = useState<WeatherData>({
    current: null,
    forecast: null,
    hourly: null,
    loading: false,
    error: null
  });

  useEffect(() => {
    if (lat === null || lon === null) return;

    let cancelled = false;

    async function fetchWeatherData() {
      setData(prev => ({ ...prev, loading: true, error: null }));

      try {
        const [currentRes, forecastRes, hourlyRes] = await Promise.all([
          axios.get(`/api/weather/current?lat=${lat}&lon=${lon}`),
          axios.get(`/api/weather/forecast?lat=${lat}&lon=${lon}`),
          axios.get(`/api/weather/hourly?lat=${lat}&lon=${lon}`)
        ]);

        if (!cancelled) {
          setData({
            current: currentRes.data.data,
            forecast: forecastRes.data.data,
            hourly: hourlyRes.data.data,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to fetch weather:', error);
          setData(prev => ({
            ...prev,
            loading: false,
            error: 'Failed to load weather data. Please try again.'
          }));
        }
      }
    }

    fetchWeatherData();

    return () => {
      cancelled = true;
    };
  }, [lat, lon]);

  return data;
}
