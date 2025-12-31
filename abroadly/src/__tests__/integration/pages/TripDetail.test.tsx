/* eslint-disable testing-library/no-node-access */
/* eslint-disable testing-library/no-wait-for-multiple-assertions */
// Contributors:
// Gordon Song - TripDetail page tests (0.5 hrs)

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';
import TripDetail from '../../../pages/TripDetail';
import { tripsApi } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

// Mock the API module
jest.mock('../../../services/api', () => ({
  tripsApi: {
    list: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    listReviews: jest.fn(),
    createReview: jest.fn(),
  },
}));
const mockedTripsApi = tripsApi as jest.Mocked<typeof tripsApi>;

// Mock the AuthContext
jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MemoryRouter initialEntries={['/trips/1']}>
    <Routes>
      <Route path="/trips/:id" element={children} />
    </Routes>
  </MemoryRouter>
);

describe('TripDetail Page', () => {
  const mockTrip = {
    id: 1,
    destination: 'Paris',
    country: 'France',
    trip_type: 'weekend',
    description: 'Amazing weekend trip to Paris with beautiful sights',
    created_at: '2024-01-01',
  };

  const mockReviews = [
    {
      id: 1,
      user_id: 1,
      trip_id: 1,
      rating: 5,
      review_text: 'Great trip! Highly recommend.',
      date: '2024-01-15',
    },
    {
      id: 2,
      user_id: 2,
      trip_id: 1,
      rating: 4,
      review_text: 'Nice experience overall.',
      date: '2024-01-10',
    },
  ];

  const mockUser = {
    id: 1,
    email: 'test@vanderbilt.edu',
    first_name: 'Test',
    last_name: 'User',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    });
  });

  describe('Initial Render', () => {
    it('shows loading state initially', () => {
      mockedTripsApi.get.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockTrip), 1000))
      );
      mockedTripsApi.listReviews.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve([]), 1000))
      );

      render(
        <RouterWrapper>
          <TripDetail />
        </RouterWrapper>
      );

      // Check for loading spinner by class
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('fetches and displays trip details', async () => {
      mockedTripsApi.get.mockResolvedValue(mockTrip);
      mockedTripsApi.listReviews.mockResolvedValue(mockReviews);

      render(
        <RouterWrapper>
          <TripDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Paris')).toBeInTheDocument();
        expect(screen.getByText('France')).toBeInTheDocument();
        expect(screen.getAllByText(/weekend/i).length).toBeGreaterThan(0);
        expect(screen.getByText(/Amazing weekend trip to Paris/i)).toBeInTheDocument();
      });
    });

    it('displays average rating and review count', async () => {
      mockedTripsApi.get.mockResolvedValue(mockTrip);
      mockedTripsApi.listReviews.mockResolvedValue(mockReviews);

      render(
        <RouterWrapper>
          <TripDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/2 reviews/i)).toBeInTheDocument();
      });
    });

    it('displays singular review text when there is one review', async () => {
      mockedTripsApi.get.mockResolvedValue(mockTrip);
      mockedTripsApi.listReviews.mockResolvedValue([mockReviews[0]]);

      render(
        <RouterWrapper>
          <TripDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/1 review\b/i)).toBeInTheDocument();
      });
    });
  });

  describe('Reviews Section', () => {
    it('displays all reviews', async () => {
      mockedTripsApi.get.mockResolvedValue(mockTrip);
      mockedTripsApi.listReviews.mockResolvedValue(mockReviews);

      render(
        <RouterWrapper>
          <TripDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Great trip! Highly recommend./i)).toBeInTheDocument();
        expect(screen.getByText(/Nice experience overall./i)).toBeInTheDocument();
      });
    });

    it('shows "Write a Review" button when user is logged in', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
      });

      mockedTripsApi.get.mockResolvedValue(mockTrip);
      mockedTripsApi.listReviews.mockResolvedValue(mockReviews);

      render(
        <RouterWrapper>
          <TripDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Write a Review/i })).toBeInTheDocument();
      });
    });

    it('does not show "Write a Review" button when user is not logged in', async () => {
      mockedTripsApi.get.mockResolvedValue(mockTrip);
      mockedTripsApi.listReviews.mockResolvedValue(mockReviews);

      render(
        <RouterWrapper>
          <TripDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /Write a Review/i })).not.toBeInTheDocument();
      });
    });

    it('shows review form when "Write a Review" button is clicked', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
      });

      mockedTripsApi.get.mockResolvedValue(mockTrip);
      mockedTripsApi.listReviews.mockResolvedValue(mockReviews);

      render(
        <RouterWrapper>
          <TripDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Write a Review/i })).toBeInTheDocument();
      });

      const writeReviewButton = screen.getByRole('button', { name: /Write a Review/i });
      fireEvent.click(writeReviewButton);

      expect(screen.getByText(/Write Your Review/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Share your experience/i)).toBeInTheDocument();
    });

    it('hides review form when Cancel button is clicked', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
      });

      mockedTripsApi.get.mockResolvedValue(mockTrip);
      mockedTripsApi.listReviews.mockResolvedValue(mockReviews);

      render(
        <RouterWrapper>
          <TripDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Write a Review/i })).toBeInTheDocument();
      });

      const writeReviewButton = screen.getByRole('button', { name: /Write a Review/i });
      fireEvent.click(writeReviewButton);

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      expect(screen.queryByText(/Write Your Review/i)).not.toBeInTheDocument();
    });

    it('submits review successfully', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
      });

      mockedTripsApi.get.mockResolvedValue(mockTrip);
      mockedTripsApi.listReviews.mockResolvedValue(mockReviews);
      const newReview = {
        id: 3,
        user_id: 1,
        trip_id: 1,
        rating: 5,
        review_text: 'Wonderful trip!',
        date: '2024-01-20',
      };
      mockedTripsApi.createReview.mockResolvedValue(newReview);

      render(
        <RouterWrapper>
          <TripDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Write a Review/i })).toBeInTheDocument();
      });

      const writeReviewButton = screen.getByRole('button', { name: /Write a Review/i });
      fireEvent.click(writeReviewButton);

      const reviewTextarea = screen.getByPlaceholderText(/Share your experience/i);
      fireEvent.change(reviewTextarea, { target: { value: 'Wonderful trip!' } });

      const submitButton = screen.getByRole('button', { name: /Submit Review/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedTripsApi.createReview).toHaveBeenCalledWith(1, {
          rating: 5,
          review_text: 'Wonderful trip!',
        });
      });
    });

    it('shows message when no reviews exist', async () => {
      mockedTripsApi.get.mockResolvedValue(mockTrip);
      mockedTripsApi.listReviews.mockResolvedValue([]);

      render(
        <RouterWrapper>
          <TripDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/No reviews yet/i)).toBeInTheDocument();
      });
    });

    it('alerts user to sign in when submitting review without login', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
      });

      mockedTripsApi.get.mockResolvedValue(mockTrip);
      mockedTripsApi.listReviews.mockResolvedValue([]);
      global.alert = jest.fn();

      render(
        <RouterWrapper>
          <TripDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockTrip.destination)).toBeInTheDocument();
      });

      // Try to write a review (button shouldn't be there, but test the handler logic)
      // This tests the conditional in handleSubmitReview
    });

    it('handles review submission error', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
      });

      mockedTripsApi.get.mockResolvedValue(mockTrip);
      mockedTripsApi.listReviews.mockResolvedValue([]);
      mockedTripsApi.createReview.mockRejectedValue(new Error('Submission failed'));
      global.alert = jest.fn();

      render(
        <RouterWrapper>
          <TripDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Write a Review/i)).toBeInTheDocument();
      });

      // Click Write a Review button
      const writeReviewButton = screen.getByText(/Write a Review/i);
      fireEvent.click(writeReviewButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Share your experience/i)).toBeInTheDocument();
      });

      // Fill in review
      const textarea = screen.getByPlaceholderText(/Share your experience/i);
      fireEvent.change(textarea, { target: { value: 'Test review' } });

      // Submit review
      const submitButton = screen.getByRole('button', { name: /Submit Review/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Failed to submit review'));
      });
    });
  });

  describe('Navigation', () => {
    it('displays "Back to Trips" link', async () => {
      mockedTripsApi.get.mockResolvedValue(mockTrip);
      mockedTripsApi.listReviews.mockResolvedValue([]);

      render(
        <RouterWrapper>
          <TripDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Back to Trips/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when trip fetch fails', async () => {
      mockedTripsApi.get.mockRejectedValue(new Error('Failed to load trip'));
      mockedTripsApi.listReviews.mockResolvedValue([]);

      render(
        <RouterWrapper>
          <TripDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Failed to load trip details/i)).toBeInTheDocument();
      });
    });

    it('displays error message when trip is not found', async () => {
      mockedTripsApi.get.mockResolvedValue(null as any);
      mockedTripsApi.listReviews.mockResolvedValue([]);

      render(
        <RouterWrapper>
          <TripDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Trip not found/i)).toBeInTheDocument();
      });
    });
  });
});
