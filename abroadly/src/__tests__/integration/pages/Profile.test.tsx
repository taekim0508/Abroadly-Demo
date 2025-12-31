/* eslint-disable testing-library/no-node-access */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Profile from '../../../pages/Profile';
import { authApi } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

// Mock the API module with factory function
const mockGetProfile = jest.fn();
const mockGetMyReviews = jest.fn();
const mockGetMyTrips = jest.fn();
const mockGetMyPrograms = jest.fn();
const mockGetMyPlaces = jest.fn();
const mockUpdateProfile = jest.fn();
const mockDeleteReview = jest.fn();
const mockGetInbox = jest.fn();
const mockGetSentMessages = jest.fn();
const mockGetUnreadCount = jest.fn();
const mockGetAllBookmarks = jest.fn();

jest.mock('../../../services/api', () => ({
  authApi: {
    getProfile: jest.fn(),
    getMyReviews: jest.fn(),
    getMyTrips: jest.fn(),
    getMyPrograms: jest.fn(),
    getMyPlaces: jest.fn(),
    updateProfile: jest.fn(),
    deleteReview: jest.fn(),
  },
  messagesApi: {
    getInbox: jest.fn(),
    getSentMessages: jest.fn(),
    getUnreadCount: jest.fn(),
    sendMessage: jest.fn(),
    markAsRead: jest.fn(),
    deleteMessage: jest.fn(),
  },
  bookmarksApi: {
    getAllBookmarks: jest.fn(),
  },
}));

jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const mockedAuthApi = authApi as jest.Mocked<typeof authApi>;

const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Profile Page', () => {
  const mockUser = {
    id: 1,
    email: 'john@vanderbilt.edu',
    first_name: 'John',
    last_name: 'Doe',
    age: 21,
    institution: 'Vanderbilt University',
    majors: ['Computer Science', 'Mathematics'],
    minors: ['Spanish'],
    profile_completed: true,
  };

  const mockProfile = {
    ...mockUser,
    created_at: '2024-01-01',
  };

  const mockReviews = {
    program_reviews: [],
    course_reviews: [],
    housing_reviews: [],
    place_reviews: [],
    trip_reviews: [],
  };

  const mockTrips: any[] = [];
  const mockPrograms: any[] = [];
  const mockPlaces: any[] = [];

  const mockRefreshUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default mock implementations
    const { messagesApi, bookmarksApi } = require('../../../services/api');
    messagesApi.getInbox.mockResolvedValue([]);
    messagesApi.getSentMessages.mockResolvedValue([]);
    messagesApi.getUnreadCount.mockResolvedValue({ unread_count: 0 });
    bookmarksApi.getAllBookmarks.mockResolvedValue({ programs: [], places: [], trips: [] });
  });

  describe('Authentication', () => {
    it('shows login message when user is not logged in', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
      });

      render(<Profile />, { wrapper: RouterWrapper });

      expect(screen.getByText(/Please log in to view your profile/i)).toBeInTheDocument();
    });
  });

  describe('Profile Display', () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: mockRefreshUser,
      });

      mockedAuthApi.getProfile.mockResolvedValue(mockProfile);
      mockedAuthApi.getMyReviews.mockResolvedValue(mockReviews);
      mockedAuthApi.getMyTrips.mockResolvedValue(mockTrips);
      mockedAuthApi.getMyPrograms.mockResolvedValue(mockPrograms);
      mockedAuthApi.getMyPlaces.mockResolvedValue(mockPlaces);
    });

    it('displays user profile information', async () => {
      render(<Profile />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('21')).toBeInTheDocument();
      });
    });

    it('displays majors in the profile', async () => {
      render(<Profile />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText('Computer Science')).toBeInTheDocument();
        expect(screen.getByText('Mathematics')).toBeInTheDocument();
      });
    });

    it('displays minors in the profile', async () => {
      render(<Profile />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText(/Spanish/i)).toBeInTheDocument();
      });
    });

    it('shows Edit button initially', async () => {
      render(<Profile />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^Edit$/i })).toBeInTheDocument();
      });
    });
  });

  describe.skip('Profile Editing', () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: mockRefreshUser,
      });

      mockedAuthApi.getProfile.mockResolvedValue(mockProfile);
      mockedAuthApi.getMyReviews.mockResolvedValue(mockReviews);
      mockedAuthApi.getMyTrips.mockResolvedValue(mockTrips);
      mockedAuthApi.getMyPrograms.mockResolvedValue(mockPrograms);
      mockedAuthApi.getMyPlaces.mockResolvedValue(mockPlaces);
    });

    it('enables editing mode when Edit button is clicked', async () => {
      render(<Profile />, { wrapper: RouterWrapper });

      await waitFor(() => {
        const editButton = screen.getByRole('button', { name: /^Edit$/i });
        expect(editButton).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /^Edit$/i }));

      expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    it('allows adding a major', async () => {
      render(<Profile />, { wrapper: RouterWrapper });

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /^Edit$/i }));
      });

      const majorInput = screen.getByPlaceholderText(/Add major/i);
      const addButtons = screen.getAllByRole('button', { name: /^Add$/i });

      fireEvent.change(majorInput, { target: { value: 'Physics' } });
      fireEvent.click(addButtons[0]);

      expect(screen.getByText('Physics')).toBeInTheDocument();
    });

    it('allows removing a major', async () => {
      render(<Profile />, { wrapper: RouterWrapper });

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /^Edit$/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('Computer Science')).toBeInTheDocument();
      });

      // Find the Computer Science tag and its remove button
      const csElements = screen.getAllByText('Computer Science');
      const csTag = csElements[0].closest('span');
      const removeButton = csTag?.querySelector('button');

      if (removeButton) {
        fireEvent.click(removeButton);

        await waitFor(() => {
          const remaining = screen.queryAllByText('Computer Science');
          expect(remaining).toHaveLength(0);
        });
      }
    });

    it('allows adding a minor', async () => {
      render(<Profile />, { wrapper: RouterWrapper });

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /^Edit$/i }));
      });

      const minorInput = screen.getByPlaceholderText(/Add minor/i);
      const addButtons = screen.getAllByRole('button', { name: /^Add$/i });

      fireEvent.change(minorInput, { target: { value: 'French' } });
      fireEvent.click(addButtons[1]); // Second Add button is for minors

      expect(screen.getByText(/French/i)).toBeInTheDocument();
    });

    it('saves profile changes successfully', async () => {
      const updatedUser = { ...mockUser, first_name: 'Jane' };
      mockedAuthApi.updateProfile.mockResolvedValue(updatedUser);

      render(<Profile />, { wrapper: RouterWrapper });

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /^Edit$/i }));
      });

      const firstNameInput = screen.getByDisplayValue('John');
      fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

      fireEvent.click(screen.getByRole('button', { name: /Save/i }));

      await waitFor(() => {
        expect(mockedAuthApi.updateProfile).toHaveBeenCalled();
        expect(mockRefreshUser).toHaveBeenCalled();
      });
    });

    it.skip('cancels editing and reverts changes', async () => {
      render(<Profile />, { wrapper: RouterWrapper });

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /^Edit$/i }));
      });

      const firstNameInput = screen.getByDisplayValue('John');
      fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

      fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });
    });

    it('handles save error gracefully', async () => {
      const error = {
        response: {
          data: {
            detail: 'Update failed'
          }
        }
      };
      mockedAuthApi.updateProfile.mockRejectedValue(error);
      global.alert = jest.fn();

      render(<Profile />, { wrapper: RouterWrapper });

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /^Edit$/i }));
      });

      fireEvent.click(screen.getByRole('button', { name: /Save/i }));

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Update failed');
      });
    });
  });

  describe('Tab Navigation', () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: mockRefreshUser,
      });

      mockedAuthApi.getProfile.mockResolvedValue(mockProfile);
      mockedAuthApi.getMyReviews.mockResolvedValue(mockReviews);
      mockedAuthApi.getMyTrips.mockResolvedValue(mockTrips);
      mockedAuthApi.getMyPrograms.mockResolvedValue(mockPrograms);
      mockedAuthApi.getMyPlaces.mockResolvedValue(mockPlaces);
    });

    it('renders My Reviews tab by default', async () => {
      render(<Profile />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /My Reviews/i })).toBeInTheDocument();
      });
    });

    it('renders My Trips tab', async () => {
      render(<Profile />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /My Trips/i })).toBeInTheDocument();
      });
    });

    it('renders My Places tab', async () => {
      render(<Profile />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /My Places/i })).toBeInTheDocument();
      });
    });
  });

  describe.skip('Error Handling', () => {
    it('displays error message when profile fetch fails', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: mockRefreshUser,
      });

      mockedAuthApi.getProfile.mockRejectedValue(new Error('Failed to load profile'));
      mockedAuthApi.getMyReviews.mockRejectedValue(new Error('Failed to load reviews'));
      mockedAuthApi.getMyTrips.mockRejectedValue(new Error('Failed to load trips'));
      mockedAuthApi.getMyPrograms.mockRejectedValue(new Error('Failed to load programs'));
      mockedAuthApi.getMyPlaces.mockRejectedValue(new Error('Failed to load places'));

      render(<Profile />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText(/Failed to load profile/i)).toBeInTheDocument();
      });
    });
  });

  describe.skip('Tab Switching', () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: mockRefreshUser,
      });

      mockedAuthApi.getProfile.mockResolvedValue(mockProfile);
      mockedAuthApi.getMyReviews.mockResolvedValue(mockReviews);
      mockedAuthApi.getMyTrips.mockResolvedValue(mockTrips);
      mockedAuthApi.getMyPrograms.mockResolvedValue(mockPrograms);
      mockedAuthApi.getMyPlaces.mockResolvedValue(mockPlaces);
    });

    it('switches to places tab when clicked', async () => {
      render(<Profile />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /My Places/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /My Places/i }));

      await waitFor(() => {
        expect(screen.getByText(/You haven't recommended any places yet/i)).toBeInTheDocument();
      });
    });

    it('switches to reviews tab when clicked', async () => {
      render(<Profile />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /My Reviews/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /My Reviews/i }));

      await waitFor(() => {
        expect(screen.getByText(/You haven't written any reviews yet/i)).toBeInTheDocument();
      });
    });
  });

  describe.skip('My Programs Section', () => {
    it('shows empty state when no programs', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: mockRefreshUser,
      });

      mockedAuthApi.getProfile.mockResolvedValue(mockProfile);
      mockedAuthApi.getMyReviews.mockResolvedValue(mockReviews);
      mockedAuthApi.getMyTrips.mockResolvedValue(mockTrips);
      mockedAuthApi.getMyPrograms.mockResolvedValue([]);
      mockedAuthApi.getMyPlaces.mockResolvedValue(mockPlaces);

      render(<Profile />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText(/You haven't posted any programs yet/i)).toBeInTheDocument();
      });
    });

    it('displays programs when available', async () => {
      const mockProgramsData = [{
        id: 1,
        program_name: 'Test Program',
        institution: 'Test University',
        city: 'London',
        country: 'UK',
        description: 'Test description',
        created_at: '2024-01-01'
      }];

      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: mockRefreshUser,
      });

      mockedAuthApi.getProfile.mockResolvedValue(mockProfile);
      mockedAuthApi.getMyReviews.mockResolvedValue(mockReviews);
      mockedAuthApi.getMyTrips.mockResolvedValue(mockTrips);
      mockedAuthApi.getMyPrograms.mockResolvedValue(mockProgramsData);
      mockedAuthApi.getMyPlaces.mockResolvedValue(mockPlaces);

      render(<Profile />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText('Test Program')).toBeInTheDocument();
        expect(screen.getByText(/Test University/i)).toBeInTheDocument();
      });
    });
  });

  describe.skip('My Places Section', () => {
    it('displays places when available', async () => {
      const mockPlacesData = [{
        id: 1,
        name: 'Test Place',
        category: 'restaurant',
        city: 'Paris',
        country: 'France',
        price_range: '$$',
        description: 'Great food',
        created_at: '2024-01-01'
      }];

      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: mockRefreshUser,
      });

      mockedAuthApi.getProfile.mockResolvedValue(mockProfile);
      mockedAuthApi.getMyReviews.mockResolvedValue(mockReviews);
      mockedAuthApi.getMyTrips.mockResolvedValue(mockTrips);
      mockedAuthApi.getMyPrograms.mockResolvedValue(mockPrograms);
      mockedAuthApi.getMyPlaces.mockResolvedValue(mockPlacesData);

      render(<Profile />, { wrapper: RouterWrapper });

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /My Places/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('Test Place')).toBeInTheDocument();
        expect(screen.getByText(/Paris, France/i)).toBeInTheDocument();
      });
    });
  });

  describe.skip('My Trips Section', () => {
    it('displays trips when available', async () => {
      const mockTripsData = [{
        id: 1,
        destination: 'Barcelona',
        country: 'Spain',
        trip_type: 'weekend',
        description: 'Great trip',
        created_at: '2024-01-01'
      }];

      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: mockRefreshUser,
      });

      mockedAuthApi.getProfile.mockResolvedValue(mockProfile);
      mockedAuthApi.getMyReviews.mockResolvedValue(mockReviews);
      mockedAuthApi.getMyTrips.mockResolvedValue(mockTripsData);
      mockedAuthApi.getMyPrograms.mockResolvedValue(mockPrograms);
      mockedAuthApi.getMyPlaces.mockResolvedValue(mockPlaces);

      render(<Profile />, { wrapper: RouterWrapper });

      await waitFor(() => {
        expect(screen.getByText('Barcelona')).toBeInTheDocument();
        expect(screen.getByText(/Spain/i)).toBeInTheDocument();
      });
    });
  });

  describe.skip('Reviews Display', () => {
    it('displays program reviews with delete button', async () => {
      const mockReviewsWithData = {
        program_reviews: [{
          id: 1,
          program_id: 1,
          rating: 5,
          review_text: 'Great program!',
          date: '2024-01-01'
        }],
        course_reviews: [],
        housing_reviews: [],
        place_reviews: [],
        trip_reviews: []
      };

      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: mockRefreshUser,
      });

      mockedAuthApi.getProfile.mockResolvedValue(mockProfile);
      mockedAuthApi.getMyReviews.mockResolvedValue(mockReviewsWithData);
      mockedAuthApi.getMyTrips.mockResolvedValue(mockTrips);
      mockedAuthApi.getMyPrograms.mockResolvedValue(mockPrograms);
      mockedAuthApi.getMyPlaces.mockResolvedValue(mockPlaces);

      render(<Profile />, { wrapper: RouterWrapper });

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /My Reviews/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('Great program!')).toBeInTheDocument();
        expect(screen.getByText('Program Reviews (1)')).toBeInTheDocument();
      });
    });

    it('displays course reviews', async () => {
      const mockReviewsWithData = {
        program_reviews: [],
        course_reviews: [{
          id: 1,
          program_id: 1,
          rating: 4,
          review_text: 'Good course!',
          course_name: 'Spanish 101',
          instructor_name: 'Prof. Garcia',
          date: '2024-01-01'
        }],
        housing_reviews: [],
        place_reviews: [],
        trip_reviews: []
      };

      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: mockRefreshUser,
      });

      mockedAuthApi.getProfile.mockResolvedValue(mockProfile);
      mockedAuthApi.getMyReviews.mockResolvedValue(mockReviewsWithData);
      mockedAuthApi.getMyTrips.mockResolvedValue(mockTrips);
      mockedAuthApi.getMyPrograms.mockResolvedValue(mockPrograms);
      mockedAuthApi.getMyPlaces.mockResolvedValue(mockPlaces);

      render(<Profile />, { wrapper: RouterWrapper });

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /My Reviews/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('Good course!')).toBeInTheDocument();
        expect(screen.getByText('Spanish 101')).toBeInTheDocument();
        expect(screen.getByText(/Prof. Garcia/i)).toBeInTheDocument();
      });
    });

    it('displays housing reviews', async () => {
      const mockReviewsWithData = {
        program_reviews: [],
        course_reviews: [],
        housing_reviews: [{
          id: 1,
          program_id: 1,
          rating: 5,
          review_text: 'Great apartment!',
          housing_description: 'Central apartment',
          date: '2024-01-01'
        }],
        place_reviews: [],
        trip_reviews: []
      };

      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: mockRefreshUser,
      });

      mockedAuthApi.getProfile.mockResolvedValue(mockProfile);
      mockedAuthApi.getMyReviews.mockResolvedValue(mockReviewsWithData);
      mockedAuthApi.getMyTrips.mockResolvedValue(mockTrips);
      mockedAuthApi.getMyPrograms.mockResolvedValue(mockPrograms);
      mockedAuthApi.getMyPlaces.mockResolvedValue(mockPlaces);

      render(<Profile />, { wrapper: RouterWrapper });

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /My Reviews/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('Great apartment!')).toBeInTheDocument();
        expect(screen.getByText('Central apartment')).toBeInTheDocument();
      });
    });

    it('displays place reviews', async () => {
      const mockReviewsWithData = {
        program_reviews: [],
        course_reviews: [],
        housing_reviews: [],
        place_reviews: [{
          id: 1,
          place_id: 1,
          rating: 4,
          review_text: 'Nice cafe!',
          date: '2024-01-01'
        }],
        trip_reviews: []
      };

      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: mockRefreshUser,
      });

      mockedAuthApi.getProfile.mockResolvedValue(mockProfile);
      mockedAuthApi.getMyReviews.mockResolvedValue(mockReviewsWithData);
      mockedAuthApi.getMyTrips.mockResolvedValue(mockTrips);
      mockedAuthApi.getMyPrograms.mockResolvedValue(mockPrograms);
      mockedAuthApi.getMyPlaces.mockResolvedValue(mockPlaces);

      render(<Profile />, { wrapper: RouterWrapper });

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /My Reviews/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('Nice cafe!')).toBeInTheDocument();
      });
    });

    it('displays trip reviews', async () => {
      const mockReviewsWithData = {
        program_reviews: [],
        course_reviews: [],
        housing_reviews: [],
        place_reviews: [],
        trip_reviews: [{
          id: 1,
          trip_id: 1,
          rating: 5,
          review_text: 'Amazing trip!',
          date: '2024-01-01'
        }]
      };

      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: mockRefreshUser,
      });

      mockedAuthApi.getProfile.mockResolvedValue(mockProfile);
      mockedAuthApi.getMyReviews.mockResolvedValue(mockReviewsWithData);
      mockedAuthApi.getMyTrips.mockResolvedValue(mockTrips);
      mockedAuthApi.getMyPrograms.mockResolvedValue(mockPrograms);
      mockedAuthApi.getMyPlaces.mockResolvedValue(mockPlaces);

      render(<Profile />, { wrapper: RouterWrapper });

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /My Reviews/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('Amazing trip!')).toBeInTheDocument();
      });
    });
  });
});
