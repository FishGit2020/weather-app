import React from 'react';
import { CurrentWeather, ForecastDay } from '@weather/shared';

interface Alert {
  severity: 'warning' | 'watch' | 'info';
  title: string;
  message: string;
}

function generateAlerts(current: CurrentWeather, forecast: ForecastDay[]): Alert[] {
  const alerts: Alert[] = [];

  // Extreme heat
  if (current.temp >= 38) {
    alerts.push({ severity: 'warning', title: 'Extreme Heat', message: `Current temperature is ${Math.round(current.temp)}°C. Stay hydrated and avoid prolonged outdoor exposure.` });
  } else if (current.temp >= 33) {
    alerts.push({ severity: 'watch', title: 'Heat Advisory', message: `Temperature is ${Math.round(current.temp)}°C. Take precautions if spending time outdoors.` });
  }

  // Extreme cold
  if (current.temp <= -20) {
    alerts.push({ severity: 'warning', title: 'Extreme Cold', message: `Temperature is ${Math.round(current.temp)}°C. Risk of frostbite — limit outdoor exposure.` });
  } else if (current.temp <= -10) {
    alerts.push({ severity: 'watch', title: 'Cold Advisory', message: `Temperature is ${Math.round(current.temp)}°C. Dress warmly and watch for ice.` });
  }

  // High wind
  if (current.wind.speed >= 20) {
    alerts.push({ severity: 'warning', title: 'High Wind Warning', message: `Wind speeds at ${Math.round(current.wind.speed)} m/s${current.wind.gust ? ` with gusts up to ${Math.round(current.wind.gust)} m/s` : ''}. Secure loose objects.` });
  } else if (current.wind.speed >= 13) {
    alerts.push({ severity: 'watch', title: 'Wind Advisory', message: `Wind speeds at ${Math.round(current.wind.speed)} m/s. Be cautious driving.` });
  }

  // Severe weather conditions (thunderstorm, tornado, etc.)
  const mainWeather = current.weather[0]?.main?.toLowerCase() || '';
  const weatherId = current.weather[0]?.id || 0;

  if (weatherId >= 200 && weatherId < 300) {
    alerts.push({ severity: 'warning', title: 'Thunderstorm', message: 'Thunderstorm activity detected. Seek shelter indoors.' });
  }

  // Heavy rain from forecast
  const upcomingRain = forecast.slice(0, 3).filter(d => d.pop >= 0.7);
  if (upcomingRain.length > 0) {
    alerts.push({ severity: 'info', title: 'Rain Expected', message: `High chance of rain in the next ${upcomingRain.length} day(s). Don't forget an umbrella!` });
  }

  // Poor visibility / fog
  if (mainWeather === 'fog' || mainWeather === 'mist' || mainWeather === 'haze') {
    alerts.push({ severity: 'info', title: 'Low Visibility', message: `${current.weather[0]?.description}. Drive carefully and use fog lights.` });
  }

  return alerts;
}

const severityConfig = {
  warning: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-700 dark:text-red-300',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z',
  },
  watch: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-700 dark:text-yellow-300',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300',
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
};

interface Props {
  current: CurrentWeather;
  forecast: ForecastDay[];
}

export default function WeatherAlerts({ current, forecast }: Props) {
  const alerts = generateAlerts(current, forecast);
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => {
        const config = severityConfig[alert.severity];
        return (
          <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${config.bg} ${config.border}`}>
            <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={config.icon} />
            </svg>
            <div>
              <p className={`font-medium text-sm ${config.text}`}>{alert.title}</p>
              <p className={`text-sm mt-0.5 ${config.text} opacity-80`}>{alert.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
