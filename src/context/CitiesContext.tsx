import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { SavedCity } from '@/types/city';

interface CitiesContextType {
  savedCities: SavedCity[];
  addCity: (city: SavedCity) => void;
  removeCity: (cityId: string) => void;
  isCitySaved: (cityId: string) => boolean;
}

const CitiesContext = createContext<CitiesContextType | undefined>(undefined);

const STORAGE_KEY = 'weather-saved-cities';

export function CitiesProvider({ children }: { children: ReactNode }) {
  const [savedCities, setSavedCities] = useState<SavedCity[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setSavedCities(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse saved cities:', e);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedCities));
    }
  }, [savedCities, isLoaded]);

  const addCity = (city: SavedCity) => {
    setSavedCities(prev => {
      const exists = prev.some(c => c.id === city.id);
      if (exists) return prev;
      return [...prev, { ...city, addedAt: Date.now() }];
    });
  };

  const removeCity = (cityId: string) => {
    setSavedCities(prev => prev.filter(c => c.id !== cityId));
  };

  const isCitySaved = (cityId: string) => {
    return savedCities.some(c => c.id === cityId);
  };

  return (
    <CitiesContext.Provider value={{ savedCities, addCity, removeCity, isCitySaved }}>
      {children}
    </CitiesContext.Provider>
  );
}

export function useCities() {
  const context = useContext(CitiesContext);
  if (!context) {
    throw new Error('useCities must be used within CitiesProvider');
  }
  return context;
}
