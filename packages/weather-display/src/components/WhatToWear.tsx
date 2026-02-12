import React from 'react';
import { CurrentWeather, useTranslation, TranslationKey } from '@weather/shared';

interface Suggestion {
  icon: string;
  key: TranslationKey;
}

function getSuggestionKeys(weather: CurrentWeather): Suggestion[] {
  const temp = weather.temp;
  const wind = weather.wind.speed;
  const mainWeather = weather.weather[0]?.main?.toLowerCase() || '';
  const humidity = weather.humidity;
  const suggestions: Suggestion[] = [];

  // Temperature-based
  if (temp <= -10) {
    suggestions.push({ icon: '\u{1F9E5}', key: 'wear.heavyWinterCoat' });
    suggestions.push({ icon: '\u{1F9E4}', key: 'wear.insulatedGloves' });
    suggestions.push({ icon: '\u{1F9E3}', key: 'wear.scarfWarmHat' });
    suggestions.push({ icon: '\u{1F97E}', key: 'wear.winterBoots' });
  } else if (temp <= 0) {
    suggestions.push({ icon: '\u{1F9E5}', key: 'wear.winterCoat' });
    suggestions.push({ icon: '\u{1F9E4}', key: 'wear.gloves' });
    suggestions.push({ icon: '\u{1F9E3}', key: 'wear.scarf' });
  } else if (temp <= 10) {
    suggestions.push({ icon: '\u{1F9E5}', key: 'wear.warmJacket' });
    suggestions.push({ icon: '\u{1F456}', key: 'wear.longPants' });
    suggestions.push({ icon: '\u{1F45F}', key: 'wear.closedShoes' });
  } else if (temp <= 18) {
    suggestions.push({ icon: '\u{1F9E5}', key: 'wear.lightJacketSweater' });
    suggestions.push({ icon: '\u{1F456}', key: 'wear.jeansPants' });
  } else if (temp <= 25) {
    suggestions.push({ icon: '\u{1F455}', key: 'wear.tshirtLightShirt' });
    suggestions.push({ icon: '\u{1F456}', key: 'wear.lightPantsJeans' });
  } else if (temp <= 32) {
    suggestions.push({ icon: '\u{1F455}', key: 'wear.lightBreathable' });
    suggestions.push({ icon: '\u{1FA73}', key: 'wear.shorts' });
    suggestions.push({ icon: '\u{1F45F}', key: 'wear.openShoesSandals' });
  } else {
    suggestions.push({ icon: '\u{1F455}', key: 'wear.minimalLight' });
    suggestions.push({ icon: '\u{1FA73}', key: 'wear.shorts' });
    suggestions.push({ icon: '\u{1F4A7}', key: 'wear.waterBottle' });
  }

  // Rain
  if (mainWeather.includes('rain') || mainWeather.includes('drizzle')) {
    suggestions.push({ icon: '\u2602\uFE0F', key: 'wear.umbrella' });
    suggestions.push({ icon: '\u{1F9E5}', key: 'wear.waterproofJacket' });
  }

  // Snow
  if (mainWeather.includes('snow')) {
    suggestions.push({ icon: '\u{1F97E}', key: 'wear.waterproofBoots' });
  }

  // Wind
  if (wind > 10) {
    suggestions.push({ icon: '\u{1F9E5}', key: 'wear.windbreaker' });
  }

  // Sun protection
  if (temp > 20 && !mainWeather.includes('cloud') && !mainWeather.includes('rain')) {
    suggestions.push({ icon: '\u{1F576}\uFE0F', key: 'wear.sunglasses' });
    suggestions.push({ icon: '\u{1F9F4}', key: 'wear.sunscreen' });
    if (temp > 28) {
      suggestions.push({ icon: '\u{1F9E2}', key: 'wear.hatSunProtection' });
    }
  }

  // Humidity
  if (humidity > 80 && temp > 20) {
    suggestions.push({ icon: '\u{1F4A8}', key: 'wear.moistureWicking' });
  }

  return suggestions;
}

interface Props {
  data: CurrentWeather;
}

export default function WhatToWear({ data }: Props) {
  const { t } = useTranslation();
  const suggestions = getSuggestionKeys(data);
  if (suggestions.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
        <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        {t('weather.whatToWear')}
      </h3>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300"
          >
            <span>{s.icon}</span>
            {t(s.key)}
          </span>
        ))}
      </div>
    </div>
  );
}
