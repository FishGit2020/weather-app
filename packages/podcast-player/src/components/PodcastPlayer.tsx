import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from '@weather/shared';
import { usePodcastEpisodes } from '../hooks/usePodcastData';
import type { Podcast, Episode } from '../hooks/usePodcastData';
import PodcastSearch from './PodcastSearch';
import TrendingPodcasts from './TrendingPodcasts';
import EpisodeList from './EpisodeList';
import AudioPlayer from './AudioPlayer';
import './PodcastPlayer.css';

const SUBSCRIPTIONS_KEY = 'podcast-subscriptions';

function loadSubscriptions(): Set<number> {
  try {
    const stored = localStorage.getItem(SUBSCRIPTIONS_KEY);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch { /* ignore */ }
  return new Set();
}

function saveSubscriptions(ids: Set<number>) {
  try {
    localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify([...ids]));
  } catch { /* ignore */ }
}

export default function PodcastPlayer() {
  const { t } = useTranslation();
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [subscribedIds, setSubscribedIds] = useState<Set<number>>(loadSubscriptions);

  const feedId = selectedPodcast?.id ?? null;
  const {
    data: episodes,
    loading: episodesLoading,
    error: episodesError,
  } = usePodcastEpisodes(feedId);

  const handleSelectPodcast = useCallback((podcast: Podcast) => {
    setSelectedPodcast(podcast);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedPodcast(null);
  }, []);

  const handlePlayEpisode = useCallback((episode: Episode) => {
    if (currentEpisode?.id === episode.id) {
      setIsPlaying(prev => !prev);
    } else {
      setCurrentEpisode(episode);
      setIsPlaying(true);
    }
  }, [currentEpisode?.id]);

  const handleClosePlayer = useCallback(() => {
    setCurrentEpisode(null);
    setIsPlaying(false);
  }, []);

  const handleToggleSubscribe = useCallback((podcast: Podcast) => {
    setSubscribedIds(prev => {
      const next = new Set(prev);
      if (next.has(podcast.id)) {
        next.delete(podcast.id);
      } else {
        next.add(podcast.id);
      }
      saveSubscriptions(next);
      return next;
    });
  }, []);

  const hasAudioPlayer = currentEpisode !== null;

  const podcastForPlayer = useMemo(() => {
    return selectedPodcast;
  }, [selectedPodcast]);

  return (
    <div className={`max-w-6xl mx-auto px-4 py-6 ${hasAudioPlayer ? 'pb-28' : ''}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {t('podcasts.title')}
        </h1>
        <PodcastSearch onSelectPodcast={handleSelectPodcast} />
      </div>

      {/* Content area */}
      {selectedPodcast ? (
        <div className="podcast-player-fade-in">
          {/* Selected podcast header */}
          <div className="mb-6">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition mb-4"
              aria-label={t('podcasts.trending')}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {t('podcasts.trending')}
            </button>

            <div className="flex items-start gap-4">
              {selectedPodcast.artwork ? (
                <img
                  src={selectedPodcast.artwork}
                  alt={selectedPodcast.title}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover shadow-md flex-shrink-0"
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-12 h-12 text-gray-400 dark:text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedPodcast.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedPodcast.author}
                </p>
                {selectedPodcast.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-3">
                    {selectedPodcast.description}
                  </p>
                )}
                <div className="mt-3">
                  <button
                    onClick={() => handleToggleSubscribe(selectedPodcast)}
                    className={`text-sm font-medium px-4 py-2 rounded-full transition ${
                      subscribedIds.has(selectedPodcast.id)
                        ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50'
                        : 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-500'
                    }`}
                    aria-label={
                      subscribedIds.has(selectedPodcast.id)
                        ? `${t('podcasts.unsubscribe')} ${selectedPodcast.title}`
                        : `${t('podcasts.subscribe')} ${selectedPodcast.title}`
                    }
                  >
                    {subscribedIds.has(selectedPodcast.id)
                      ? t('podcasts.unsubscribe')
                      : t('podcasts.subscribe')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Episodes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {t('podcasts.episodes')}
            </h3>
            <EpisodeList
              episodes={episodes ?? []}
              loading={episodesLoading}
              error={episodesError}
              currentEpisodeId={currentEpisode?.id ?? null}
              isPlaying={isPlaying}
              onPlayEpisode={handlePlayEpisode}
            />
          </div>
        </div>
      ) : (
        <TrendingPodcasts
          onSelectPodcast={handleSelectPodcast}
          subscribedIds={subscribedIds}
          onToggleSubscribe={handleToggleSubscribe}
        />
      )}

      {/* Audio Player - fixed at bottom */}
      <AudioPlayer
        episode={currentEpisode}
        podcast={podcastForPlayer}
        onClose={handleClosePlayer}
      />
    </div>
  );
}
