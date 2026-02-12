import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  subscribeToAuthChanges,
  signInWithGoogle,
  logOut,
  getUserProfile,
  updateUserDarkMode,
  updateUserLocale,
  addRecentCity,
  removeRecentCity,
  getRecentCities,
  toggleFavoriteCity,
  identifyUser,
  clearUserIdentity,
  logEvent,
  UserProfile,
  RecentCity,
  FavoriteCity,
} from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  updateDarkMode: (darkMode: boolean) => Promise<void>;
  updateLocale: (locale: string) => Promise<void>;
  addCity: (city: Omit<RecentCity, 'searchedAt'>) => Promise<void>;
  removeCity: (cityId: string) => Promise<void>;
  toggleFavorite: (city: FavoriteCity) => Promise<boolean>;
  recentCities: RecentCity[];
  favoriteCities: FavoriteCity[];
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentCities, setRecentCities] = useState<RecentCity[]>([]);
  const [favoriteCities, setFavoriteCities] = useState<FavoriteCity[]>([]);

  const refreshProfile = async () => {
    if (user) {
      const userProfile = await getUserProfile(user.uid);
      setProfile(userProfile);
      if (userProfile) {
        setRecentCities(userProfile.recentCities || []);
        setFavoriteCities(userProfile.favoriteCities || []);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Link analytics sessions to this authenticated user
        identifyUser(firebaseUser.uid, {
          sign_in_method: 'google',
        });
        logEvent('login', { method: 'google' });

        const userProfile = await getUserProfile(firebaseUser.uid);
        setProfile(userProfile);
        if (userProfile) {
          setRecentCities(userProfile.recentCities || []);
          setFavoriteCities(userProfile.favoriteCities || []);
        }
      } else {
        clearUserIdentity();
        setProfile(null);
        setRecentCities([]);
        setFavoriteCities([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      await logOut();
      setProfile(null);
      setRecentCities([]);
      setFavoriteCities([]);
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  };

  const updateDarkMode = async (darkMode: boolean) => {
    if (user) {
      await updateUserDarkMode(user.uid, darkMode);
      setProfile((prev) => (prev ? { ...prev, darkMode } : null));
    }
  };

  const updateLocale = useCallback(async (locale: string) => {
    if (user) {
      await updateUserLocale(user.uid, locale);
      setProfile((prev) => (prev ? { ...prev, locale } : null));
    }
  }, [user]);

  const addCity = useCallback(async (city: Omit<RecentCity, 'searchedAt'>) => {
    if (user) {
      await addRecentCity(user.uid, city);
      const cities = await getRecentCities(user.uid);
      setRecentCities(cities);
    }
    logEvent('city_searched', { city_name: city.name, city_country: city.country });
  }, [user]);

  const removeCity = useCallback(async (cityId: string) => {
    if (user) {
      await removeRecentCity(user.uid, cityId);
      const cities = await getRecentCities(user.uid);
      setRecentCities(cities);
    }
  }, [user]);

  const toggleFavorite = useCallback(async (city: FavoriteCity): Promise<boolean> => {
    if (user) {
      const isNowFavorite = await toggleFavoriteCity(user.uid, city);
      const updatedProfile = await getUserProfile(user.uid);
      if (updatedProfile) {
        setFavoriteCities(updatedProfile.favoriteCities || []);
      }
      return isNowFavorite;
    }
    return false;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signOut: signOutUser,
        updateDarkMode,
        updateLocale,
        addCity,
        removeCity,
        toggleFavorite,
        recentCities,
        favoriteCities,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
