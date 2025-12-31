// Contributors:
// Gordon Song - Setup (0 hr)

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App';

// Mock the API module to avoid import.meta issues
jest.mock('../../services/api');

// Mock PlacesMap component to avoid import.meta issues
jest.mock('../../components/PlacesMap', () => ({
  __esModule: true,
  default: () => <div data-testid="places-map">Map Component</div>,
}));

// Mock the AuthContext to avoid authentication dependencies
jest.mock('../../context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    refreshUser: jest.fn(),
  }),
}));

describe('App', () => {
  test('renders main navigation', () => {
    render(<App />);
    
    // Check for main navigation elements (using getAllByText since they may appear multiple times)
    const programsLinks = screen.getAllByText(/Programs/i);
    expect(programsLinks.length).toBeGreaterThan(0);
    
    const placesLinks = screen.getAllByText(/Places/i);
    expect(placesLinks.length).toBeGreaterThan(0);
    
    const tripsLinks = screen.getAllByText(/Trips/i);
    expect(tripsLinks.length).toBeGreaterThan(0);
  });
});
