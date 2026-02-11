export const typeDefs = `#graphql
  type WeatherCondition {
    id: Int!
    main: String!
    description: String!
    icon: String!
  }

  type Wind {
    speed: Float!
    deg: Int!
    gust: Float
  }

  type Clouds {
    all: Int!
  }

  type Temperature {
    min: Float!
    max: Float!
    day: Float!
    night: Float!
  }

  type CurrentWeather {
    temp: Float!
    feels_like: Float!
    temp_min: Float!
    temp_max: Float!
    pressure: Int!
    humidity: Int!
    weather: [WeatherCondition!]!
    wind: Wind!
    clouds: Clouds!
    dt: Int!
    timezone: Int!
  }

  type ForecastDay {
    dt: Int!
    temp: Temperature!
    weather: [WeatherCondition!]!
    humidity: Int!
    wind_speed: Float!
    pop: Float!
  }

  type HourlyForecast {
    dt: Int!
    temp: Float!
    weather: [WeatherCondition!]!
    pop: Float!
    wind_speed: Float!
  }

  type WeatherData {
    current: CurrentWeather
    forecast: [ForecastDay!]
    hourly: [HourlyForecast!]
  }

  type City {
    id: String!
    name: String!
    country: String!
    state: String
    lat: Float!
    lon: Float!
  }

  type WeatherUpdate {
    lat: Float!
    lon: Float!
    current: CurrentWeather!
    timestamp: String!
  }

  type Query {
    """
    Get comprehensive weather data for a location
    """
    weather(lat: Float!, lon: Float!): WeatherData!

    """
    Get current weather only
    """
    currentWeather(lat: Float!, lon: Float!): CurrentWeather!

    """
    Get 7-day forecast
    """
    forecast(lat: Float!, lon: Float!): [ForecastDay!]!

    """
    Get hourly forecast (48 hours)
    """
    hourlyForecast(lat: Float!, lon: Float!): [HourlyForecast!]!

    """
    Search for cities by name
    """
    searchCities(query: String!, limit: Int = 5): [City!]!
  }

  type Subscription {
    """
    Subscribe to real-time weather updates for a location
    Updates every 10 minutes
    """
    weatherUpdates(lat: Float!, lon: Float!): WeatherUpdate!
  }

  schema {
    query: Query
    subscription: Subscription
  }
`;
