import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { app } from './firebase';

let messaging: Messaging | null = null;

function getMessagingInstance(): Messaging | null {
  if (!app) return null;
  if (!messaging) {
    messaging = getMessaging(app);
  }
  return messaging;
}

/**
 * Register the FCM service worker and request a push token.
 * Only called when the user explicitly enables notifications.
 */
export async function requestNotificationPermission(): Promise<string | null> {
  const msg = getMessagingInstance();
  if (!msg) return null;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  // Register the FCM service worker
  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.warn('VITE_FIREBASE_VAPID_KEY not set — push notifications disabled');
    return null;
  }

  try {
    const token = await getToken(msg, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });
    return token;
  } catch (err) {
    console.error('Failed to get FCM token:', err);
    return null;
  }
}

/**
 * Listen for foreground messages (app is open and visible).
 * Returns an unsubscribe function.
 */
export function onForegroundMessage(callback: (payload: { title?: string; body?: string }) => void): () => void {
  const msg = getMessagingInstance();
  if (!msg) return () => {};

  return onMessage(msg, (payload) => {
    callback({
      title: payload.notification?.title,
      body: payload.notification?.body,
    });
  });
}
