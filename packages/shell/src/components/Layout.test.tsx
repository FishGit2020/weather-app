import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from './Layout';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';

// Mock the firebase lib so AuthProvider doesn't need real Firebase
vi.mock('../lib/firebase', () => ({
  firebaseEnabled: false,
  app: null,
  auth: null,
  db: null,
  perf: null,
  subscribeToAuthChanges: (cb: (user: null) => void) => { cb(null); return () => {}; },
  signInWithGoogle: vi.fn(),
  logOut: vi.fn(),
  getUserProfile: vi.fn().mockResolvedValue(null),
  updateUserDarkMode: vi.fn(),
  addRecentCity: vi.fn(),
  removeRecentCity: vi.fn(),
  getRecentCities: vi.fn().mockResolvedValue([]),
  toggleFavoriteCity: vi.fn().mockResolvedValue(false),
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <MemoryRouter>
          {ui}
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

describe('Layout', () => {
  it('renders header with app title', () => {
    renderWithRouter(<Layout />);

    expect(screen.getByText('Weather Tracker')).toBeInTheDocument();
  });

  it('renders MicroFE badge', () => {
    renderWithRouter(<Layout />);

    expect(screen.getByText('MicroFE')).toBeInTheDocument();
  });

  it('renders Home navigation link', () => {
    renderWithRouter(<Layout />);

    const homeLinks = screen.getAllByText('Home');
    expect(homeLinks.length).toBeGreaterThan(0);
  });

  it('renders footer with OpenWeatherMap attribution', () => {
    renderWithRouter(<Layout />);

    expect(screen.getByText('OpenWeatherMap')).toBeInTheDocument();
  });

  it('renders footer with tech stack info', () => {
    renderWithRouter(<Layout />);

    expect(screen.getByText(/Built with React, Vite, and Micro Frontend Architecture/)).toBeInTheDocument();
  });

  it('header logo links to home', () => {
    renderWithRouter(<Layout />);

    const logoLink = screen.getByRole('link', { name: /Weather Tracker/i });
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('OpenWeatherMap link opens in new tab', () => {
    renderWithRouter(<Layout />);

    const owmLink = screen.getByRole('link', { name: 'OpenWeatherMap' });
    expect(owmLink).toHaveAttribute('target', '_blank');
    expect(owmLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
