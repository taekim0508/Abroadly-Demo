// PlacesMap Component - Google Maps integration for Places page
import React, { useState, useCallback } from 'react';
import { GoogleMap, useLoadScript, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { Place } from '../services/api';

interface PlacesMapProps {
  places: Place[];
  onPlaceClick?: (place: Place) => void;
}

const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '0.5rem'
};

// Default center (will be adjusted based on places)
const defaultCenter = {
  lat: 48.8566,
  lng: 2.3522
};

const PlacesMap: React.FC<PlacesMapProps> = ({ places, onPlaceClick }) => {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locatingUser, setLocatingUser] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Use useLoadScript hook for better handling of script loading
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || '',
  });

  // Calculate map center based on places
  const getMapCenter = useCallback(() => {
    if (places.length === 0) return defaultCenter;

    // For now, center on first place with valid coordinates
    const firstPlace = places.find(p => p.latitude && p.longitude);
    if (firstPlace && firstPlace.latitude && firstPlace.longitude) {
      return {
        lat: firstPlace.latitude,
        lng: firstPlace.longitude
      };
    }

    return defaultCenter;
  }, [places]);

  // Fit map bounds to show all markers (but will be overridden if user clicks "Near Me")
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);

    // Don't auto-fit to all places if user has already set their location
    if (userLocation) {
      console.log('Map loaded with user location already set, centering on user');
      map.panTo(userLocation);
      map.setZoom(13);
      return;
    }

    if (places.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      places.forEach(place => {
        if (place.latitude && place.longitude) {
          bounds.extend({
            lat: place.latitude,
            lng: place.longitude
          });
        }
      });

      // Only fit bounds if we have valid places
      if (places.some(p => p.latitude && p.longitude)) {
        map.fitBounds(bounds);
      }
    }
  }, [places, userLocation]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (place: Place) => {
    setSelectedPlace(place);
    if (onPlaceClick) {
      onPlaceClick(place);
    }
  };

  const getLocationFromIP = async () => {
    try {
      console.log('Trying IP-based geolocation...');
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      if (data.latitude && data.longitude) {
        const userPos = {
          lat: data.latitude,
          lng: data.longitude,
        };
        console.log('✅ Got location from IP:', userPos, `(${data.city}, ${data.region})`);
        setUserLocation(userPos);
        // Force map to pan to user location
        if (map) {
          console.log('Panning map to Nashville...');
          map.panTo(userPos);
          map.setZoom(13);
          // Double-check after a short delay to ensure it worked
          setTimeout(() => {
            map.panTo(userPos);
            console.log('Map should now be centered on your location');
          }, 100);
        } else {
          console.warn('Map not loaded yet, location marker will show but map won\'t pan');
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('IP geolocation failed:', error);
      return false;
    }
  };

  const handleNearMe = async () => {
    setLocatingUser(true);
    // Try IP-based geolocation first (faster and more reliable)
    console.log('Getting your location...');
    const ipSuccess = await getLocationFromIP();
    if (ipSuccess) {
      setLocatingUser(false);
      return;
    }
    // Fallback to browser geolocation
    if (!navigator.geolocation) {
      alert('Unable to determine your location');
      setLocatingUser(false);
      return;
    }

    console.log('Trying browser geolocation...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        console.log('✅ Got precise location from browser:', userPos);
        setUserLocation(userPos);
        if (map) {
          map.panTo(userPos);
          map.setZoom(13);
        }
        setLocatingUser(false);
      },
      async (error) => {
        console.error('Browser geolocation failed:', error);
        // Already tried IP geolocation above, so just show error
        alert('Unable to determine your location. Please check your browser permissions.');
        setLocatingUser(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 60000
      }
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      restaurant: '🍽️',
      cafe: '☕',
      activity: '🎯',
      museum: '🏛️',
      housing: '🏠',
      nightlife: '🎉',
      shopping: '🛍️',
      other: '📍'
    };
    return icons[category] || '📍';
  };

  // Filter places that have valid coordinates
  const placesWithCoordinates = React.useMemo(() => places.filter(
    place => place.latitude && place.longitude
  ), [places]);

  // Memoize map options to prevent re-renders
  const mapOptions = React.useMemo(() => ({
    streetViewControl: false,
    mapTypeControl: true,
    fullscreenControl: true,
  }), []);

  // Debug: Log the places data
  React.useEffect(() => {
    console.log('PlacesMap - Total places:', places.length);
    console.log('PlacesMap - Places with coordinates:', placesWithCoordinates.length);
    console.log('PlacesMap - Places data:', placesWithCoordinates);
  }, [places, placesWithCoordinates]);

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

  if (placesWithCoordinates.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <p className="text-gray-600">No places with coordinates to display on the map.</p>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {/* Near Me Button - Bottom Left */}
      <button
        onClick={handleNearMe}
        disabled={locatingUser}
        className="absolute bottom-4 left-4 z-10 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-md transition flex items-center gap-2 disabled:opacity-50"
      >
        {locatingUser ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Locating...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Near Me</span>
          </>
        )}
      </button>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={getMapCenter()}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {placesWithCoordinates.map((place) => (
          <MarkerF
            key={place.id}
            position={{
              lat: place.latitude!,
              lng: place.longitude!
            }}
            onClick={() => handleMarkerClick(place)}
            title={place.name}
          />
        ))}

        {/* User's current location marker (blue) */}
        {userLocation && (
          <MarkerF
            position={userLocation}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
            title="Your Location"
          />
        )}

        {selectedPlace && selectedPlace.latitude && selectedPlace.longitude && (
          <InfoWindowF
            position={{
              lat: selectedPlace.latitude,
              lng: selectedPlace.longitude
            }}
            onCloseClick={() => setSelectedPlace(null)}
          >
            <div className="p-2 max-w-xs">
              <h3 className="font-bold text-lg mb-1">{selectedPlace.name}</h3>
              <p className="text-sm text-gray-600 capitalize mb-2">
                {getCategoryIcon(selectedPlace.category)} {selectedPlace.category}
              </p>
              <p className="text-sm text-gray-700 mb-1">
                📍 {selectedPlace.city}, {selectedPlace.country}
              </p>
              {selectedPlace.address && (
                <p className="text-sm text-gray-600 mb-2">
                  {selectedPlace.address}
                </p>
              )}
              {selectedPlace.description && (
                <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                  {selectedPlace.description}
                </p>
              )}
              <a
                href={`/places/${selectedPlace.id}`}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View Details →
              </a>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
    </div>
  );
};

export default React.memo(PlacesMap);
