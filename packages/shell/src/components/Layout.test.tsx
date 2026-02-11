import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from './Layout';

const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      {ui}
    </MemoryRouter>
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
