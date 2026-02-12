import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import StockTracker from './StockTracker';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('StockTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ result: [] }),
    });
  });

  it('renders the stock tracker title', () => {
    render(<StockTracker />);

    expect(screen.getByText('Stock Tracker')).toBeInTheDocument();
  });

  it('renders the search input', () => {
    render(<StockTracker />);

    const searchInput = screen.getByPlaceholderText('Search stocks...');
    expect(searchInput).toBeInTheDocument();
  });

  it('renders the watchlist section', () => {
    render(<StockTracker />);

    expect(screen.getByText('Watchlist')).toBeInTheDocument();
  });

  it('shows empty watchlist message when no stocks are saved', () => {
    render(<StockTracker />);

    expect(screen.getByText('No stocks in your watchlist yet.')).toBeInTheDocument();
    expect(screen.getByText('Search for stocks and add them to your watchlist.')).toBeInTheDocument();
  });

  it('renders search input with correct aria attributes', () => {
    render(<StockTracker />);

    const searchInput = screen.getByPlaceholderText('Search stocks...');
    expect(searchInput).toHaveAttribute('role', 'combobox');
    expect(searchInput).toHaveAttribute('aria-label', 'Search stocks...');
  });
});
