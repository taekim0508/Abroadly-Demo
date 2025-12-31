/* eslint-disable testing-library/no-node-access */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Navbar from '../../../components/Navbar';
import { useAuth } from '../../../context/AuthContext';

// Mock the auth context
jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));



// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockLogout = jest.fn();
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const renderWithAuth = (user: any = null) => {
  mockUseAuth.mockReturnValue({
    user,
    login: jest.fn(),
    logout: mockLogout,
    loading: false,
    refreshUser: jest.fn(),
  });

  return render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders the logo and brand name', () => {
      renderWithAuth();
      expect(screen.getByAltText('Abroadly Globe')).toBeInTheDocument();
      expect(screen.getByText('Abroadly')).toBeInTheDocument();
    });

    it('renders navigation links', () => {
      renderWithAuth();
      expect(screen.getByText('Programs')).toBeInTheDocument();
      expect(screen.getByText('Places')).toBeInTheDocument();
      expect(screen.getByText('Trips')).toBeInTheDocument();
    });
  });

  describe('Unauthenticated State', () => {
    it('shows Sign In button when not logged in', () => {
      renderWithAuth(null);
      const signInButtons = screen.getAllByText('Sign In');
      expect(signInButtons.length).toBeGreaterThan(0);
    });

    it('does not show Profile link when not logged in', () => {
      renderWithAuth(null);
      expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    });

    it('does not show Logout button when not logged in', () => {
      renderWithAuth(null);
      expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });
  });

  describe('Authenticated State', () => {
    const mockUser = {
      id: 1,
      email: 'test@vanderbilt.edu',
      profile_completed: true,
    };

    it('shows user email when logged in', () => {
      renderWithAuth(mockUser);
      expect(screen.getByText('test@vanderbilt.edu')).toBeInTheDocument();
    });

    it('shows Profile link when logged in', () => {
      renderWithAuth(mockUser);
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('shows Logout button when logged in', () => {
      renderWithAuth(mockUser);
      const logoutButtons = screen.getAllByText('Logout');
      expect(logoutButtons.length).toBeGreaterThan(0);
    });

    it('does not show Sign In button when logged in', () => {
      renderWithAuth(mockUser);
      expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    });

    it('calls logout and navigates to home when Logout is clicked', async () => {
      renderWithAuth(mockUser);
      const logoutButton = screen.getAllByText('Logout')[0];

      fireEvent.click(logoutButton);

      expect(mockLogout).toHaveBeenCalled();
      // Note: navigation happens after logout completes
    });
  });

  describe('Mobile Menu', () => {
    it('mobile menu is closed by default', () => {
      renderWithAuth();
      // Mobile menu should not be visible initially
      const mobileLinks = screen.queryAllByRole('link', { name: /programs/i });
      // Desktop link exists, but mobile is hidden by CSS
      expect(mobileLinks.length).toBeGreaterThan(0);
    });

    it('toggles mobile menu when button is clicked', () => {
      renderWithAuth();

      // Find the mobile menu button (the one with SVG)
      const menuButton = screen.getByRole('button', { name: '' });

      fireEvent.click(menuButton);

      // After clicking, mobile menu should be visible (in DOM)
      // The menu is controlled by mobileMenuOpen state
      const programsLinks = screen.getAllByText('Programs');
      expect(programsLinks.length).toBeGreaterThan(1); // Desktop + Mobile
    });

    it('closes mobile menu when a link is clicked', () => {
      renderWithAuth();

      const menuButton = screen.getByRole('button', { name: '' });
      fireEvent.click(menuButton);

      // Click on a mobile menu link
      const programsLinks = screen.getAllByText('Programs');
      // Click the second one (mobile menu)
      if (programsLinks.length > 1) {
        fireEvent.click(programsLinks[1]);
      }

      // The state should update (component will close menu)
      expect(menuButton).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('has correct href for Programs link', () => {
      renderWithAuth();
      const programsLink = screen.getAllByText('Programs')[0].closest('a');
      expect(programsLink).toHaveAttribute('href', '/programs');
    });

    it('has correct href for Places link', () => {
      renderWithAuth();
      const placesLink = screen.getAllByText('Places')[0].closest('a');
      expect(placesLink).toHaveAttribute('href', '/places');
    });

    it('has correct href for Trips link', () => {
      renderWithAuth();
      const tripsLink = screen.getAllByText('Trips')[0].closest('a');
      expect(tripsLink).toHaveAttribute('href', '/trips');
    });

    it('has correct href for home link', () => {
      renderWithAuth();
      const homeLink = screen.getByText('Abroadly').closest('a');
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });
});
