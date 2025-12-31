/* eslint-disable testing-library/no-node-access */
/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Places from '../../../pages/Places';
import { placesApi } from '../../../services/api';

// Mock the API and PlacesMap component
jest.mock('../../../services/api', () => ({
  placesApi: {
    list: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    listReviews: jest.fn(),
    createReview: jest.fn(),
  },
  bookmarksApi: {
    getAllBookmarks: jest.fn().mockResolvedValue({ programs: [], places: [], trips: [] }),
    bookmarkPlace: jest.fn(),
    unbookmarkPlace: jest.fn(),
  },
}));
jest.mock('../../../components/PlacesMap', () => ({
  __esModule: true,
  default: () => <div data-testid="places-map">Map Component</div>,
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

const mockedPlacesApi = placesApi as jest.Mocked<typeof placesApi>;

const mockPlaces = [
  {
    id: 1,
    name: 'Great Restaurant',
    category: 'restaurant',
    city: 'Paris',
    country: 'France',
    latitude: 48.8566,
    longitude: 2.3522,
    address: '123 Main St',
    description: 'Amazing food',
    created_at: '2024-01-01',
  },
  {
    id: 2,
    name: 'Nice Cafe',
    category: 'cafe',
    city: 'Barcelona',
    country: 'Spain',
    description: 'Great coffee',
    created_at: '2024-01-02',
  },
];

const renderPlaces = () => {
  return render(
    <BrowserRouter>
      <Places />
    </BrowserRouter>
  );
};

describe('Places Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page title', async () => {
    mockedPlacesApi.list.mockResolvedValue(mockPlaces);
    renderPlaces();
    expect(screen.getByText('Discover Places')).toBeInTheDocument();
  });

  it('renders subtitle', async () => {
    mockedPlacesApi.list.mockResolvedValue(mockPlaces);
    renderPlaces();
    expect(screen.getByText(/Find the best spots recommended by students/i)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockedPlacesApi.list.mockImplementation(() => new Promise(() => { }));
    renderPlaces();
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('displays places after loading', async () => {
    mockedPlacesApi.list.mockResolvedValue(mockPlaces);
    renderPlaces();
    await waitFor(() => {
      expect(screen.getByText('Great Restaurant')).toBeInTheDocument();
    });
  });

  it('renders all filter controls', async () => {
    mockedPlacesApi.list.mockResolvedValue(mockPlaces);
    renderPlaces();
    await waitFor(() => {
      expect(screen.getByLabelText('Category')).toBeInTheDocument();
      expect(screen.getByLabelText('Country')).toBeInTheDocument();
      expect(screen.getByLabelText('City')).toBeInTheDocument();
    });
  });

  it('shows correct place count', async () => {
    mockedPlacesApi.list.mockResolvedValue(mockPlaces);
    renderPlaces();
    await waitFor(() => {
      expect(screen.getByText('Found 2 places')).toBeInTheDocument();
    });
  });

  it('shows singular form for one place', async () => {
    mockedPlacesApi.list.mockResolvedValue([mockPlaces[0]]);
    renderPlaces();
    await waitFor(() => {
      expect(screen.getByText('Found 1 place')).toBeInTheDocument();
    });
  });

  it('filters places by category', async () => {
    mockedPlacesApi.list.mockResolvedValue(mockPlaces);
    renderPlaces();

    await waitFor(() => {
      expect(screen.getByLabelText('Category')).toBeInTheDocument();
    });

    mockedPlacesApi.list.mockResolvedValue([mockPlaces[0]]);
    const categorySelect = screen.getByLabelText('Category');
    fireEvent.change(categorySelect, { target: { value: 'restaurant' } });

    await waitFor(() => {
      expect(mockedPlacesApi.list).toHaveBeenCalledWith({ category: 'restaurant' });
    });
  });

  it('clears filters when Clear Filters clicked', async () => {
    mockedPlacesApi.list.mockResolvedValue(mockPlaces);
    renderPlaces();

    await waitFor(() => {
      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });

    const categorySelect = screen.getByLabelText('Category');
    fireEvent.change(categorySelect, { target: { value: 'restaurant' } });

    mockedPlacesApi.list.mockResolvedValue(mockPlaces);
    fireEvent.click(screen.getByText('Clear Filters'));

    await waitFor(() => {
      expect((categorySelect as HTMLSelectElement).value).toBe('');
    });
  });

  it('shows empty state when no places found', async () => {
    mockedPlacesApi.list.mockResolvedValue([]);
    renderPlaces();

    await waitFor(() => {
      expect(screen.getByText('No Places Found')).toBeInTheDocument();
    });
  });

  it('displays error message on API failure', async () => {
    mockedPlacesApi.list.mockRejectedValue(new Error('API Error'));
    renderPlaces();

    await waitFor(() => {
      expect(screen.getByText('More Places Coming Soon!')).toBeInTheDocument();
    });
  });

  it('calls API on mount', async () => {
    mockedPlacesApi.list.mockResolvedValue(mockPlaces);
    renderPlaces();

    await waitFor(() => {
      expect(mockedPlacesApi.list).toHaveBeenCalled();
    });
  });

  it('renders map when places are loaded', async () => {
    mockedPlacesApi.list.mockResolvedValue(mockPlaces);
    renderPlaces();

    await waitFor(() => {
      expect(screen.getByTestId('places-map')).toBeInTheDocument();
    });
  });

  it('displays View Details links', async () => {
    mockedPlacesApi.list.mockResolvedValue(mockPlaces);
    renderPlaces();

    await waitFor(() => {
      const links = screen.getAllByText('View Details');
      expect(links.length).toBe(2);
    });
  });

  describe.skip('Post a Place Modal', () => {
    it('opens modal when Post a Place button is clicked', async () => {
      mockedPlacesApi.list.mockResolvedValue(mockPlaces);
      renderPlaces();

      await waitFor(() => {
        const postButton = screen.getByText('Post a Place');
        expect(postButton).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Post a Place'));

      await waitFor(() => {
        expect(screen.getByText('Place Name *')).toBeInTheDocument();
      });
    });

    it('closes modal when cancel button is clicked', async () => {
      mockedPlacesApi.list.mockResolvedValue(mockPlaces);
      renderPlaces();

      await waitFor(() => {
        const postButton = screen.getByText('Post a Place');
        fireEvent.click(postButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Place Name *')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Cancel'));

      await waitFor(() => {
        expect(screen.queryByText('Place Name *')).not.toBeInTheDocument();
      });
    });

    it('submits place form successfully', async () => {
      mockedPlacesApi.list.mockResolvedValue(mockPlaces);
      mockedPlacesApi.create.mockResolvedValue({
        id: 3,
        name: 'New Place',
        category: 'cafe',
        city: 'Rome',
        country: 'Italy',
        created_at: '2024-01-03',
      });

      renderPlaces();

      await waitFor(() => {
        fireEvent.click(screen.getByText('Post a Place'));
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/e.g., The Cozy Cafe/i)).toBeInTheDocument();
      });

      // Fill out the form
      fireEvent.change(screen.getByPlaceholderText(/e.g., The Cozy Cafe/i), {
        target: { value: 'New Place' },
      });
      fireEvent.change(screen.getByPlaceholderText(/e.g., Paris/i), {
        target: { value: 'Rome' },
      });
      fireEvent.change(screen.getByPlaceholderText(/e.g., France/i), {
        target: { value: 'Italy' },
      });

      // Find the select with "Select category" option
      const selects = screen.getAllByRole('combobox');
      const categorySelect = selects.find(s => s.textContent?.includes('Select category'));
      if (categorySelect) {
        fireEvent.change(categorySelect, { target: { value: 'cafe' } });
      }

      // Submit the form
      mockedPlacesApi.list.mockResolvedValue([...mockPlaces, {
        id: 3,
        name: 'New Place',
        category: 'cafe',
        city: 'Rome',
        country: 'Italy',
        created_at: '2024-01-03',
      }]);

      fireEvent.click(screen.getByText('Post Place'));

      await waitFor(() => {
        expect(mockedPlacesApi.create).toHaveBeenCalled();
      });
    });

    it('fills optional fields in the form', async () => {
      mockedPlacesApi.list.mockResolvedValue(mockPlaces);
      renderPlaces();

      await waitFor(() => {
        fireEvent.click(screen.getByText('Post a Place'));
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/e.g., 123 Main Street/i)).toBeInTheDocument();
      });

      // Fill out optional fields
      fireEvent.change(screen.getByPlaceholderText(/e.g., 123 Main Street/i), {
        target: { value: '456 Side Street' },
      });
      fireEvent.change(screen.getByPlaceholderText(/e.g., 48.8566/i), {
        target: { value: '41.9028' },
      });
      fireEvent.change(screen.getByPlaceholderText(/e.g., 2.3522/i), {
        target: { value: '12.4964' },
      });
      fireEvent.change(screen.getByPlaceholderText(/Share your thoughts/i), {
        target: { value: 'Great atmosphere' },
      });

      // Verify fields were updated
      expect(screen.getByPlaceholderText(/e.g., 123 Main Street/i)).toHaveValue('456 Side Street');
      expect(screen.getByPlaceholderText(/e.g., 48.8566/i)).toHaveValue(41.9028);
      expect(screen.getByPlaceholderText(/e.g., 2.3522/i)).toHaveValue(12.4964);
    });

    it('shows error when post fails', async () => {
      mockedPlacesApi.list.mockRejectedValue({
        response: { data: { detail: 'Failed to create place' } },
      });
      mockedPlacesApi.create.mockRejectedValue({
        response: { data: { detail: 'Failed to create place' } },
      });

      renderPlaces();

      await waitFor(() => {
        expect(screen.getByText(/More Places Coming Soon!/i)).toBeInTheDocument();
      });

      // Reset for modal
      mockedPlacesApi.list.mockResolvedValue(mockPlaces);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Post a Place'));
      });

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Post a Place/i })).toBeInTheDocument();
      });

      // Fill required fields
      fireEvent.change(screen.getByPlaceholderText(/e.g., The Cozy Cafe/i), {
        target: { value: 'New Place' },
      });
      fireEvent.change(screen.getByPlaceholderText(/e.g., Paris/i), {
        target: { value: 'Rome' },
      });
      fireEvent.change(screen.getByPlaceholderText(/e.g., France/i), {
        target: { value: 'Italy' },
      });

      // Find the select with "Select category" option
      const selects = screen.getAllByRole('combobox');
      const categorySelect = selects.find(s => s.textContent?.includes('Select category'));
      if (categorySelect) {
        fireEvent.change(categorySelect, { target: { value: 'cafe' } });
      }

      fireEvent.click(screen.getByText('Post Place'));

      await waitFor(() => {
        expect(screen.getByText('Failed to create place')).toBeInTheDocument();
      });
    });
  });
});
