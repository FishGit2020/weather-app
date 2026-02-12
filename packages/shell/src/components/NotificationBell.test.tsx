import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock firebase before importing the component
vi.mock('../lib/firebase', () => ({
  firebaseEnabled: true,
  app: {},
  auth: {},
  db: {},
  perf: null,
}));

const mockRequestPermission = vi.fn();
const mockOnForegroundMessage = vi.fn(() => () => {});

vi.mock('../lib/messaging', () => ({
  requestNotificationPermission: () => mockRequestPermission(),
  onForegroundMessage: (...args: unknown[]) => mockOnForegroundMessage(...args),
}));

import NotificationBell from './NotificationBell';

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: notifications supported and permission is "default"
    Object.defineProperty(globalThis, 'Notification', {
      value: { permission: 'default', requestPermission: vi.fn() },
      writable: true,
      configurable: true,
    });
  });

  it('renders the bell button', () => {
    render(<NotificationBell />);
    expect(screen.getByRole('button', { name: /enable notifications/i })).toBeInTheDocument();
  });

  it('shows "Notifications enabled" feedback on successful token', async () => {
    mockRequestPermission.mockResolvedValue('mock-fcm-token');

    render(<NotificationBell />);
    fireEvent.click(screen.getByRole('button', { name: /enable notifications/i }));

    await waitFor(() => {
      expect(screen.getByText('Notifications enabled')).toBeInTheDocument();
    });
  });

  it('shows "Notifications blocked by browser" when permission is denied', async () => {
    Object.defineProperty(globalThis, 'Notification', {
      value: { permission: 'denied', requestPermission: vi.fn() },
      writable: true,
      configurable: true,
    });

    render(<NotificationBell />);
    fireEvent.click(screen.getByRole('button', { name: /enable notifications/i }));

    await waitFor(() => {
      expect(screen.getByText('Notifications blocked by browser')).toBeInTheDocument();
    });
  });

  it('shows "Push notifications not configured" when token is null and permission not denied', async () => {
    mockRequestPermission.mockResolvedValue(null);

    render(<NotificationBell />);
    fireEvent.click(screen.getByRole('button', { name: /enable notifications/i }));

    await waitFor(() => {
      expect(screen.getByText('Push notifications not configured')).toBeInTheDocument();
    });
  });
});
