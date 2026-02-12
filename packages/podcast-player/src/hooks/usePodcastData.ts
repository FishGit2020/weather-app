import { useState, useEffect, useRef, useCallback } from 'react';

export interface Podcast {
  id: number;
  title: string;
  author: string;
  artwork: string;
  description: string;
  feedUrl: string;
  episodeCount: number;
  categories: Record<string, string>;
}

export interface Episode {
  id: number;
  title: string;
  description: string;
  datePublished: number;
  duration: number;
  enclosureUrl: string;
  enclosureType: string;
  image: string;
  feedId: number;
}

export interface PodcastSearchResult {
  feeds: Podcast[];
  count: number;
}

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

export function usePodcastSearch(query: string) {
  const [state, setState] = useState<FetchState<PodcastSearchResult>>({
    data: null,
    loading: false,
    error: null,
  });
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.length < 2) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch(
          `/podcast/search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data: PodcastSearchResult = await response.json();
        if (!controller.signal.aborted) {
          setState({ data, loading: false, error: null });
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        if (!controller.signal.aborted) {
          setState({
            data: null,
            loading: false,
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query]);

  return state;
}

export function useTrendingPodcasts() {
  const [state, setState] = useState<FetchState<Podcast[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchTrending = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await fetchJson<{ feeds: Podcast[] }>('/podcast/trending');
      setState({ data: data.feeds, loading: false, error: null });
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }, []);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  return { ...state, refetch: fetchTrending };
}

export function usePodcastEpisodes(feedId: number | null) {
  const [state, setState] = useState<FetchState<Episode[]>>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (feedId === null) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    let cancelled = false;
    setState({ data: null, loading: true, error: null });

    (async () => {
      try {
        const data = await fetchJson<{ items: Episode[] }>(
          `/podcast/episodes?feedId=${feedId}`
        );
        if (!cancelled) {
          setState({ data: data.items, loading: false, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [feedId]);

  return state;
}
