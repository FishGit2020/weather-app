import { useState, useEffect, useRef, useCallback } from 'react';

// --- Types ---

export interface StockSearchResult {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

export interface StockQuote {
  c: number;  // Current price
  d: number;  // Change
  dp: number; // Percent change
  h: number;  // High price of the day
  l: number;  // Low price of the day
  o: number;  // Open price of the day
  pc: number; // Previous close price
  t: number;  // Timestamp
}

export interface StockCandle {
  c: number[]; // Close prices
  h: number[]; // High prices
  l: number[]; // Low prices
  o: number[]; // Open prices
  t: number[]; // Timestamps
  v: number[]; // Volume
  s: string;   // Status ("ok" or "no_data")
}

// --- Hook: useStockSearch ---

interface UseStockSearchReturn {
  results: StockSearchResult[];
  loading: boolean;
  error: string | null;
}

export function useStockSearch(query: string): UseStockSearchReturn {
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.length < 1) {
      setResults([]);
      setError(null);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      // Cancel any in-flight request
      if (abortController.current) {
        abortController.current.abort();
      }
      abortController.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/stock/search?q=${encodeURIComponent(query)}`,
          { signal: abortController.current.signal }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const items: StockSearchResult[] = data.result ?? data ?? [];
        setResults(items);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to search stocks');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  return { results, loading, error };
}

// --- Hook: useStockQuote ---

interface UseStockQuoteReturn {
  quote: StockQuote | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStockQuote(symbol: string | null): UseStockQuoteReturn {
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = useCallback(async () => {
    if (!symbol) {
      setQuote(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/stock/quote?symbol=${encodeURIComponent(symbol)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: StockQuote = await response.json();
      setQuote(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quote');
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  return { quote, loading, error, refetch: fetchQuote };
}

// --- Hook: useStockCandles ---

interface UseStockCandlesReturn {
  candles: StockCandle | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStockCandles(symbol: string | null): UseStockCandlesReturn {
  const [candles, setCandles] = useState<StockCandle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCandles = useCallback(async () => {
    if (!symbol) {
      setCandles(null);
      return;
    }

    setLoading(true);
    setError(null);

    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60;

    try {
      const response = await fetch(
        `/stock/candles?symbol=${encodeURIComponent(symbol)}&resolution=D&from=${thirtyDaysAgo}&to=${now}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: StockCandle = await response.json();
      setCandles(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch candle data');
      setCandles(null);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchCandles();
  }, [fetchCandles]);

  return { candles, loading, error, refetch: fetchCandles };
}
