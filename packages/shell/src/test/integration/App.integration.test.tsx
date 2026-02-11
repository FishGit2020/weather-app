import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import App from '../../App';

// Mock the remote modules
vi.mock('citySearch/CitySearch', () => ({
  default: () => <div data-testid="city-search-mfe">City Search Module</div>,
}));

vi.mock('weatherDisplay/WeatherDisplay', () => ({
  default: () => <div data-testid="weather-display-mfe">Weather Display Module</div>,
}));

const renderApp = (initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <MockedProvider mocks={[]} addTypename={false}>
        <App />
      </MockedProvider>
    </MemoryRouter>
  );
};

describe('App Integration', () => {
  describe('Home Page', () => {
    it('renders the home page by default', async () => {
      renderApp('/');

      expect(screen.getByText('Weather Tracker')).toBeInTheDocument();
      expect(screen.getByText('Find Weather for Any City')).toBeInTheDocument();
    });

    it('renders Use My Location button', async () => {
      renderApp('/');

      expect(screen.getByText('Use My Location')).toBeInTheDocument();
    });

    it('loads city search micro frontend', async () => {
      renderApp('/');

      await waitFor(() => {
        expect(screen.getByTestId('city-search-mfe')).toBeInTheDocument();
      });
    });
  });

  describe('Weather Page', () => {
    it('renders weather display on /weather/:coords route', async () => {
      renderApp('/weather/51.5074,-0.1278');

      await waitFor(() => {
        expect(screen.getByTestId('weather-display-mfe')).toBeInTheDocument();
      });
    });
  });

  describe('404 Page', () => {
    it('renders 404 for unknown routes', () => {
      renderApp('/unknown-route');

      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByText('Page not found')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('has working home link in header', () => {
      renderApp('/weather/51.5074,-0.1278');

      const homeLink = screen.getAllByRole('link', { name: /home/i })[0];
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('has working logo link to home', () => {
      renderApp('/weather/51.5074,-0.1278');

      const logoLink = screen.getByRole('link', { name: /Weather Tracker/i });
      expect(logoLink).toHaveAttribute('href', '/');
    });
  });

  describe('Layout', () => {
    it('renders header on all pages', () => {
      renderApp('/');
      expect(screen.getByText('Weather Tracker')).toBeInTheDocument();

      renderApp('/weather/51.5074,-0.1278');
      expect(screen.getByText('Weather Tracker')).toBeInTheDocument();
    });

    it('renders footer on all pages', () => {
      renderApp('/');
      expect(screen.getByText('OpenWeatherMap')).toBeInTheDocument();
    });
  });
});
