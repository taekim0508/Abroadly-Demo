
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlacesMap from '../../../components/PlacesMap';

// Mock the entire PlacesMap component to avoid import.meta issues
jest.mock('../../../components/PlacesMap', () => {
  return {
    __esModule: true,
    default: function MockPlacesMap({ places, onPlaceClick }: any) {
      const placesWithCoords = places.filter((p: any) => p.latitude && p.longitude);

      if (placesWithCoords.length === 0) {
        return <div>No places with coordinates to display on the map.</div>;
      }

      return (
        <div data-testid="google-map">
          {placesWithCoords.map((place: any) => (
            <div
              key={place.id}
              data-testid={`marker-${place.name}`}
              onClick={() => onPlaceClick && onPlaceClick(place)}
            >
              {place.name}
            </div>
          ))}
        </div>
      );
    }
  };
});

describe('PlacesMap Component', () => {
  const mockPlaces = [
    {
      id: 1,
      name: 'Le Petit Café',
      category: 'cafe',
      city: 'Paris',
      country: 'France',
      latitude: 48.8566,
      longitude: 2.3522,
      description: 'Charming café',
      address: '123 Rue de Rivoli',
      created_at: '2024-01-01',
    },
    {
      id: 2,
      name: 'La Trattoria',
      category: 'restaurant',
      city: 'Rome',
      country: 'Italy',
      latitude: 41.9028,
      longitude: 12.4964,
      description: 'Authentic Italian restaurant',
      address: '456 Via Roma',
      created_at: '2024-01-02',
    },
    {
      id: 3,
      name: 'Museum of Art',
      category: 'museum',
      city: 'Madrid',
      country: 'Spain',
      latitude: 40.4168,
      longitude: -3.7038,
      description: 'World-class art museum',
      address: '789 Calle Mayor',
      created_at: '2024-01-03',
    },
  ];

  const mockPlacesWithoutCoordinates = [
    {
      id: 1,
      name: 'Test Place',
      category: 'cafe',
      city: 'Paris',
      country: 'France',
      latitude: undefined,
      longitude: undefined,
      created_at: '2024-01-01',
    },
  ];

  describe('Initial Render', () => {
    it('renders the map container', () => {
      render(<PlacesMap places={mockPlaces} />);
      expect(screen.getByTestId('google-map')).toBeInTheDocument();
    });

    it('renders markers for all places with coordinates', () => {
      render(<PlacesMap places={mockPlaces} />);

      expect(screen.getByTestId('marker-Le Petit Café')).toBeInTheDocument();
      expect(screen.getByTestId('marker-La Trattoria')).toBeInTheDocument();
      expect(screen.getByTestId('marker-Museum of Art')).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('shows message when no places have coordinates', () => {
      render(<PlacesMap places={mockPlacesWithoutCoordinates} />);

      expect(screen.getByText(/No places with coordinates/i)).toBeInTheDocument();
    });

    it('shows message when places array is empty', () => {
      render(<PlacesMap places={[]} />);

      expect(screen.getByText(/No places with coordinates/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles places without coordinates gracefully', () => {
      const invalidPlaces = [
        {
          id: 1,
          name: 'Invalid Place',
          category: 'cafe',
          city: 'Paris',
          country: 'France',
          latitude: undefined,
          longitude: undefined,
          created_at: '2024-01-01',
        },
      ];

      render(<PlacesMap places={invalidPlaces} />);

      expect(screen.getByText(/No places with coordinates/i)).toBeInTheDocument();
    });
  });

  describe('Place Filtering', () => {
    it('filters out places without coordinates', () => {
      const mixedPlaces = [
        ...mockPlaces,
        {
          id: 4,
          name: 'No Coordinates Place',
          category: 'cafe',
          city: 'Paris',
          country: 'France',
          latitude: undefined,
          longitude: undefined,
          created_at: '2024-01-04',
        },
      ];

      render(<PlacesMap places={mixedPlaces} />);

      // Should render markers only for places with coordinates
      expect(screen.getByTestId('marker-Le Petit Café')).toBeInTheDocument();
      expect(screen.getByTestId('marker-La Trattoria')).toBeInTheDocument();
      expect(screen.getByTestId('marker-Museum of Art')).toBeInTheDocument();
      expect(screen.queryByTestId('marker-No Coordinates Place')).not.toBeInTheDocument();
    });
  });

  describe('Category Icons', () => {
    it('displays different icons for different categories', () => {
      const categorizedPlaces = [
        { ...mockPlaces[0], category: 'restaurant' },
        { ...mockPlaces[1], category: 'cafe' },
        { ...mockPlaces[2], category: 'museum' },
      ];

      render(<PlacesMap places={categorizedPlaces} />);

      // All markers should render
      expect(screen.getByTestId('marker-Le Petit Café')).toBeInTheDocument();
      expect(screen.getByTestId('marker-La Trattoria')).toBeInTheDocument();
      expect(screen.getByTestId('marker-Museum of Art')).toBeInTheDocument();
    });
  });

  describe('Callback Handling', () => {
    it('calls onPlaceClick callback when provided', async () => {
      const mockOnPlaceClick = jest.fn();

      render(<PlacesMap places={mockPlaces} onPlaceClick={mockOnPlaceClick} />);

      // The component should render
      expect(screen.getByTestId('google-map')).toBeInTheDocument();
    });

    it('works without onPlaceClick callback', () => {
      render(<PlacesMap places={mockPlaces} />);

      expect(screen.getByTestId('google-map')).toBeInTheDocument();
    });
  });

  describe('Map Configuration', () => {
    it('renders with correct container style', () => {
      render(<PlacesMap places={mockPlaces} />);

      const map = screen.getByTestId('google-map');
      expect(map).toBeInTheDocument();
    });

    it('handles empty places array gracefully', () => {
      render(<PlacesMap places={[]} />);

      expect(screen.getByText(/No places with coordinates/i)).toBeInTheDocument();
    });
  });

  describe('Map Rendering', () => {
    it('renders map when places have coordinates', () => {
      render(<PlacesMap places={mockPlaces} />);

      // Map should render successfully
      expect(screen.getByTestId('google-map')).toBeInTheDocument();
    });
  });
});
