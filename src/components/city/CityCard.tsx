import React from 'react';
import { Link } from 'react-router-dom';
import type { SavedCity } from '@/types/city';
import { useCities } from '@/context/CitiesContext';

interface Props {
  city: SavedCity;
}

export default function CityCard({ city }: Props) {
  const { removeCity } = useCities();

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    removeCity(city.id);
  };

  return (
    <Link
      to={`/weather/${city.lat},${city.lon}?name=${encodeURIComponent(city.name)}`}
      className="weather-card block relative group"
    >
      <button
        onClick={handleRemove}
        className="absolute top-2 right-2 p-2 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
        title="Remove city"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <h3 className="text-xl font-bold mb-1">{city.name}</h3>
      <p className="text-sm text-gray-500">
        {city.state && `${city.state}, `}{city.country}
      </p>
    </Link>
  );
}
