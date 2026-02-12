import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '@weather/shared';
import { StockQuote } from '../hooks/useStockData';
import StockCard from './StockCard';

interface WatchlistItem {
  symbol: string;
  companyName: string;
}

interface Props {
  watchlist: WatchlistItem[];
  onToggleWatchlist: (symbol: string) => void;
  onSelectStock: (symbol: string) => void;
}

interface QuoteCache {
  [symbol: string]: {
    quote: StockQuote | null;
    loading: boolean;
    sparklineData?: number[];
  };
}

export default function Watchlist({ watchlist, onToggleWatchlist, onSelectStock }: Props) {
  const { t } = useTranslation();
  const [quoteCache, setQuoteCache] = useState<QuoteCache>({});

  const fetchQuote = useCallback(async (symbol: string) => {
    setQuoteCache(prev => ({
      ...prev,
      [symbol]: { ...prev[symbol], loading: true, quote: prev[symbol]?.quote ?? null },
    }));

    try {
      const [quoteRes, candleRes] = await Promise.all([
        fetch(`/stock/quote?symbol=${encodeURIComponent(symbol)}`),
        fetch(`/stock/candles?symbol=${encodeURIComponent(symbol)}&resolution=D&from=${Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60}&to=${Math.floor(Date.now() / 1000)}`),
      ]);

      const quoteData: StockQuote = quoteRes.ok ? await quoteRes.json() : null;
      let sparklineData: number[] | undefined;

      if (candleRes.ok) {
        const candleData = await candleRes.json();
        if (candleData.s !== 'no_data' && candleData.c) {
          sparklineData = candleData.c;
        }
      }

      setQuoteCache(prev => ({
        ...prev,
        [symbol]: { quote: quoteData, loading: false, sparklineData },
      }));
    } catch {
      setQuoteCache(prev => ({
        ...prev,
        [symbol]: { ...prev[symbol], loading: false },
      }));
    }
  }, []);

  // Fetch quotes for all watchlist items
  useEffect(() => {
    watchlist.forEach(item => {
      fetchQuote(item.symbol);
    });
  }, [watchlist, fetchQuote]);

  if (watchlist.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-1">
          {t('stocks.noWatchlist')}
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-sm">
          {t('stocks.addSome')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {watchlist.map(item => {
        const cached = quoteCache[item.symbol];
        return (
          <StockCard
            key={item.symbol}
            symbol={item.symbol}
            companyName={item.companyName}
            quote={cached?.quote ?? null}
            loading={cached?.loading ?? true}
            isInWatchlist={true}
            onToggleWatchlist={onToggleWatchlist}
            onClick={onSelectStock}
            sparklineData={cached?.sparklineData}
          />
        );
      })}
    </div>
  );
}
