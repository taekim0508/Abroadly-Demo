/* eslint-disable testing-library/no-node-access */
/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Programs from '../../../pages/Programs';
import { programsApi } from '../../../services/api';

// Mock the API
jest.mock('../../../services/api', () => ({
  programsApi: {
    list: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    listReviews: jest.fn(),
    createReview: jest.fn(),
    listCourseReviews: jest.fn(),
    createCourseReview: jest.fn(),
    listHousingReviews: jest.fn(),
    createHousingReview: jest.fn(),
  },
  bookmarksApi: {
    getAllBookmarks: jest.fn().mockResolvedValue({ programs: [], places: [], trips: [] }),
    bookmarkProgram: jest.fn(),
    unbookmarkProgram: jest.fn(),
  },
}));

// Mock the AuthContext
jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn().mockReturnValue({
    user: { id: 1, email: 'test@vanderbilt.edu' },
    login: jest.fn(),
    logout: jest.fn(),
    refreshUser: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockedProgramsApi = programsApi as jest.Mocked<typeof programsApi>;

const mockPrograms = [
  {
    id: 1,
    program_name: 'Study in Paris',
    institution: 'Paris University',
    city: 'Paris',
    country: 'France',
    cost: 15000,
    duration: 'Semester',
    description: 'Amazing program in Paris',
    created_at: '2024-01-01',
  },
  {
    id: 2,
    program_name: 'Barcelona Experience',
    institution: 'Barcelona University',
    city: 'Barcelona',
    country: 'Spain',
    cost: 12000,
    duration: 'Semester',
    description: 'Great program in Barcelona',
    created_at: '2024-01-02',
  },
  {
    id: 3,
    program_name: 'Madrid Adventure',
    institution: 'Madrid University',
    city: 'Madrid',
    country: 'Spain',
    cost: 13000,
    duration: 'Semester',
    description: 'Wonderful program in Madrid',
    created_at: '2024-01-03',
  },
];

const renderPrograms = () => {
  return render(
    <BrowserRouter>
      <Programs />
    </BrowserRouter>
  );
};

describe('Programs Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('renders the page title', async () => {
      mockedProgramsApi.list.mockResolvedValue(mockPrograms);
      renderPrograms();
      expect(screen.getByText('Study Abroad Programs')).toBeInTheDocument();
    });

    it('renders the subtitle', async () => {
      mockedProgramsApi.list.mockResolvedValue(mockPrograms);
      renderPrograms();
      expect(screen.getByText(/Discover programs worldwide with authentic student reviews/i)).toBeInTheDocument();
    });

    it('shows loading state initially', () => {
      mockedProgramsApi.list.mockImplementation(() => new Promise(() => {}));
      renderPrograms();
      // Loading spinner is present
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Filter Controls', () => {
    it('renders country filter', async () => {
      mockedProgramsApi.list.mockResolvedValue(mockPrograms);
      renderPrograms();
      await waitFor(() => {
        expect(screen.getByLabelText('Country')).toBeInTheDocument();
      });
    });

    it('renders city filter', async () => {
      mockedProgramsApi.list.mockResolvedValue(mockPrograms);
      renderPrograms();
      await waitFor(() => {
        expect(screen.getByLabelText('City')).toBeInTheDocument();
      });
    });

    it('renders Clear Filters button', async () => {
      mockedProgramsApi.list.mockResolvedValue(mockPrograms);
      renderPrograms();
      await waitFor(() => {
        expect(screen.getByText('Clear Filters')).toBeInTheDocument();
      });
    });
  });

  describe('Programs Display', () => {
    it('displays programs after loading', async () => {
      mockedProgramsApi.list.mockResolvedValue(mockPrograms);
      renderPrograms();

      await waitFor(() => {
        expect(screen.getByText('Study in Paris')).toBeInTheDocument();
      });
    });

    it('displays correct number of programs', async () => {
      mockedProgramsApi.list.mockResolvedValue(mockPrograms);
      renderPrograms();

      await waitFor(() => {
        expect(screen.getByText('Found 3 programs')).toBeInTheDocument();
      });
    });

    it('displays all program cards', async () => {
      mockedProgramsApi.list.mockResolvedValue(mockPrograms);
      renderPrograms();

      await waitFor(() => {
        expect(screen.getByText('Study in Paris')).toBeInTheDocument();
        expect(screen.getByText('Barcelona Experience')).toBeInTheDocument();
        expect(screen.getByText('Madrid Adventure')).toBeInTheDocument();
      });
    });

    it('uses singular form for one program', async () => {
      mockedProgramsApi.list.mockResolvedValue([mockPrograms[0]]);
      renderPrograms();

      await waitFor(() => {
        expect(screen.getByText('Found 1 program')).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('populates country filter with unique countries', async () => {
      mockedProgramsApi.list.mockResolvedValue(mockPrograms);
      renderPrograms();

      await waitFor(() => {
        const countrySelect = screen.getByLabelText('Country');
        expect(countrySelect).toBeInTheDocument();
        // France and Spain should be available
        const options = (countrySelect as HTMLSelectElement).options;
        const optionTexts = Array.from(options).map(o => o.text);
        expect(optionTexts).toContain('France');
        expect(optionTexts).toContain('Spain');
      });
    });

    it('populates city filter with unique cities', async () => {
      mockedProgramsApi.list.mockResolvedValue(mockPrograms);
      renderPrograms();

      await waitFor(() => {
        const citySelect = screen.getByLabelText('City');
        const options = (citySelect as HTMLSelectElement).options;
        const optionTexts = Array.from(options).map(o => o.text);
        expect(optionTexts).toContain('Paris');
        expect(optionTexts).toContain('Barcelona');
        expect(optionTexts).toContain('Madrid');
      });
    });

    it('filters programs when country is selected', async () => {
      mockedProgramsApi.list.mockResolvedValue(mockPrograms);
      renderPrograms();

      await waitFor(() => {
        expect(screen.getByLabelText('Country')).toBeInTheDocument();
      });

      mockedProgramsApi.list.mockResolvedValue([mockPrograms[0]]);
      const countrySelect = screen.getByLabelText('Country');
      fireEvent.change(countrySelect, { target: { value: 'France' } });

      await waitFor(() => {
        expect(mockedProgramsApi.list).toHaveBeenCalledWith({ country: 'France' });
      });
    });

    it('filters programs when city is selected', async () => {
      mockedProgramsApi.list.mockResolvedValue(mockPrograms);
      renderPrograms();

      await waitFor(() => {
        expect(screen.getByLabelText('City')).toBeInTheDocument();
      });

      mockedProgramsApi.list.mockResolvedValue([mockPrograms[1]]);
      const citySelect = screen.getByLabelText('City');
      fireEvent.change(citySelect, { target: { value: 'Barcelona' } });

      await waitFor(() => {
        expect(mockedProgramsApi.list).toHaveBeenCalledWith({ city: 'Barcelona' });
      });
    });

    it('clears filters when Clear Filters is clicked', async () => {
      mockedProgramsApi.list.mockResolvedValue(mockPrograms);
      renderPrograms();

      await waitFor(() => {
        expect(screen.getByText('Clear Filters')).toBeInTheDocument();
      });

      // Set some filters first
      const countrySelect = screen.getByLabelText('Country');
      fireEvent.change(countrySelect, { target: { value: 'France' } });

      await waitFor(() => {
        expect((countrySelect as HTMLSelectElement).value).toBe('France');
      });

      // Clear filters
      mockedProgramsApi.list.mockResolvedValue(mockPrograms);
      const clearButton = screen.getByText('Clear Filters');
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect((countrySelect as HTMLSelectElement).value).toBe('');
      });
    });
  });

  describe('Empty State', () => {
    it('shows no programs message when list is empty', async () => {
      mockedProgramsApi.list.mockResolvedValue([]);
      renderPrograms();

      await waitFor(() => {
        expect(screen.getByText('No Programs Found')).toBeInTheDocument();
      });
    });

    it('shows helpful message in empty state', async () => {
      mockedProgramsApi.list.mockResolvedValue([]);
      renderPrograms();

      await waitFor(() => {
        expect(screen.getByText(/Try adjusting your filters or check back later/i)).toBeInTheDocument();
      });
    });

    it('shows clear filters button in empty state', async () => {
      mockedProgramsApi.list.mockResolvedValue([]);
      renderPrograms();

      await waitFor(() => {
        const clearButtons = screen.getAllByText('Clear Filters');
        expect(clearButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when API call fails', async () => {
      mockedProgramsApi.list.mockRejectedValue(new Error('API Error'));
      renderPrograms();

      await waitFor(() => {
        expect(screen.getByText('More Countries Coming Soon!')).toBeInTheDocument();
      });
    });

    it('stops loading when error occurs', async () => {
      mockedProgramsApi.list.mockRejectedValue(new Error('API Error'));
      renderPrograms();

      await waitFor(() => {
        expect(screen.queryByRole('status', { hidden: true })).not.toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('calls API on mount', async () => {
      mockedProgramsApi.list.mockResolvedValue(mockPrograms);
      renderPrograms();

      await waitFor(() => {
        expect(mockedProgramsApi.list).toHaveBeenCalled();
      });
    });

    it('passes filters to API correctly', async () => {
      mockedProgramsApi.list.mockResolvedValue(mockPrograms);
      renderPrograms();

      await waitFor(() => {
        expect(screen.getByLabelText('Country')).toBeInTheDocument();
      });

      mockedProgramsApi.list.mockResolvedValue([mockPrograms[0]]);

      const countrySelect = screen.getByLabelText('Country');
      fireEvent.change(countrySelect, { target: { value: 'France' } });

      const citySelect = screen.getByLabelText('City');
      fireEvent.change(citySelect, { target: { value: 'Paris' } });

      await waitFor(() => {
        expect(mockedProgramsApi.list).toHaveBeenCalledWith({
          country: 'France',
          city: 'Paris',
        });
      });
    });
  });

  describe.skip('Post Program Modal', () => {
    it('opens modal when Post Program button is clicked', async () => {
      mockedProgramsApi.list.mockResolvedValue([]);
      renderPrograms();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Post Program/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Post Program/i }));

      await waitFor(() => {
        expect(screen.getByText(/Post a Program/i, { selector: 'h2' })).toBeInTheDocument();
      });
    });

    it('displays all form fields in modal', async () => {
      mockedProgramsApi.list.mockResolvedValue([]);
      renderPrograms();

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /Post Program/i }));
      });

      await waitFor(() => {
        expect(screen.getByLabelText(/Program Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Institution/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/City \*/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Country \*/i)).toBeInTheDocument();
      });
    });

    it('closes modal when cancel button is clicked', async () => {
      mockedProgramsApi.list.mockResolvedValue([]);
      renderPrograms();

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /Post Program/i }));
      });

      await waitFor(() => {
        expect(screen.getByText(/Post a Program/i, { selector: 'h2' })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

      await waitFor(() => {
        expect(screen.queryByText(/Post a Program/i, { selector: 'h2' })).not.toBeInTheDocument();
      });
    });

    it('submits program successfully', async () => {
      mockedProgramsApi.list.mockResolvedValue([]);
      mockedProgramsApi.create.mockResolvedValue({
        id: 4,
        program_name: 'Test Program',
        institution: 'Test University',
        city: 'London',
        country: 'UK',
        cost: 20000,
        duration: 'Semester',
        description: 'Test description',
        created_at: '2024-01-04',
      });

      renderPrograms();

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /Post Program/i }));
      });

      await waitFor(() => {
        expect(screen.getByLabelText(/Program Name/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/Program Name/i), {
        target: { value: 'Test Program' },
      });
      fireEvent.change(screen.getByLabelText(/Institution/i), {
        target: { value: 'Test University' },
      });
      fireEvent.change(screen.getByLabelText(/City \*/i), {
        target: { value: 'London' },
      });
      fireEvent.change(screen.getByLabelText(/Country \*/i), {
        target: { value: 'UK' },
      });

      const submitButton = screen.getByRole('button', { name: /^Post Program$/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedProgramsApi.create).toHaveBeenCalled();
      });
    });

    it('handles program creation error', async () => {
      mockedProgramsApi.list.mockResolvedValue([]);
      mockedProgramsApi.create.mockRejectedValue({
        response: { data: { detail: 'Creation failed' } },
      });

      renderPrograms();

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /Post Program/i }));
      });

      await waitFor(() => {
        expect(screen.getByLabelText(/Program Name/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/Program Name/i), {
        target: { value: 'Test' },
      });
      fireEvent.change(screen.getByLabelText(/City \*/i), {
        target: { value: 'Test' },
      });
      fireEvent.change(screen.getByLabelText(/Country \*/i), {
        target: { value: 'Test' },
      });

      const submitButton = screen.getByRole('button', { name: /^Post Program$/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Creation failed/i)).toBeInTheDocument();
      });
    });

    it('handles generic error during program creation', async () => {
      mockedProgramsApi.list.mockResolvedValue([]);
      mockedProgramsApi.create.mockRejectedValue(new Error('Network error'));

      renderPrograms();

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /Post Program/i }));
      });

      await waitFor(() => {
        expect(screen.getByLabelText(/Program Name/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/Program Name/i), {
        target: { value: 'Test' },
      });
      fireEvent.change(screen.getByLabelText(/City \*/i), {
        target: { value: 'Test' },
      });
      fireEvent.change(screen.getByLabelText(/Country \*/i), {
        target: { value: 'Test' },
      });

      const submitButton = screen.getByRole('button', { name: /^Post Program$/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to post program/i)).toBeInTheDocument();
      });
    });

    it('allows entering cost as number', async () => {
      mockedProgramsApi.list.mockResolvedValue([]);
      renderPrograms();

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /Post Program/i }));
      });

      await waitFor(() => {
        const costInput = screen.getByLabelText(/Cost/i);
        expect(costInput).toBeInTheDocument();
      });

      const costInput = screen.getByLabelText(/Cost/i);
      fireEvent.change(costInput, { target: { value: '15000' } });

      expect(costInput).toHaveValue(15000);
    });
  });
});
