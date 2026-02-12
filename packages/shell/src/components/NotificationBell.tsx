import React, { useState, useEffect, useCallback, useRef } from 'react';
import { requestNotificationPermission, onForegroundMessage } from '../lib/messaging';
import { firebaseEnabled } from '../lib/firebase';

export default function NotificationBell() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [toast, setToast] = useState<{ title?: string; body?: string } | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Don't render if Firebase or Notification API isn't available
  if (!firebaseEnabled || typeof Notification === 'undefined') return null;

  const showFeedback = (message: string) => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setFeedback(message);
    feedbackTimer.current = setTimeout(() => setFeedback(null), 4000);
  };

  const handleClick = useCallback(async () => {
    if (enabled) {
      showFeedback('Notifications already enabled');
      return;
    }
    if (loading) return;

    // Check if browser has blocked notifications
    if (Notification.permission === 'denied') {
      showFeedback('Notifications blocked by browser');
      return;
    }

    setLoading(true);
    try {
      const token = await requestNotificationPermission();
      if (token) {
        setEnabled(true);
        showFeedback('Notifications enabled');
      } else {
        // Token is null — either VAPID key missing or permission denied after prompt
        if (Notification.permission === 'denied') {
          showFeedback('Notifications blocked by browser');
        } else {
          showFeedback('Push notifications not configured');
        }
      }
    } catch {
      showFeedback('Failed to enable notifications');
    } finally {
      setLoading(false);
    }
  }, [enabled, loading]);

  // Listen for foreground messages when enabled
  useEffect(() => {
    if (!enabled) return;
    return onForegroundMessage((payload) => {
      setToast(payload);
      setTimeout(() => setToast(null), 5000);
    });
  }, [enabled]);

  return (
    <>
      <div className="relative">
        <button
          onClick={handleClick}
          className={`relative p-2 rounded-lg transition-colors ${
            enabled
              ? 'text-blue-500 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          aria-label={enabled ? 'Notifications enabled' : 'Enable notifications'}
          title={enabled ? 'Notifications enabled' : 'Enable notifications'}
        >
          {loading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          )}
          {enabled && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </button>

        {/* Inline feedback tooltip */}
        {feedback && (
          <div
            role="status"
            className="absolute top-full right-0 mt-1 whitespace-nowrap bg-gray-800 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 shadow-lg z-50"
          >
            {feedback}
          </div>
        )}
      </div>

      {/* Foreground toast notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-[100] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm animate-slide-in">
          {toast.title && <p className="font-semibold dark:text-white">{toast.title}</p>}
          {toast.body && <p className="text-sm text-gray-600 dark:text-gray-300">{toast.body}</p>}
        </div>
      )}
    </>
  );
}
