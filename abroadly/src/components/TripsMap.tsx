// TripsMap Component - Google Maps integration for Trips page
import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Trip } from '../services/api';

interface TripsMapProps {
  trips: Trip[];
  onTripClick?: (trip: Trip) => void;
}

interface TripWithCoordinates extends Trip {
  latitude?: number;
  longitude?: number;
}

const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '0.5rem'
};

// Default center
const defaultCenter = {
  lat: 48.8566,
  lng: 2.3522
};

const TripsMap: React.FC<TripsMapProps> = ({ trips, onTripClick }) => {
  const [selectedTrip, setSelectedTrip] = useState<TripWithCoordinates | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [tripsWithCoords, setTripsWithCoords] = useState<TripWithCoordinates[]>([]);
  const [geocodingInProgress, setGeocodingInProgress] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || '',
  });

  // Geocode trips to get coordinates
  useEffect(() => {
    if (!isLoaded || trips.length === 0 || !window.google?.maps?.Geocoder) return;

    const geocodeTrips = async () => {
      setGeocodingInProgress(true);
      const geocoder = new window.google.maps.Geocoder();
      const tripsWithCoordinates: TripWithCoordinates[] = [];

      for (const trip of trips) {
        try {
          const address = `${trip.destination}, ${trip.country}`;
          const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
            geocoder.geocode({ address }, (results, status) => {
              if (status === 'OK' && results && results.length > 0) {
                resolve(results);
              } else {
                // Don't reject, just skip this trip
                resolve([]);
              }
            });
          });

          if (result && result.length > 0) {
            const location = result[0].geometry.location;
            tripsWithCoordinates.push({
              ...trip,
              latitude: location.lat(),
              longitude: location.lng(),
            });
          }
        } catch (error) {
          console.error(`Failed to geocode ${trip.destination}, ${trip.country}:`, error);
          // Continue with other trips even if one fails
        }
      }

      setTripsWithCoords(tripsWithCoordinates);
      setGeocodingInProgress(false);
    };

    geocodeTrips();
  }, [isLoaded, trips]);

  // Calculate map center based on trips with coordinates
  const getMapCenter = useCallback(() => {
    if (tripsWithCoords.length === 0) return defaultCenter;

    const firstTrip = tripsWithCoords.find(t => t.latitude && t.longitude);
    if (firstTrip && firstTrip.latitude && firstTrip.longitude) {
      return {
        lat: firstTrip.latitude,
        lng: firstTrip.longitude
      };
    }

    return defaultCenter;
  }, [tripsWithCoords]);

  // Fit map bounds to show all markers
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);

    if (tripsWithCoords.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      tripsWithCoords.forEach(trip => {
        if (trip.latitude && trip.longitude) {
          bounds.extend({
            lat: trip.latitude,
            lng: trip.longitude
          });
        }
      });

      if (tripsWithCoords.some(t => t.latitude && t.longitude)) {
        map.fitBounds(bounds);
        // Add some padding
        const padding = 50;
        map.fitBounds(bounds, padding);
      }
    }
  }, [tripsWithCoords]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (trip: TripWithCoordinates) => {
    setSelectedTrip(trip);
    if (onTripClick) {
      onTripClick(trip);
    }
  };

  const getTripTypeIcon = (tripType: string | undefined) => {
    const icons: Record<string, string> = {
      weekend: '🏃‍♂️',
      'spring break': '🌸',
      summer: '☀️',
      'winter break': '❄️',
      other: '✈️',
    };
    return icons[tripType || 'other'] || '✈️';
  };

  if (loadError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-red-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-red-900 mb-1">Error Loading Google Maps</h4>
            <p className="text-sm text-red-800">
              Failed to load Google Maps. Please check your API key and try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading map...</span>
        </div>
      </div>
    );
  }

  if (!apiKey || apiKey === 'your_api_key_here') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-yellow-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1">Google Maps API Key Required</h4>
            <p className="text-sm text-yellow-800 mb-2">
              To display the interactive map, you need to set up a Google Maps API key.
            </p>
            <ol className="text-sm text-yellow-800 list-decimal ml-4 space-y-1">
              <li>Get an API key from <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
              <li>Add it to your <code className="bg-yellow-100 px-1 py-0.5 rounded">.env</code> file as <code className="bg-yellow-100 px-1 py-0.5 rounded">VITE_GOOGLE_MAPS_API_KEY</code></li>
              <li>Restart the development server</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (geocodingInProgress) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Locating trip destinations...</span>
        </div>
      </div>
    );
  }

  if (tripsWithCoords.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <p className="text-gray-600">No trips with valid locations to display on the map.</p>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={getMapCenter()}
        zoom={4}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: true,
        }}
      >
        {tripsWithCoords.map((trip) => {
          if (!trip.latitude || !trip.longitude) return null;
          
          return (
            <Marker
              key={trip.id}
              position={{
                lat: trip.latitude,
                lng: trip.longitude
              }}
              onClick={() => handleMarkerClick(trip)}
              title={trip.destination}
            />
          );
        })}

        {selectedTrip && selectedTrip.latitude && selectedTrip.longitude && (
          <InfoWindow
            position={{
              lat: selectedTrip.latitude,
              lng: selectedTrip.longitude
            }}
            onCloseClick={() => setSelectedTrip(null)}
          >
            <div className="p-2 max-w-xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{getTripTypeIcon(selectedTrip.trip_type)}</span>
                <h3 className="font-bold text-lg">{selectedTrip.destination}</h3>
              </div>
              <p className="text-sm text-gray-600 capitalize mb-2">
                {selectedTrip.trip_type || 'trip'}
              </p>
              <p className="text-sm text-gray-700 mb-1">
                📍 {selectedTrip.country}
              </p>
              {selectedTrip.description && (
                <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                  {selectedTrip.description}
                </p>
              )}
              <a
                href={`/trips/${selectedTrip.id}`}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View Details →
              </a>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default TripsMap;

