import React from 'react';
import { CurrentWeather } from '@weather/shared';

interface Suggestion {
  icon: string;
  item: string;
}

function getSuggestions(weather: CurrentWeather): Suggestion[] {
  const temp = weather.temp;
  const wind = weather.wind.speed;
  const mainWeather = weather.weather[0]?.main?.toLowerCase() || '';
  const humidity = weather.humidity;
  const suggestions: Suggestion[] = [];

  // Temperature-based
  if (temp <= -10) {
    suggestions.push({ icon: '🧥', item: 'Heavy winter coat' });
    suggestions.push({ icon: '🧤', item: 'Insulated gloves' });
    suggestions.push({ icon: '🧣', item: 'Scarf & warm hat' });
    suggestions.push({ icon: '🥾', item: 'Winter boots' });
  } else if (temp <= 0) {
    suggestions.push({ icon: '🧥', item: 'Winter coat' });
    suggestions.push({ icon: '🧤', item: 'Gloves' });
    suggestions.push({ icon: '🧣', item: 'Scarf' });
  } else if (temp <= 10) {
    suggestions.push({ icon: '🧥', item: 'Warm jacket' });
    suggestions.push({ icon: '👖', item: 'Long pants' });
    suggestions.push({ icon: '👟', item: 'Closed shoes' });
  } else if (temp <= 18) {
    suggestions.push({ icon: '🧥', item: 'Light jacket or sweater' });
    suggestions.push({ icon: '👖', item: 'Jeans or pants' });
  } else if (temp <= 25) {
    suggestions.push({ icon: '👕', item: 'T-shirt or light shirt' });
    suggestions.push({ icon: '👖', item: 'Light pants or jeans' });
  } else if (temp <= 32) {
    suggestions.push({ icon: '👕', item: 'Light, breathable clothing' });
    suggestions.push({ icon: '🩳', item: 'Shorts' });
    suggestions.push({ icon: '👟', item: 'Open shoes or sandals' });
  } else {
    suggestions.push({ icon: '👕', item: 'Minimal, light clothing' });
    suggestions.push({ icon: '🩳', item: 'Shorts' });
    suggestions.push({ icon: '💧', item: 'Carry water bottle' });
  }

  // Rain
  if (mainWeather.includes('rain') || mainWeather.includes('drizzle')) {
    suggestions.push({ icon: '☂️', item: 'Umbrella' });
    suggestions.push({ icon: '🧥', item: 'Waterproof jacket' });
  }

  // Snow
  if (mainWeather.includes('snow')) {
    suggestions.push({ icon: '🥾', item: 'Waterproof boots' });
  }

  // Wind
  if (wind > 10) {
    suggestions.push({ icon: '🧥', item: 'Windbreaker' });
  }

  // Sun protection
  if (temp > 20 && !mainWeather.includes('cloud') && !mainWeather.includes('rain')) {
    suggestions.push({ icon: '🕶️', item: 'Sunglasses' });
    suggestions.push({ icon: '🧴', item: 'Sunscreen' });
    if (temp > 28) {
      suggestions.push({ icon: '🧢', item: 'Hat for sun protection' });
    }
  }

  // Humidity
  if (humidity > 80 && temp > 20) {
    suggestions.push({ icon: '💨', item: 'Moisture-wicking fabrics' });
  }

  return suggestions;
}

interface Props {
  data: CurrentWeather;
}

export default function WhatToWear({ data }: Props) {
  const suggestions = getSuggestions(data);
  if (suggestions.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
        <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        What to Wear
      </h3>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300"
          >
            <span>{s.icon}</span>
            {s.item}
          </span>
        ))}
      </div>
    </div>
  );
}
