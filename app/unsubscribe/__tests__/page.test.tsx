/**
 * Component Tests for Unsubscribe Page
 * Based on DEPENDENCY-MAP.md - Email & Notification Dependencies
 * CAN-SPAM Compliance Testing
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';
import UnsubscribePage from '../page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('Unsubscribe Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(() => 'valid-token'),
    });

    (global.fetch as jest.Mock).mockImplementation(() =>
      new Promise(() => {}) // Never resolves
    );

    render(<UnsubscribePage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show error for missing token', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(() => null),
    });

    render(<UnsubscribePage />);

    await waitFor(() => {
      expect(screen.getByText('Invalid or missing token')).toBeInTheDocument();
    });
  });

  it('should load and display preferences', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(() => 'valid-token'),
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        business_name: 'Test Business',
        preferences: {
          daily_posts: true,
          monthly_report: true,
          product_updates: false,
        },
      }),
    });

    render(<UnsubscribePage />);

    await waitFor(() => {
      expect(screen.getByText('Test Business')).toBeInTheDocument();
    });

    // Check that checkboxes are in correct state
    const dailyPostsCheckbox = screen.getByRole('checkbox', {
      name: /daily social posts/i,
    });
    const monthlyReportCheckbox = screen.getByRole('checkbox', {
      name: /monthly performance reports/i,
    });
    const productUpdatesCheckbox = screen.getByRole('checkbox', {
      name: /product updates/i,
    });

    expect(dailyPostsCheckbox).toBeChecked();
    expect(monthlyReportCheckbox).toBeChecked();
    expect(productUpdatesCheckbox).not.toBeChecked();
  });

  it('should allow toggling preferences', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(() => 'valid-token'),
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        business_name: 'Test Business',
        preferences: {
          daily_posts: true,
          monthly_report: true,
          product_updates: true,
        },
      }),
    });

    render(<UnsubscribePage />);

    await waitFor(() => {
      expect(screen.getByText('Test Business')).toBeInTheDocument();
    });

    const dailyPostsCheckbox = screen.getByRole('checkbox', {
      name: /daily social posts/i,
    });

    // Toggle checkbox
    fireEvent.click(dailyPostsCheckbox);

    expect(dailyPostsCheckbox).not.toBeChecked();
  });

  it('should save preferences when form is submitted', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(() => 'valid-token'),
    });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          business_name: 'Test Business',
          preferences: {
            daily_posts: true,
            monthly_report: true,
            product_updates: true,
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Preferences updated successfully',
        }),
      });

    render(<UnsubscribePage />);

    await waitFor(() => {
      expect(screen.getByText('Test Business')).toBeInTheDocument();
    });

    const dailyPostsCheckbox = screen.getByRole('checkbox', {
      name: /daily social posts/i,
    });
    fireEvent.click(dailyPostsCheckbox);

    const saveButton = screen.getByRole('button', { name: /save preferences/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/email/preferences',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('valid-token'),
        })
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText('Preferences updated successfully')
      ).toBeInTheDocument();
    });
  });

  it('should show error message on save failure', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(() => 'valid-token'),
    });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          business_name: 'Test Business',
          preferences: {
            daily_posts: true,
            monthly_report: true,
            product_updates: true,
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Failed to update preferences',
        }),
      });

    render(<UnsubscribePage />);

    await waitFor(() => {
      expect(screen.getByText('Test Business')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save preferences/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByText('Failed to update preferences')
      ).toBeInTheDocument();
    });
  });

  it('should disable save button while saving', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(() => 'valid-token'),
    });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          business_name: 'Test Business',
          preferences: {
            daily_posts: true,
            monthly_report: true,
            product_updates: true,
          },
        }),
      })
      .mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 1000)
          )
      );

    render(<UnsubscribePage />);

    await waitFor(() => {
      expect(screen.getByText('Test Business')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save preferences/i });
    fireEvent.click(saveButton);

    // Button should be disabled while saving
    expect(saveButton).toBeDisabled();
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('should have link to dashboard settings', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(() => 'valid-token'),
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        business_name: 'Test Business',
        preferences: {
          daily_posts: true,
          monthly_report: true,
          product_updates: true,
        },
      }),
    });

    render(<UnsubscribePage />);

    await waitFor(() => {
      expect(screen.getByText('Test Business')).toBeInTheDocument();
    });

    const dashboardLink = screen.getByRole('link', {
      name: /dashboard settings/i,
    });
    expect(dashboardLink).toHaveAttribute('href', '/dashboard/settings');
  });

  it('should handle network errors gracefully', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(() => 'valid-token'),
    });

    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    render(<UnsubscribePage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load preferences')).toBeInTheDocument();
    });
  });
});
