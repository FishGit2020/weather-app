import React from 'react';
import { useTranslation, Locale } from '@weather/shared';

const LOCALES: { value: Locale; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'es', label: 'ES' },
];

export default function LanguageSelector() {
  const { locale, setLocale } = useTranslation();

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
      className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      aria-label="Select language"
    >
      {LOCALES.map((l) => (
        <option key={l.value} value={l.value}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
