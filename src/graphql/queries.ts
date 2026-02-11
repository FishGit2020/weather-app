import { gql } from '@apollo/client';

// Fragment for weather condition
const WEATHER_CONDITION_FRAGMENT = gql`
  fragment WeatherConditionFields on WeatherCondition {
    id
    main
    description
    icon
  }
`;

// Query to get all weather data (current, forecast, hourly)
export const GET_WEATHER = gql`
  ${WEATHER_CONDITION_FRAGMENT}
  query GetWeather($lat: Float!, $lon: Float!) {
    weather(lat: $lat, lon: $lon) {
      current {
        temp
        feels_like
        temp_min
        temp_max
        pressure
        humidity
        weather {
          ...WeatherConditionFields
        }
        wind {
          speed
          deg
          gust
        }
        clouds {
          all
        }
        dt
        timezone
      }
      forecast {
        dt
        temp {
          min
          max
          day
          night
        }
        weather {
          ...WeatherConditionFields
        }
        humidity
        wind_speed
        pop
      }
      hourly {
        dt
        temp
        weather {
          ...WeatherConditionFields
        }
        pop
        wind_speed
      }
    }
  }
`;

// Query to get current weather only
export const GET_CURRENT_WEATHER = gql`
  ${WEATHER_CONDITION_FRAGMENT}
  query GetCurrentWeather($lat: Float!, $lon: Float!) {
    currentWeather(lat: $lat, lon: $lon) {
      temp
      feels_like
      temp_min
      temp_max
      pressure
      humidity
      weather {
        ...WeatherConditionFields
      }
      wind {
        speed
        deg
        gust
      }
      clouds {
        all
      }
      dt
      timezone
    }
  }
`;

// Query to get forecast only
export const GET_FORECAST = gql`
  ${WEATHER_CONDITION_FRAGMENT}
  query GetForecast($lat: Float!, $lon: Float!) {
    forecast(lat: $lat, lon: $lon) {
      dt
      temp {
        min
        max
        day
        night
      }
      weather {
        ...WeatherConditionFields
      }
      humidity
      wind_speed
      pop
    }
  }
`;

// Query to get hourly forecast only
export const GET_HOURLY_FORECAST = gql`
  ${WEATHER_CONDITION_FRAGMENT}
  query GetHourlyForecast($lat: Float!, $lon: Float!) {
    hourlyForecast(lat: $lat, lon: $lon) {
      dt
      temp
      weather {
        ...WeatherConditionFields
      }
      pop
      wind_speed
    }
  }
`;

// Query to search cities
export const SEARCH_CITIES = gql`
  query SearchCities($query: String!, $limit: Int) {
    searchCities(query: $query, limit: $limit) {
      id
      name
      country
      state
      lat
      lon
    }
  }
`;

// Subscription for real-time weather updates
export const WEATHER_UPDATES = gql`
  ${WEATHER_CONDITION_FRAGMENT}
  subscription WeatherUpdates($lat: Float!, $lon: Float!) {
    weatherUpdates(lat: $lat, lon: $lon) {
      lat
      lon
      timestamp
      current {
        temp
        feels_like
        temp_min
        temp_max
        pressure
        humidity
        weather {
          ...WeatherConditionFields
        }
        wind {
          speed
          deg
          gust
        }
        clouds {
          all
        }
        dt
        timezone
      }
    }
  }
`;
