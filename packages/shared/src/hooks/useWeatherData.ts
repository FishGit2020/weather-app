import { useQuery, useSubscription } from '@apollo/client/react';
import { GET_WEATHER, WEATHER_UPDATES } from '../apollo/queries';
import type { CurrentWeather, ForecastDay, HourlyForecast } from '../types';

// Check if we're in production (Firebase doesn't support WebSocket subscriptions)
const isProduction = typeof window !== 'undefined' &&
  !window.location.hostname.includes('localhost') &&
  window.location.hostname !== '127.0.0.1' &&
  window.location.hostname !== '[::1]';

interface WeatherResponse {
  weather: {
    current: CurrentWeather;
    forecast: ForecastDay[];
    hourly: HourlyForecast[];
  };
}

interface WeatherUpdateResponse {
  weatherUpdates: {
    lat: number;
    lon: number;
    timestamp: string;
    current: CurrentWeather;
  };
}

export function useWeatherData(
  lat: number | null,
  lon: number | null,
  enableRealtime: boolean = false
) {
  const {
    data: queryData,
    loading: queryLoading,
    error: queryError,
    refetch: queryRefetch
  } = useQuery<WeatherResponse>(GET_WEATHER, {
    variables: { lat, lon },
    skip: lat === null || lon === null,
    fetchPolicy: 'cache-and-network'
  });

  // Disable subscriptions in production (Firebase Cloud Functions don't support WebSockets)
  const shouldSubscribe = enableRealtime && !isProduction;

  const {
    data: subscriptionData,
    error: subscriptionError
  } = useSubscription<WeatherUpdateResponse>(WEATHER_UPDATES, {
    variables: { lat, lon },
    skip: !shouldSubscribe || lat === null || lon === null,
    onData: ({ data }) => {
      if (data.data) {
        console.log('Received weather update:', data.data.weatherUpdates.timestamp);
      }
    }
  });

  const current = subscriptionData?.weatherUpdates?.current || queryData?.weather?.current || null;
  const forecast = queryData?.weather?.forecast || null;
  const hourly = queryData?.weather?.hourly || null;

  return {
    current,
    forecast,
    hourly,
    loading: queryLoading,
    error: queryError?.message || subscriptionError?.message || null,
    isLive: !!subscriptionData?.weatherUpdates,
    lastUpdate: subscriptionData?.weatherUpdates?.timestamp || null,
    refetch: queryRefetch
  };
}
