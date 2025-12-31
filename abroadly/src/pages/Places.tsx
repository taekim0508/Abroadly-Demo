// Contributors:
// Gordon Song - Places Setup (1 hr)
// Tae Kim - Places Page Enhancements (1 hr)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { placesApi, Place } from '../services/api';
import PlacesMap from '../components/PlacesMap';
import PlaceCard from '../components/PlaceCard';
import { useBookmarks } from '../hooks/useBookmarks';

const Places: React.FC = () => {
  const navigate = useNavigate();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const { isBookmarked, toggleBookmark } = useBookmarks();

  // Post Place Modal State
  const [showPostModal, setShowPostModal] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState('');
  const [newPlace, setNewPlace] = useState({
    name: '',
    city: '',
    country: '',
    category: '',
    price_range: '',
    address: '',
    description: '',
    latitude: '',
    longitude: '',
  });

  const categories = [
    'restaurant',
    'cafe',
    'activity',
    'museum',
    'housing',
    'nightlife',
    'shopping',
    'other'
  ];

  useEffect(() => {
    fetchPlaces();
  }, [cityFilter, countryFilter, categoryFilter]);

  const fetchPlaces = async () => {
    setLoading(true);
    setError('');
    try {
      const filters: any = {};
      if (cityFilter) filters.city = cityFilter;
      if (countryFilter) filters.country = countryFilter;
      if (categoryFilter) filters.category = categoryFilter;
      
      const data = await placesApi.list(filters);
      setPlaces(data);
    } catch (err: any) {
      setError('More Places Coming Soon!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);
    setPostError('');
    
    try {
      const placeData = {
        ...newPlace,
        latitude: newPlace.latitude ? parseFloat(newPlace.latitude) : undefined,
        longitude: newPlace.longitude ? parseFloat(newPlace.longitude) : undefined,
      };
      await placesApi.create(placeData);
      setShowPostModal(false);
      setNewPlace({
        name: '',
        city: '',
        country: '',
        category: '',
        price_range: '',
        address: '',
        description: '',
        latitude: '',
        longitude: '',
      });
      fetchPlaces();
    } catch (err: any) {
      setPostError(err.response?.data?.detail || 'Failed to post place. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const uniqueCities = Array.from(new Set(places.map(p => p.city))).sort();
  const uniqueCountries = Array.from(new Set(places.map(p => p.country))).sort();

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

  const handlePlaceClick = (place: Place) => {
    navigate(`/places/${place.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Discover Places</h1>
            <p className="text-gray-600 text-lg">
              Find the best spots recommended by students studying abroad
            </p>
          </div>
          <button
            onClick={() => setShowPostModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition flex items-center gap-2 shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Post a Place</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {getCategoryIcon(cat)} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                id="country"
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Countries</option>
                {uniqueCountries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <select
                id="city"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Cities</option>
                {uniqueCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setCityFilter('');
                  setCountryFilter('');
                  setCategoryFilter('');
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Map */}
        {!loading && places.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Map View</h2>
            <PlacesMap places={places} onPlaceClick={handlePlaceClick} />
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        ) : places.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Places Found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or check back later for new recommendations.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-600">
              Found {places.length} place{places.length !== 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {places.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  isBookmarked={isBookmarked('place', place.id)}
                  onToggleBookmark={(bookmarked) => toggleBookmark('place', place.id, bookmarked)}
                />
              ))}
            </div>
          </>
        )}

        {/* Post Place Modal */}
        {showPostModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Post a Place</h2>
                  <button
                    onClick={() => setShowPostModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handlePostPlace}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Place Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newPlace.name}
                        onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., The Cozy Cafe"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={newPlace.city}
                          onChange={(e) => setNewPlace({ ...newPlace, city: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Paris"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country *
                        </label>
                        <input
                          type="text"
                          required
                          value={newPlace.country}
                          onChange={(e) => setNewPlace({ ...newPlace, country: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., France"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <select
                          required
                          value={newPlace.category}
                          onChange={(e) => setNewPlace({ ...newPlace, category: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select category</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price Range
                        </label>
                        <select
                          value={newPlace.price_range}
                          onChange={(e) => setNewPlace({ ...newPlace, price_range: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select price</option>
                          <option value="$">$ - Budget</option>
                          <option value="$$">$$ - Moderate</option>
                          <option value="$$$">$$$ - Expensive</option>
                          <option value="$$$$">$$$$ - Very Expensive</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={newPlace.address}
                        onChange={(e) => setNewPlace({ ...newPlace, address: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 123 Main Street"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Latitude (optional)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={newPlace.latitude}
                          onChange={(e) => setNewPlace({ ...newPlace, latitude: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 48.8566"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Longitude (optional)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={newPlace.longitude}
                          onChange={(e) => setNewPlace({ ...newPlace, longitude: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 2.3522"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        rows={4}
                        value={newPlace.description}
                        onChange={(e) => setNewPlace({ ...newPlace, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Share your thoughts about this place..."
                      />
                    </div>

                    {postError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {postError}
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowPostModal(false)}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={posting}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
                      >
                        {posting ? "Posting..." : "Post Place"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Places;

