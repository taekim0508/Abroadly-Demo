import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useSearchParams } from 'react-router-dom';
import '@testing-library/jest-dom';
import Auth from '../../../pages/Auth';
import { authApi } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

// Mock the API module
jest.mock('../../../services/api');
const mockedAuthApi = authApi as jest.Mocked<typeof authApi>;

// Mock useAuth hook
jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock useSearchParams and useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: jest.fn(),
  useNavigate: jest.fn(),
}));


const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Auth Page', () => {
  const mockLogin = jest.fn();
  const mockRefreshUser = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useSearchParams as jest.Mock).mockReturnValue([new URLSearchParams(), jest.fn()]);
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      login: mockLogin,
      refreshUser: mockRefreshUser,
      logout: jest.fn(),
    });
    const navigate = require('react-router-dom').useNavigate;
    (navigate as jest.Mock).mockReturnValue(mockNavigate);
    // Default mock for getCurrentUser
    mockedAuthApi.getCurrentUser = jest.fn().mockResolvedValue({ profile_completed: true });
  });

  describe('Email Request Form', () => {
    it('renders email input field', () => {
      render(<Auth />, { wrapper: RouterWrapper });
      expect(screen.getByPlaceholderText(/example123@gmail\.com/i)).toBeInTheDocument();
    });

    it('renders submit button', () => {
      render(<Auth />, { wrapper: RouterWrapper });
      expect(screen.getByRole('button', { name: /magic link/i })).toBeInTheDocument();
    });

    it('submits email when form is filled', async () => {
      mockLogin.mockResolvedValue({ sent: 'email' });

      render(<Auth />, { wrapper: RouterWrapper });

      const emailInput = screen.getByPlaceholderText(/example123@gmail\.com/i);
      const submitButton = screen.getByRole('button', { name: /magic link/i });

      fireEvent.change(emailInput, { target: { value: 'test@vanderbilt.edu' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@vanderbilt.edu');
      });
    });

    it('shows error for invalid email format', async () => {
      render(<Auth />, { wrapper: RouterWrapper });

      const emailInput = screen.getByPlaceholderText(/example123@gmail\.com/i);
      const submitButton = screen.getByRole('button', { name: /magic link/i});

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(submitButton);

      // HTML5 validation should prevent submission
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  describe('Token Callback', () => {
    it('processes token from URL params', async () => {
      const mockToken = 'test-magic-token';
      const searchParams = new URLSearchParams({ token: mockToken });
      (useSearchParams as jest.Mock).mockReturnValue([searchParams, jest.fn()]);

      mockedAuthApi.verifyMagicToken.mockResolvedValue({ ok: true });

      render(<Auth />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(mockedAuthApi.verifyMagicToken).toHaveBeenCalledWith(mockToken);
      });
    });

    it('shows loading state while processing token', () => {
      const searchParams = new URLSearchParams({ token: 'test-token' });
      (useSearchParams as jest.Mock).mockReturnValue([searchParams, jest.fn()]);

      mockedAuthApi.verifyMagicToken.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ ok: true }), 1000))
      );

      render(<Auth />, { wrapper: RouterWrapper });

      // When loading, the button shows "Sending..."
      expect(screen.getByText(/sending/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error message when API call fails', async () => {
      const error = new Error('Failed to send email');
      mockLogin.mockRejectedValue(error);

      render(<Auth />, { wrapper: RouterWrapper });

      const emailInput = screen.getByPlaceholderText(/example123@gmail\.com/i);
      const submitButton = screen.getByRole('button', { name: /magic link/i });

      fireEvent.change(emailInput, { target: { value: 'test@vanderbilt.edu' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // The error message falls back to err.message which is "Failed to send email"
        expect(screen.getByText(/failed to send/i)).toBeInTheDocument();
      });
    });

    it('displays error for invalid token', async () => {
      const searchParams = new URLSearchParams({ token: 'invalid-token' });
      (useSearchParams as jest.Mock).mockReturnValue([searchParams, jest.fn()]);

      mockedAuthApi.verifyMagicToken.mockRejectedValue(
        new Error('Invalid or expired token')
      );

      render(<Auth />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText(/invalid.*token/i)).toBeInTheDocument();
      });
    });
  });

  describe('Success State', () => {
    it('shows success message after email sent', async () => {
      mockLogin.mockResolvedValue({ sent: 'email' });

      render(<Auth />, { wrapper: RouterWrapper });

      const emailInput = screen.getByPlaceholderText(/example123@gmail\.com/i);
      const submitButton = screen.getByRole('button', { name: /magic link/i });

      fireEvent.change(emailInput, { target: { value: 'test@vanderbilt.edu' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      });
    });

    it('shows dev mode message when magic_link is returned', async () => {
      mockLogin.mockResolvedValue({ magic_link: 'http://localhost:5173/auth?token=test123' });

      render(<Auth />, { wrapper: RouterWrapper });

      const emailInput = screen.getByPlaceholderText(/example123@gmail\.com/i);
      const submitButton = screen.getByRole('button', { name: /magic link/i });

      fireEvent.change(emailInput, { target: { value: 'test@vanderbilt.edu' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Dev mode/i)).toBeInTheDocument();
      });
    });
  });
});

