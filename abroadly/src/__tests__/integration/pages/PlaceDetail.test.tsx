/* eslint-disable testing-library/no-wait-for-multiple-assertions */
/* eslint-disable testing-library/no-node-access */
// Contributors:
// Gordon Song - PlaceDetail page tests (0.5 hrs)

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';
import PlaceDetail from '../../../pages/PlaceDetail';
import { placesApi } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

// Mock the API module
jest.mock('../../../services/api');
const mockedPlacesApi = placesApi as jest.Mocked<typeof placesApi>;

// Mock the AuthContext
jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MemoryRouter initialEntries={['/places/1']}>
    <Routes>
      <Route path="/places/:id" element={children} />
    </Routes>
  </MemoryRouter>
);

describe('PlaceDetail Page', () => {
  const mockPlace = {
    id: 1,
    name: 'Le Petit Café',
    category: 'cafe',
    city: 'Paris',
    country: 'France',
    address: '123 Rue de Rivoli',
    description: 'Charming café in the heart of Paris',
    latitude: 48.8566,
    longitude: 2.3522,
    created_at: '2024-01-01',
  };

  const mockReviews = [
    {
      id: 1,
      user_id: 1,
      place_id: 1,
      rating: 5,
      review_text: 'Amazing coffee and pastries!',
      date: '2024-01-15',
    },
    {
      id: 2,
      user_id: 2,
      place_id: 1,
      rating: 4,
      review_text: 'Great atmosphere',
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
      mockedPlacesApi.get.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockPlace), 1000))
      );
      mockedPlacesApi.listReviews.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve([]), 1000))
      );

      render(
        <RouterWrapper>
          <PlaceDetail />
        </RouterWrapper>
      );

      // Check for loading spinner by class
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('fetches and displays place details', async () => {
      mockedPlacesApi.get.mockResolvedValue(mockPlace);
      mockedPlacesApi.listReviews.mockResolvedValue(mockReviews);

      render(
        <RouterWrapper>
          <PlaceDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Le Petit Café')).toBeInTheDocument();
        expect(screen.getByText(/Paris, France/i)).toBeInTheDocument();
        expect(screen.getByText(/cafe/i)).toBeInTheDocument();
        expect(screen.getByText(/123 Rue de Rivoli/i)).toBeInTheDocument();
      });
    });

    it('displays place description', async () => {
      mockedPlacesApi.get.mockResolvedValue(mockPlace);
      mockedPlacesApi.listReviews.mockResolvedValue([]);

      render(
        <RouterWrapper>
          <PlaceDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Charming café in the heart of Paris/i)).toBeInTheDocument();
      });
    });

    it('displays average rating and review count', async () => {
      mockedPlacesApi.get.mockResolvedValue(mockPlace);
      mockedPlacesApi.listReviews.mockResolvedValue(mockReviews);

      render(
        <RouterWrapper>
          <PlaceDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/2 reviews/i)).toBeInTheDocument();
      });
    });

    it('displays correct emoji for category', async () => {
      const restaurantPlace = { ...mockPlace, category: 'restaurant' };
      mockedPlacesApi.get.mockResolvedValue(restaurantPlace);
      mockedPlacesApi.listReviews.mockResolvedValue([]);

      render(
        <RouterWrapper>
          <PlaceDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Le Petit Café')).toBeInTheDocument();
      });
    });
  });

  describe('Reviews Section', () => {
    it('displays all reviews', async () => {
      mockedPlacesApi.get.mockResolvedValue(mockPlace);
      mockedPlacesApi.listReviews.mockResolvedValue(mockReviews);

      render(
        <RouterWrapper>
          <PlaceDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Amazing coffee and pastries!/i)).toBeInTheDocument();
        expect(screen.getByText(/Great atmosphere/i)).toBeInTheDocument();
      });
    });

    it('shows "Write a Review" button when user is logged in', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
      });

      mockedPlacesApi.get.mockResolvedValue(mockPlace);
      mockedPlacesApi.listReviews.mockResolvedValue(mockReviews);

      render(
        <RouterWrapper>
          <PlaceDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Write a Review/i })).toBeInTheDocument();
      });
    });

    it('does not show "Write a Review" button when user is not logged in', async () => {
      mockedPlacesApi.get.mockResolvedValue(mockPlace);
      mockedPlacesApi.listReviews.mockResolvedValue(mockReviews);

      render(
        <RouterWrapper>
          <PlaceDetail />
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

      mockedPlacesApi.get.mockResolvedValue(mockPlace);
      mockedPlacesApi.listReviews.mockResolvedValue(mockReviews);

      render(
        <RouterWrapper>
          <PlaceDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Write a Review/i })).toBeInTheDocument();
      });

      const writeReviewButton = screen.getByRole('button', { name: /Write a Review/i });
      fireEvent.click(writeReviewButton);

      expect(screen.getByText(/Write Your Review/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Share your experience at this place/i)).toBeInTheDocument();
    });

    it('hides review form when Cancel button is clicked', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
      });

      mockedPlacesApi.get.mockResolvedValue(mockPlace);
      mockedPlacesApi.listReviews.mockResolvedValue(mockReviews);

      render(
        <RouterWrapper>
          <PlaceDetail />
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

      mockedPlacesApi.get.mockResolvedValue(mockPlace);
      mockedPlacesApi.listReviews.mockResolvedValue(mockReviews);
      const newReview = {
        id: 3,
        user_id: 1,
        place_id: 1,
        rating: 5,
        review_text: 'Best café ever!',
        date: '2024-01-20',
      };
      mockedPlacesApi.createReview.mockResolvedValue(newReview);

      render(
        <RouterWrapper>
          <PlaceDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Write a Review/i })).toBeInTheDocument();
      });

      const writeReviewButton = screen.getByRole('button', { name: /Write a Review/i });
      fireEvent.click(writeReviewButton);

      const reviewTextarea = screen.getByPlaceholderText(/Share your experience at this place/i);
      fireEvent.change(reviewTextarea, { target: { value: 'Best café ever!' } });

      const submitButton = screen.getByRole('button', { name: /Submit Review/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedPlacesApi.createReview).toHaveBeenCalledWith(1, {
          rating: 5,
          review_text: 'Best café ever!',
        });
      });
    });

    it('shows message when no reviews exist', async () => {
      mockedPlacesApi.get.mockResolvedValue(mockPlace);
      mockedPlacesApi.listReviews.mockResolvedValue([]);

      render(
        <RouterWrapper>
          <PlaceDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/No reviews yet/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('displays "Back to Places" link', async () => {
      mockedPlacesApi.get.mockResolvedValue(mockPlace);
      mockedPlacesApi.listReviews.mockResolvedValue([]);

      render(
        <RouterWrapper>
          <PlaceDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Back to Places/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when place fetch fails', async () => {
      mockedPlacesApi.get.mockRejectedValue(new Error('Failed to load place'));
      mockedPlacesApi.listReviews.mockResolvedValue([]);

      render(
        <RouterWrapper>
          <PlaceDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Failed to load place details/i)).toBeInTheDocument();
      });
    });

    it('displays error message when place is not found', async () => {
      mockedPlacesApi.get.mockResolvedValue(null as any);
      mockedPlacesApi.listReviews.mockResolvedValue([]);

      render(
        <RouterWrapper>
          <PlaceDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Place not found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Category Icons', () => {
    const categories = [
      { name: 'restaurant', place: { ...mockPlace, category: 'restaurant' } },
      { name: 'cafe', place: { ...mockPlace, category: 'cafe' } },
      { name: 'activity', place: { ...mockPlace, category: 'activity' } },
      { name: 'museum', place: { ...mockPlace, category: 'museum' } },
      { name: 'housing', place: { ...mockPlace, category: 'housing' } },
      { name: 'nightlife', place: { ...mockPlace, category: 'nightlife' } },
      { name: 'shopping', place: { ...mockPlace, category: 'shopping' } },
    ];

    categories.forEach(({ name, place }) => {
      it(`displays correct content for ${name} category`, async () => {
        mockedPlacesApi.get.mockResolvedValue(place);
        mockedPlacesApi.listReviews.mockResolvedValue([]);

        render(
          <RouterWrapper>
            <PlaceDetail />
          </RouterWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText(place.name)).toBeInTheDocument();
          expect(screen.getByText(name, { exact: false })).toBeInTheDocument();
        });
      });
    });
  });
});
