import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StockSearch from './StockSearch';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockSearchResults = {
  result: [
    {
      description: 'APPLE INC',
      displaySymbol: 'AAPL',
      symbol: 'AAPL',
      type: 'Common Stock',
    },
    {
      description: 'APPLIED MATERIALS INC',
      displaySymbol: 'AMAT',
      symbol: 'AMAT',
      type: 'Common Stock',
    },
  ],
};

describe('StockSearch', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockSearchResults,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders search input with placeholder', () => {
    render(<StockSearch onSelect={mockOnSelect} />);

    const input = screen.getByPlaceholderText('Search stocks...');
    expect(input).toBeInTheDocument();
  });

  it('shows loading skeleton when typing', async () => {
    // Use a fetch mock that never resolves so loading state persists
    let resolvePromise: () => void;
    mockFetch.mockImplementation(() => new Promise<Response>((resolve) => {
      resolvePromise = () => resolve({
        ok: true,
        json: async () => mockSearchResults,
      } as Response);
    }));

    render(<StockSearch onSelect={mockOnSelect} />);

    const input = screen.getByPlaceholderText('Search stocks...');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'AAPL' } });

    await vi.advanceTimersByTimeAsync(350);

    // During loading, skeleton should appear
    await waitFor(() => {
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    // Cleanup: resolve the pending promise
    resolvePromise!();
  });

  it('displays search results after typing', async () => {
    render(<StockSearch onSelect={mockOnSelect} />);

    const input = screen.getByPlaceholderText('Search stocks...');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'AAPL' } });

    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('APPLE INC')).toBeInTheDocument();
    });
  });

  it('calls onSelect when a result is clicked', async () => {
    render(<StockSearch onSelect={mockOnSelect} />);

    const input = screen.getByPlaceholderText('Search stocks...');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'AAPL' } });

    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(screen.getByText('APPLE INC')).toBeInTheDocument();
    });

    const option = screen.getAllByRole('option')[0];
    fireEvent.click(option);

    expect(mockOnSelect).toHaveBeenCalledWith('AAPL', 'APPLE INC');
  });

  it('clears input after selection', async () => {
    render(<StockSearch onSelect={mockOnSelect} />);

    const input = screen.getByPlaceholderText('Search stocks...') as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'AAPL' } });

    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(screen.getByText('APPLE INC')).toBeInTheDocument();
    });

    const option = screen.getAllByRole('option')[0];
    fireEvent.click(option);

    expect(input.value).toBe('');
  });

  it('debounces search requests', async () => {
    render(<StockSearch onSelect={mockOnSelect} />);

    const input = screen.getByPlaceholderText('Search stocks...');
    fireEvent.focus(input);

    // Type characters rapidly
    fireEvent.change(input, { target: { value: 'A' } });
    vi.advanceTimersByTime(100);
    fireEvent.change(input, { target: { value: 'AA' } });
    vi.advanceTimersByTime(100);
    fireEvent.change(input, { target: { value: 'AAP' } });
    vi.advanceTimersByTime(100);

    // Should not have called fetch yet (debounce hasn't fired)
    expect(mockFetch).not.toHaveBeenCalled();

    // After debounce timer
    await vi.advanceTimersByTimeAsync(300);

    // Now should have called fetch once
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      '/stock/search?q=AAP',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<StockSearch onSelect={mockOnSelect} />);

    const input = screen.getByPlaceholderText('Search stocks...');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'A' } });

    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument();
    });

    // Arrow down to first item
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    const firstOption = screen.getAllByRole('option')[0];
    expect(firstOption).toHaveAttribute('aria-selected', 'true');

    // Enter to select
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockOnSelect).toHaveBeenCalledWith('AAPL', 'APPLE INC');
  });
});
