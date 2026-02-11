import React from 'react';
import { useCities } from '@/context/CitiesContext';
import CityCard from './CityCard';

export default function SavedCities() {
  const { savedCities } = useCities();

  if (savedCities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No saved cities yet. Search and save cities to see them here.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Saved Cities</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedCities.map((city) => (
          <CityCard key={city.id} city={city} />
        ))}
      </div>
    </div>
  );
}
