import React from 'react';
import { CurrentWeather, useTranslation, TranslationKey } from '@weather/shared';

interface Suggestion {
  icon: string;
  key: TranslationKey;
  category: 'top' | 'bottom' | 'footwear' | 'accessory' | 'protection' | 'tip';
}

function getSuggestionKeys(weather: CurrentWeather): Suggestion[] {
  const temp = weather.temp;
  const wind = weather.wind.speed;
  const gust = weather.wind.gust ?? wind;
  const mainWeather = weather.weather[0]?.main?.toLowerCase() || '';
  const weatherId = weather.weather[0]?.id || 0;
  const humidity = weather.humidity;
  const visibility = weather.visibility ?? 10000;
  const suggestions: Suggestion[] = [];

  // ── Temperature-based tops ────────────────────────────────
  if (temp <= -10) {
    suggestions.push({ icon: '\u{1F9E5}', key: 'wear.heavyWinterCoat', category: 'top' });
    suggestions.push({ icon: '\u{1F9E5}', key: 'wear.thermalBaseLayer', category: 'top' });
    suggestions.push({ icon: '\u{1F9E5}', key: 'wear.fleeceMiddleLayer', category: 'top' });
  } else if (temp <= 0) {
    suggestions.push({ icon: '\u{1F9E5}', key: 'wear.winterCoat', category: 'top' });
    suggestions.push({ icon: '\u{1F9E5}', key: 'wear.thermalBaseLayer', category: 'top' });
  } else if (temp <= 10) {
    suggestions.push({ icon: '\u{1F9E5}', key: 'wear.warmJacket', category: 'top' });
    suggestions.push({ icon: '\u{1F455}', key: 'wear.layeredTop', category: 'top' });
  } else if (temp <= 18) {
    suggestions.push({ icon: '\u{1F9E5}', key: 'wear.lightJacketSweater', category: 'top' });
    suggestions.push({ icon: '\u{1F455}', key: 'wear.longSleeveShirt', category: 'top' });
  } else if (temp <= 25) {
    suggestions.push({ icon: '\u{1F455}', key: 'wear.tshirtLightShirt', category: 'top' });
  } else if (temp <= 32) {
    suggestions.push({ icon: '\u{1F455}', key: 'wear.lightBreathable', category: 'top' });
    suggestions.push({ icon: '\u{1F455}', key: 'wear.tankTopSleeveless', category: 'top' });
  } else {
    suggestions.push({ icon: '\u{1F455}', key: 'wear.minimalLight', category: 'top' });
    suggestions.push({ icon: '\u{1F455}', key: 'wear.uvProtectiveShirt', category: 'top' });
  }

  // ── Temperature-based bottoms ─────────────────────────────
  if (temp <= 0) {
    suggestions.push({ icon: '\u{1F456}', key: 'wear.insulatedPants', category: 'bottom' });
    suggestions.push({ icon: '\u{1F456}', key: 'wear.thermalLeggings', category: 'bottom' });
  } else if (temp <= 10) {
    suggestions.push({ icon: '\u{1F456}', key: 'wear.longPants', category: 'bottom' });
  } else if (temp <= 18) {
    suggestions.push({ icon: '\u{1F456}', key: 'wear.jeansPants', category: 'bottom' });
  } else if (temp <= 25) {
    suggestions.push({ icon: '\u{1F456}', key: 'wear.lightPantsJeans', category: 'bottom' });
  } else {
    suggestions.push({ icon: '\u{1FA73}', key: 'wear.shorts', category: 'bottom' });
    suggestions.push({ icon: '\u{1F456}', key: 'wear.lightLinenPants', category: 'bottom' });
  }

  // ── Temperature-based footwear ────────────────────────────
  if (temp <= -10) {
    suggestions.push({ icon: '\u{1F97E}', key: 'wear.winterBoots', category: 'footwear' });
    suggestions.push({ icon: '\u{1F9E6}', key: 'wear.woolSocks', category: 'footwear' });
  } else if (temp <= 0) {
    suggestions.push({ icon: '\u{1F97E}', key: 'wear.winterBoots', category: 'footwear' });
  } else if (temp <= 15) {
    suggestions.push({ icon: '\u{1F45F}', key: 'wear.closedShoes', category: 'footwear' });
  } else if (temp <= 25) {
    suggestions.push({ icon: '\u{1F45F}', key: 'wear.sneakers', category: 'footwear' });
  } else {
    suggestions.push({ icon: '\u{1FA74}', key: 'wear.openShoesSandals', category: 'footwear' });
  }

  // ── Cold-weather accessories ──────────────────────────────
  if (temp <= -10) {
    suggestions.push({ icon: '\u{1F9E4}', key: 'wear.insulatedGloves', category: 'accessory' });
    suggestions.push({ icon: '\u{1F9E3}', key: 'wear.scarfWarmHat', category: 'accessory' });
    suggestions.push({ icon: '\u{1F9E3}', key: 'wear.faceCovering', category: 'accessory' });
  } else if (temp <= 0) {
    suggestions.push({ icon: '\u{1F9E4}', key: 'wear.gloves', category: 'accessory' });
    suggestions.push({ icon: '\u{1F9E3}', key: 'wear.scarf', category: 'accessory' });
    suggestions.push({ icon: '\u{1F3A9}', key: 'wear.warmHat', category: 'accessory' });
  } else if (temp <= 5) {
    suggestions.push({ icon: '\u{1F9E3}', key: 'wear.lightScarf', category: 'accessory' });
    suggestions.push({ icon: '\u{1F3A9}', key: 'wear.beanie', category: 'accessory' });
  }

  // ── Rain gear ─────────────────────────────────────────────
  if (mainWeather.includes('rain') || mainWeather.includes('drizzle') || mainWeather.includes('thunderstorm')) {
    suggestions.push({ icon: '\u2602\uFE0F', key: 'wear.umbrella', category: 'protection' });
    suggestions.push({ icon: '\u{1F9E5}', key: 'wear.waterproofJacket', category: 'protection' });
    suggestions.push({ icon: '\u{1F97E}', key: 'wear.waterproofShoes', category: 'footwear' });
    if (weatherId >= 502 && weatherId <= 531) {
      // Heavy rain
      suggestions.push({ icon: '\u{1F456}', key: 'wear.waterproofPants', category: 'protection' });
    }
  }

  // ── Snow gear ─────────────────────────────────────────────
  if (mainWeather.includes('snow')) {
    suggestions.push({ icon: '\u{1F97E}', key: 'wear.waterproofBoots', category: 'footwear' });
    suggestions.push({ icon: '\u{1F456}', key: 'wear.waterproofPants', category: 'protection' });
    if (temp <= -5) {
      suggestions.push({ icon: '\u{1F576}\uFE0F', key: 'wear.snowGoggles', category: 'accessory' });
    }
  }

  // ── Wind protection ───────────────────────────────────────
  if (wind > 8 || gust > 12) {
    suggestions.push({ icon: '\u{1F32C}\uFE0F', key: 'wear.windbreaker', category: 'protection' });
  }
  if (gust > 18) {
    suggestions.push({ icon: '\u{1F32C}\uFE0F', key: 'wear.secureFittingClothes', category: 'tip' });
  }

  // ── Sun protection ────────────────────────────────────────
  const isClear = mainWeather === 'clear' || weatherId === 800;
  const isPartlyCloudy = weatherId >= 801 && weatherId <= 802;
  if (temp > 18 && (isClear || isPartlyCloudy)) {
    suggestions.push({ icon: '\u{1F576}\uFE0F', key: 'wear.sunglasses', category: 'accessory' });
    suggestions.push({ icon: '\u{1F9F4}', key: 'wear.sunscreen', category: 'protection' });
    if (temp > 25) {
      suggestions.push({ icon: '\u{1F9E2}', key: 'wear.hatSunProtection', category: 'accessory' });
    }
  }

  // ── Humidity-specific ─────────────────────────────────────
  if (humidity > 80 && temp > 20) {
    suggestions.push({ icon: '\u{1F4A8}', key: 'wear.moistureWicking', category: 'tip' });
    suggestions.push({ icon: '\u{1F455}', key: 'wear.looseFittingClothes', category: 'tip' });
  }
  if (humidity > 70 && temp > 25) {
    suggestions.push({ icon: '\u{1F455}', key: 'wear.cottonOrLinen', category: 'tip' });
  }

  // ── Fog / low visibility ──────────────────────────────────
  if (mainWeather === 'fog' || mainWeather === 'mist' || visibility < 2000) {
    suggestions.push({ icon: '\u{1F6A8}', key: 'wear.brightReflective', category: 'tip' });
  }

  // ── Hydration tips ────────────────────────────────────────
  if (temp > 28) {
    suggestions.push({ icon: '\u{1F4A7}', key: 'wear.waterBottle', category: 'tip' });
  }
  if (temp > 35) {
    suggestions.push({ icon: '\u2744\uFE0F', key: 'wear.coolingTowel', category: 'tip' });
  }

  // ── Layering advice ───────────────────────────────────────
  // Big day/night temperature swings implied by wind + moderate temps
  if (temp >= 10 && temp <= 22 && wind > 5) {
    suggestions.push({ icon: '\u{1F501}', key: 'wear.dressInLayers', category: 'tip' });
  }

  return suggestions;
}

const CATEGORY_ORDER: Suggestion['category'][] = ['top', 'bottom', 'footwear', 'accessory', 'protection', 'tip'];

const CATEGORY_LABEL_KEYS: Record<Suggestion['category'], TranslationKey> = {
  top: 'wear.catTops',
  bottom: 'wear.catBottoms',
  footwear: 'wear.catFootwear',
  accessory: 'wear.catAccessories',
  protection: 'wear.catProtection',
  tip: 'wear.catTips',
};

interface Props {
  data: CurrentWeather;
}

export default function WhatToWear({ data }: Props) {
  const { t } = useTranslation();
  const suggestions = getSuggestionKeys(data);
  if (suggestions.length === 0) return null;

  // Group by category
  const grouped = CATEGORY_ORDER
    .map((cat) => ({
      category: cat,
      items: suggestions.filter((s) => s.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        {t('weather.whatToWear')}
      </h3>
      <div className="space-y-3">
        {grouped.map((group) => (
          <div key={group.category}>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5">
              {t(CATEGORY_LABEL_KEYS[group.category])}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.items.map((s, i) => (
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
        ))}
      </div>
    </div>
  );
}
