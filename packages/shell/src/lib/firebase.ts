import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User, Auth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase is optional — the app works without it (auth features disabled)
const firebaseEnabled = !!firebaseConfig.apiKey;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (firebaseEnabled) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
}

// User profile type
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  darkMode: boolean;
  recentCities: RecentCity[];
  favoriteCities: FavoriteCity[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FavoriteCity {
  id: string;
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

export interface RecentCity {
  id: string;
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
  searchedAt: Date;
}

// Auth functions
export async function signInWithGoogle() {
  if (!auth || !googleProvider) return null;
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await ensureUserProfile(result.user);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

export async function logOut() {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  if (!auth) {
    // No Firebase — immediately report no user and return a no-op unsubscribe
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// Firestore functions
async function ensureUserProfile(user: User) {
  if (!db) return;
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    const newProfile: Omit<UserProfile, 'createdAt' | 'updatedAt'> & { createdAt: any; updatedAt: any } = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      darkMode: false,
      recentCities: [],
      favoriteCities: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(userRef, newProfile);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) return null;
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    return userDoc.data() as UserProfile;
  }
  return null;
}

export async function updateUserDarkMode(uid: string, darkMode: boolean) {
  if (!db) return;
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    darkMode,
    updatedAt: serverTimestamp(),
  });
}

export async function addRecentCity(uid: string, city: Omit<RecentCity, 'searchedAt'>) {
  if (!db) return;
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    const profile = userDoc.data() as UserProfile;
    const recentCities = profile.recentCities || [];

    // Remove duplicate if exists
    const filteredCities = recentCities.filter(c => c.id !== city.id);

    // Add new city at the beginning
    const newCity: RecentCity = {
      ...city,
      searchedAt: new Date(),
    };

    // Keep only last 10 cities
    const updatedCities = [newCity, ...filteredCities].slice(0, 10);

    await updateDoc(userRef, {
      recentCities: updatedCities,
      updatedAt: serverTimestamp(),
    });
  }
}

export async function removeRecentCity(uid: string, cityId: string) {
  if (!db) return;
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    const profile = userDoc.data() as UserProfile;
    const updatedCities = (profile.recentCities || []).filter(c => c.id !== cityId);

    await updateDoc(userRef, {
      recentCities: updatedCities,
      updatedAt: serverTimestamp(),
    });
  }
}

export async function toggleFavoriteCity(uid: string, city: FavoriteCity): Promise<boolean> {
  if (!db) return false;
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    const profile = userDoc.data() as UserProfile;
    const favorites = profile.favoriteCities || [];
    const exists = favorites.some(c => c.id === city.id);

    const updatedFavorites = exists
      ? favorites.filter(c => c.id !== city.id)
      : [...favorites, city];

    await updateDoc(userRef, {
      favoriteCities: updatedFavorites,
      updatedAt: serverTimestamp(),
    });

    return !exists; // returns true if added, false if removed
  }
  return false;
}

export async function getRecentCities(uid: string): Promise<RecentCity[]> {
  const profile = await getUserProfile(uid);
  return profile?.recentCities || [];
}

export { auth, db, firebaseEnabled };
