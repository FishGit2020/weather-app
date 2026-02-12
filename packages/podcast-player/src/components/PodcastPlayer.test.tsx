import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import PodcastPlayer from './PodcastPlayer';

// Mock the usePodcastData hooks
vi.mock('../hooks/usePodcastData', () => ({
  usePodcastSearch: vi.fn().mockReturnValue({
    data: null,
    loading: false,
    error: null,
  }),
  useTrendingPodcasts: vi.fn().mockReturnValue({
    data: [
      {
        id: 1,
        title: 'Test Podcast',
        author: 'Test Author',
        artwork: 'https://example.com/art.jpg',
        description: 'A test podcast',
        feedUrl: 'https://example.com/feed.xml',
        episodeCount: 42,
        categories: {},
      },
      {
        id: 2,
        title: 'Another Podcast',
        author: 'Another Author',
        artwork: 'https://example.com/art2.jpg',
        description: 'Another test podcast',
        feedUrl: 'https://example.com/feed2.xml',
        episodeCount: 10,
        categories: {},
      },
    ],
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
  usePodcastEpisodes: vi.fn().mockReturnValue({
    data: null,
    loading: false,
    error: null,
  }),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe('PodcastPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the podcast player title', () => {
    renderWithProviders(<PodcastPlayer />);
    expect(screen.getByText('Podcasts')).toBeInTheDocument();
  });

  it('renders the search input', () => {
    renderWithProviders(<PodcastPlayer />);
    expect(screen.getByPlaceholderText('Search podcasts...')).toBeInTheDocument();
  });

  it('renders trending section header', () => {
    renderWithProviders(<PodcastPlayer />);
    expect(screen.getByText('Trending')).toBeInTheDocument();
  });

  it('renders trending podcast cards', () => {
    renderWithProviders(<PodcastPlayer />);
    expect(screen.getByText('Test Podcast')).toBeInTheDocument();
    expect(screen.getByText('Another Podcast')).toBeInTheDocument();
  });

  it('displays podcast authors', () => {
    renderWithProviders(<PodcastPlayer />);
    expect(screen.getByText('Test Author')).toBeInTheDocument();
    expect(screen.getByText('Another Author')).toBeInTheDocument();
  });

  it('renders subscribe buttons for each podcast', () => {
    renderWithProviders(<PodcastPlayer />);
    const subscribeButtons = screen.getAllByText('Subscribe');
    expect(subscribeButtons.length).toBeGreaterThanOrEqual(2);
  });
});
