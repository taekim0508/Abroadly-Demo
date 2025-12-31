/* eslint-disable testing-library/no-node-access */
/* eslint-disable testing-library/no-wait-for-multiple-assertions */
// Contributors:
// Gordon Song - ProgramDetail page tests (0.5 hrs)

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';
import ProgramDetail from '../../../pages/ProgramDetail';
import { useAuth } from '../../../context/AuthContext';

// Mock the API module
jest.mock('../../../services/api', () => ({
  programsApi: {
    get: jest.fn(),
    listReviews: jest.fn(),
    listCourseReviews: jest.fn(),
    listHousingReviews: jest.fn(),
    createReview: jest.fn(),
    createCourseReview: jest.fn(),
    createHousingReview: jest.fn(),
  },
  bookmarksApi: {
    getAllBookmarks: jest.fn().mockResolvedValue({ programs: [], places: [], trips: [] }),
    bookmarkProgram: jest.fn(),
    unbookmarkProgram: jest.fn(),
  },
  messagesApi: {
    sendMessage: jest.fn(),
  },
}));
import { programsApi } from '../../../services/api';
const mockedProgramsApi = programsApi as jest.Mocked<typeof programsApi>;

// Mock the AuthContext
jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MemoryRouter initialEntries={['/programs/1']}>
    <Routes>
      <Route path="/programs/:id" element={children} />
    </Routes>
  </MemoryRouter>
);

describe('ProgramDetail Page', () => {
  const mockProgram = {
    id: 1,
    program_name: 'Study in Paris',
    institution: 'Sorbonne University',
    city: 'Paris',
    country: 'France',
    cost: 15000,
    duration: 'Semester',
    housing_type: 'Homestay',
    location: 'City Center',
    description: 'Immersive study abroad program in Paris',
    created_at: '2024-01-01',
  };

  const mockReviews = [
    {
      id: 1,
      user_id: 1,
      program_id: 1,
      rating: 5,
      review_text: 'Amazing program!',
      date: '2024-01-15',
    },
  ];

  const mockCourseReviews = [
    {
      id: 1,
      user_id: 1,
      program_id: 1,
      rating: 4,
      review_text: 'Great course content',
      course_name: 'French Literature',
      instructor_name: 'Dr. Smith',
      date: '2024-01-10',
    },
  ];

  const mockHousingReviews = [
    {
      id: 1,
      user_id: 1,
      program_id: 1,
      rating: 5,
      review_text: 'Wonderful homestay experience',
      housing_description: 'Homestay with local family',
      date: '2024-01-12',
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
      mockedProgramsApi.get.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockProgram), 1000))
      );
      mockedProgramsApi.listReviews.mockResolvedValue([]);
      mockedProgramsApi.listCourseReviews.mockResolvedValue([]);
      mockedProgramsApi.listHousingReviews.mockResolvedValue([]);

      render(
        <RouterWrapper>
          <ProgramDetail />
        </RouterWrapper>
      );

      // Check for loading spinner by class
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('fetches and displays program details', async () => {
      mockedProgramsApi.get.mockResolvedValue(mockProgram);
      mockedProgramsApi.listReviews.mockResolvedValue(mockReviews);
      mockedProgramsApi.listCourseReviews.mockResolvedValue([]);
      mockedProgramsApi.listHousingReviews.mockResolvedValue([]);

      render(
        <RouterWrapper>
          <ProgramDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Study in Paris')).toBeInTheDocument();
        expect(screen.getByText('Sorbonne University')).toBeInTheDocument();
        expect(screen.getByText(/Paris, France/i)).toBeInTheDocument();
        expect(screen.getByText('$15,000')).toBeInTheDocument();
      });
    });

    it('displays program details like duration and housing type', async () => {
      mockedProgramsApi.get.mockResolvedValue(mockProgram);
      mockedProgramsApi.listReviews.mockResolvedValue([]);
      mockedProgramsApi.listCourseReviews.mockResolvedValue([]);
      mockedProgramsApi.listHousingReviews.mockResolvedValue([]);

      render(
        <RouterWrapper>
          <ProgramDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Semester')).toBeInTheDocument();
        expect(screen.getByText('Homestay')).toBeInTheDocument();
        expect(screen.getByText('City Center')).toBeInTheDocument();
      });
    });
  });

  describe.skip('Tabs', () => {
    beforeEach(() => {
      mockedProgramsApi.get.mockResolvedValue(mockProgram);
      mockedProgramsApi.listReviews.mockResolvedValue(mockReviews);
      mockedProgramsApi.listCourseReviews.mockResolvedValue(mockCourseReviews);
      mockedProgramsApi.listHousingReviews.mockResolvedValue(mockHousingReviews);
    });

    it('renders all three tabs', async () => {
      render(
        <RouterWrapper>
          <ProgramDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Reviews \(1\)/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Courses \(1\)/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Housing \(1\)/i })).toBeInTheDocument();
      });
    });

    it('switches to courses tab when clicked', async () => {
      render(
        <RouterWrapper>
          <ProgramDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Courses/i })).toBeInTheDocument();
      });

      const coursesTab = screen.getByRole('button', { name: /Courses/i });
      fireEvent.click(coursesTab);

      await waitFor(() => {
        expect(screen.getByText('French Literature')).toBeInTheDocument();
        expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
      });
    });

    it('switches to housing tab when clicked', async () => {
      render(
        <RouterWrapper>
          <ProgramDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Housing/i })).toBeInTheDocument();
      });

      const housingTab = screen.getByRole('button', { name: /Housing/i });
      fireEvent.click(housingTab);

      await waitFor(() => {
        expect(screen.getByText('Homestay with local family')).toBeInTheDocument();
        expect(screen.getByText(/Wonderful homestay experience/i)).toBeInTheDocument();
      });
    });

    it('displays overview tab content by default', async () => {
      render(
        <RouterWrapper>
          <ProgramDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Amazing program!/i)).toBeInTheDocument();
      });
    });
  });

  describe.skip('Reviews Section', () => {
    it('shows "Write a Review" button when user is logged in', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
      });

      mockedProgramsApi.get.mockResolvedValue(mockProgram);
      mockedProgramsApi.listReviews.mockResolvedValue(mockReviews);
      mockedProgramsApi.listCourseReviews.mockResolvedValue([]);
      mockedProgramsApi.listHousingReviews.mockResolvedValue([]);

      render(
        <RouterWrapper>
          <ProgramDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Write a Review/i })).toBeInTheDocument();
      });
    });

    it('shows review form when "Write a Review" button is clicked', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
      });

      mockedProgramsApi.get.mockResolvedValue(mockProgram);
      mockedProgramsApi.listReviews.mockResolvedValue(mockReviews);
      mockedProgramsApi.listCourseReviews.mockResolvedValue([]);
      mockedProgramsApi.listHousingReviews.mockResolvedValue([]);

      render(
        <RouterWrapper>
          <ProgramDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Write a Review/i })).toBeInTheDocument();
      });

      const writeReviewButton = screen.getByRole('button', { name: /Write a Review/i });
      fireEvent.click(writeReviewButton);

      expect(screen.getByText(/Write Your Review/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Share your experience with this program/i)).toBeInTheDocument();
    });

    it('submits review successfully', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
      });

      mockedProgramsApi.get.mockResolvedValue(mockProgram);
      mockedProgramsApi.listReviews.mockResolvedValue(mockReviews);
      mockedProgramsApi.listCourseReviews.mockResolvedValue([]);
      mockedProgramsApi.listHousingReviews.mockResolvedValue([]);
      const newReview = {
        id: 2,
        user_id: 1,
        program_id: 1,
        rating: 5,
        review_text: 'Excellent program!',
        date: '2024-01-20',
      };
      mockedProgramsApi.createReview.mockResolvedValue(newReview);

      render(
        <RouterWrapper>
          <ProgramDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Write a Review/i })).toBeInTheDocument();
      });

      const writeReviewButton = screen.getByRole('button', { name: /Write a Review/i });
      fireEvent.click(writeReviewButton);

      const reviewTextarea = screen.getByPlaceholderText(/Share your experience with this program/i);
      fireEvent.change(reviewTextarea, { target: { value: 'Excellent program!' } });

      const submitButton = screen.getByRole('button', { name: /Submit Review/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedProgramsApi.createReview).toHaveBeenCalledWith(1, {
          rating: 5,
          review_text: 'Excellent program!',
        });
      });
    });

    it('shows message when no reviews exist', async () => {
      mockedProgramsApi.get.mockResolvedValue(mockProgram);
      mockedProgramsApi.listReviews.mockResolvedValue([]);
      mockedProgramsApi.listCourseReviews.mockResolvedValue([]);
      mockedProgramsApi.listHousingReviews.mockResolvedValue([]);

      render(
        <RouterWrapper>
          <ProgramDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/No reviews yet/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('displays "Back to Programs" link', async () => {
      mockedProgramsApi.get.mockResolvedValue(mockProgram);
      mockedProgramsApi.listReviews.mockResolvedValue([]);
      mockedProgramsApi.listCourseReviews.mockResolvedValue([]);
      mockedProgramsApi.listHousingReviews.mockResolvedValue([]);

      render(
        <RouterWrapper>
          <ProgramDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Back to Programs/i)).toBeInTheDocument();
      });
    });
  });

  describe.skip('Error Handling', () => {
    it('displays error message when program fetch fails', async () => {
      mockedProgramsApi.get.mockRejectedValue(new Error('Failed to load program'));
      mockedProgramsApi.listReviews.mockResolvedValue([]);
      mockedProgramsApi.listCourseReviews.mockResolvedValue([]);
      mockedProgramsApi.listHousingReviews.mockResolvedValue([]);

      render(
        <RouterWrapper>
          <ProgramDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Failed to load program details/i)).toBeInTheDocument();
      });
    });

    it('displays error message when program is not found', async () => {
      mockedProgramsApi.get.mockResolvedValue(null as any);
      mockedProgramsApi.listReviews.mockResolvedValue([]);
      mockedProgramsApi.listCourseReviews.mockResolvedValue([]);
      mockedProgramsApi.listHousingReviews.mockResolvedValue([]);

      render(
        <RouterWrapper>
          <ProgramDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Program not found/i)).toBeInTheDocument();
      });
    });

    it('handles review submission error', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
      });

      mockedProgramsApi.get.mockResolvedValue(mockProgram);
      mockedProgramsApi.listReviews.mockResolvedValue([]);
      mockedProgramsApi.listCourseReviews.mockResolvedValue([]);
      mockedProgramsApi.listHousingReviews.mockResolvedValue([]);
      mockedProgramsApi.createReview.mockRejectedValue({
        response: { data: { detail: 'Review submission failed' } },
      });
      global.alert = jest.fn();

      render(
        <RouterWrapper>
          <ProgramDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Write a Review/i })).toBeInTheDocument();
      });

      const writeReviewButton = screen.getByRole('button', { name: /Write a Review/i });
      fireEvent.click(writeReviewButton);

      const reviewTextarea = screen.getByPlaceholderText(/Share your experience with this program/i);
      fireEvent.change(reviewTextarea, { target: { value: 'Test review' } });

      const submitButton = screen.getByRole('button', { name: /Submit Review/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Review submission failed');
      });
    });

    it('handles course review submission error', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
      });

      mockedProgramsApi.get.mockResolvedValue(mockProgram);
      mockedProgramsApi.listReviews.mockResolvedValue([]);
      mockedProgramsApi.listCourseReviews.mockResolvedValue([]);
      mockedProgramsApi.listHousingReviews.mockResolvedValue([]);
      mockedProgramsApi.createCourseReview.mockRejectedValue({
        response: { data: { detail: 'Course review failed' } },
      });
      global.alert = jest.fn();

      render(
        <RouterWrapper>
          <ProgramDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /Courses/i }));
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Write a Course Review/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Write a Course Review/i }));

      await waitFor(() => {
        const courseNameInput = screen.getByPlaceholderText(/Course name/i);
        expect(courseNameInput).toBeInTheDocument();
      });

      fireEvent.change(screen.getByPlaceholderText(/Course name/i), {
        target: { value: 'Test Course' },
      });

      const courseReviewTextarea = screen.getAllByPlaceholderText(/Share your experience/i)[0];
      fireEvent.change(courseReviewTextarea, { target: { value: 'Test course review' } });

      const submitButtons = screen.getAllByRole('button', { name: /Submit Review/i });
      fireEvent.click(submitButtons[0]);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Course review failed');
      });
    });

    it('handles housing review submission error', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
      });

      mockedProgramsApi.get.mockResolvedValue(mockProgram);
      mockedProgramsApi.listReviews.mockResolvedValue([]);
      mockedProgramsApi.listCourseReviews.mockResolvedValue([]);
      mockedProgramsApi.listHousingReviews.mockResolvedValue([]);
      mockedProgramsApi.createHousingReview.mockRejectedValue({
        response: { data: { detail: 'Housing review failed' } },
      });
      global.alert = jest.fn();

      render(
        <RouterWrapper>
          <ProgramDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /Housing/i }));
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Write a Housing Review/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Write a Housing Review/i }));

      await waitFor(() => {
        const housingDescInput = screen.getByPlaceholderText(/Describe your housing/i);
        expect(housingDescInput).toBeInTheDocument();
      });

      fireEvent.change(screen.getByPlaceholderText(/Describe your housing/i), {
        target: { value: 'Test Housing' },
      });

      const housingReviewTextarea = screen.getAllByPlaceholderText(/Share your experience/i)[0];
      fireEvent.change(housingReviewTextarea, { target: { value: 'Test housing review' } });

      const submitButtons = screen.getAllByRole('button', { name: /Submit Review/i });
      fireEvent.click(submitButtons[0]);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Housing review failed');
      });
    });
  });

  describe.skip('Star Rating in Reviews', () => {
    it('allows clicking different star ratings', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
      });

      mockedProgramsApi.get.mockResolvedValue(mockProgram);
      mockedProgramsApi.listReviews.mockResolvedValue([]);
      mockedProgramsApi.listCourseReviews.mockResolvedValue([]);
      mockedProgramsApi.listHousingReviews.mockResolvedValue([]);

      render(
        <RouterWrapper>
          <ProgramDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Write a Review/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Write a Review/i }));

      // The star rating component should be rendered
      const stars = document.querySelectorAll('svg');
      expect(stars.length).toBeGreaterThan(0);
    });
  });

  describe.skip('Cancel Review', () => {
    it('hides review form when cancel is clicked', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
      });

      mockedProgramsApi.get.mockResolvedValue(mockProgram);
      mockedProgramsApi.listReviews.mockResolvedValue([]);
      mockedProgramsApi.listCourseReviews.mockResolvedValue([]);
      mockedProgramsApi.listHousingReviews.mockResolvedValue([]);

      render(
        <RouterWrapper>
          <ProgramDetail />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Write a Review/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Write a Review/i }));

      await waitFor(() => {
        expect(screen.getByText(/Write Your Review/i)).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText(/Write Your Review/i)).not.toBeInTheDocument();
      });
    });
  });
});
