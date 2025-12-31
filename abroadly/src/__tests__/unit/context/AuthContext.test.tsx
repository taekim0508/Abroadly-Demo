// Contributors:
// Gordon Song - AuthContext tests (0.5 hrs)

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '../../../context/AuthContext';
import { authApi } from '../../../services/api';

// Mock the API module
jest.mock('../../../services/api');
const mockedAuthApi = authApi as jest.Mocked<typeof authApi>;

// Test component that uses the auth context
const TestComponent: React.FC = () => {
  const { user, login, logout, refreshUser } = useAuth();

  const handleLogin = async () => {
    try {
      await login('test@vanderbilt.edu');
    } catch (error) {
      // Ignore errors in test
    }
  };

  return (
    <div>
      <div data-testid="user-email">{user?.email || 'No user'}</div>
      <div data-testid="user-name">{user?.first_name || 'No name'}</div>
      <button onClick={handleLogin}>Login</button>
      <button onClick={logout}>Logout</button>
      <button onClick={refreshUser}>Refresh</button>
    </div>
  );
};

describe('AuthContext', () => {
  const mockUser = {
    id: 1,
    email: 'test@vanderbilt.edu',
    first_name: 'John',
    last_name: 'Doe',
    age: 21,
    institution: 'Vanderbilt University',
    majors: ['Computer Science'],
    minors: ['Spanish'],
    profile_completed: true,
    created_at: '2024-01-01',
  };

  // Store original console.error
  const originalError = console.error;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore console.error
    console.error = originalError;
  });

  describe('Initial State', () => {
    it('provides null user initially', () => {
      mockedAuthApi.getCurrentUser.mockRejectedValue(new Error('Not authenticated'));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
    });

    it('fetches current user on mount if authenticated', async () => {
      mockedAuthApi.getCurrentUser.mockResolvedValue(mockUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@vanderbilt.edu');
        expect(screen.getByTestId('user-name')).toHaveTextContent('John');
      });
    });
  });

  describe('Login', () => {
    it('calls requestMagicLink when login is invoked', async () => {
      mockedAuthApi.getCurrentUser.mockRejectedValue(new Error('Not authenticated'));
      mockedAuthApi.requestMagicLink.mockResolvedValue({ sent: 'email' });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByText('Login');

      await act(async () => {
        loginButton.click();
      });

      await waitFor(() => {
        expect(mockedAuthApi.requestMagicLink).toHaveBeenCalledWith('test@vanderbilt.edu');
      });
    });

    it('returns response from requestMagicLink', async () => {
      mockedAuthApi.getCurrentUser.mockRejectedValue(new Error('Not authenticated'));
      mockedAuthApi.requestMagicLink.mockResolvedValue({ sent: 'email' });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByText('Login');

      await act(async () => {
        loginButton.click();
      });

      await waitFor(() => {
        expect(mockedAuthApi.requestMagicLink).toHaveBeenCalled();
      });
    });
  });

  describe('Logout', () => {
    it('calls logout API and clears user', async () => {
      mockedAuthApi.getCurrentUser.mockResolvedValue(mockUser);
      mockedAuthApi.logout.mockResolvedValue({ ok: true });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@vanderbilt.edu');
      });

      const logoutButton = screen.getByText('Logout');

      await act(async () => {
        logoutButton.click();
      });

      await waitFor(() => {
        expect(mockedAuthApi.logout).toHaveBeenCalled();
        expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
      });
    });

    it('clears user even if logout API fails', async () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mockedAuthApi.getCurrentUser.mockResolvedValue(mockUser);
      mockedAuthApi.logout.mockRejectedValue(new Error('Logout failed'));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@vanderbilt.edu');
      });

      const logoutButton = screen.getByText('Logout');

      await act(async () => {
        logoutButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Refresh User', () => {
    it('fetches current user data when refreshUser is called', async () => {
      mockedAuthApi.getCurrentUser.mockResolvedValue(mockUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@vanderbilt.edu');
      });

      // Clear the mock and set a new user
      mockedAuthApi.getCurrentUser.mockClear();
      const updatedUser = { ...mockUser, first_name: 'Jane' };
      mockedAuthApi.getCurrentUser.mockResolvedValue(updatedUser);

      const refreshButton = screen.getByText('Refresh');

      await act(async () => {
        refreshButton.click();
      });

      await waitFor(() => {
        expect(mockedAuthApi.getCurrentUser).toHaveBeenCalled();
        expect(screen.getByTestId('user-name')).toHaveTextContent('Jane');
      });
    });

    it('handles refresh error gracefully', async () => {
      mockedAuthApi.getCurrentUser.mockResolvedValue(mockUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@vanderbilt.edu');
      });

      // Make refresh fail
      mockedAuthApi.getCurrentUser.mockRejectedValue(new Error('Refresh failed'));

      const refreshButton = screen.getByText('Refresh');

      await act(async () => {
        refreshButton.click();
      });

      // User should be cleared on refresh error
      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
      });
    });
  });

  describe('Error Handling', () => {
    it('handles getCurrentUser error on mount', async () => {
      mockedAuthApi.getCurrentUser.mockRejectedValue(new Error('Not authenticated'));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
      });
    });

    it('handles login error', async () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      mockedAuthApi.getCurrentUser.mockImplementation(() =>
        Promise.reject(new Error('Not authenticated'))
      );
      mockedAuthApi.requestMagicLink.mockImplementation(() =>
        Promise.reject(new Error('Failed to send email'))
      );

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByText('Login');

      try {
        await act(async () => {
          loginButton.click();
        });
      } catch (error) {
        // Expected to throw
      }

      // Should still show no user
      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');

      consoleSpy.mockRestore();
    });
  });

  describe('Context Hook', () => {
    it('throws error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });
  });
});
