import { useQuery, useSubscription } from '@apollo/client/react';
import { GET_WEATHER, WEATHER_UPDATES } from '@/graphql/queries';
import type { CurrentWeather, ForecastDay, HourlyForecast } from '@/types/weather';

interface WeatherData {
  current: CurrentWeather | null;
  forecast: ForecastDay[] | null;
  hourly: HourlyForecast[] | null;
  loading: boolean;
  error: string | null;
}

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

export function useWeatherDataGraphQL(
  lat: number | null,
  lon: number | null,
  enableRealtime: boolean = false
) {
  // Query for initial data
  const {
    data: queryData,
    loading: queryLoading,
    error: queryError
  } = useQuery<WeatherResponse>(GET_WEATHER, {
    variables: { lat, lon },
    skip: lat === null || lon === null,
    fetchPolicy: 'cache-and-network'
  });

  // Subscription for real-time updates (optional)
  const {
    data: subscriptionData,
    error: subscriptionError
  } = useSubscription<WeatherUpdateResponse>(WEATHER_UPDATES, {
    variables: { lat, lon },
    skip: !enableRealtime || lat === null || lon === null,
    onData: ({ data }) => {
      if (data.data) {
        console.log('Received weather update:', data.data.weatherUpdates.timestamp);
      }
    }
  });

  // Combine query and subscription data
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
    lastUpdate: subscriptionData?.weatherUpdates?.timestamp || null
  };
}
