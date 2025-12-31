// Contributors:
// Gordon Song - Setup (1 hrs)
// Tae Kim - Enhancements (1 hrs)

import React, { useState, useEffect } from "react";
import { tripsApi, Trip } from "../services/api";
import TripCard from "../components/TripCard";
import { useBookmarks } from "../hooks/useBookmarks";

const Trips: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [tripTypeFilter, setTripTypeFilter] = useState("");
  const { isBookmarked, toggleBookmark } = useBookmarks();

  // Post Trip Modal State
  const [showPostModal, setShowPostModal] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");
  const [newTrip, setNewTrip] = useState({
    destination: "",
    country: "",
    description: "",
    trip_type: "weekend",
  });

  const tripTypes = [
    "weekend",
    "spring break",
    "summer",
    "winter break",
    "other",
  ];

  useEffect(() => {
    fetchTrips();
  }, [countryFilter, tripTypeFilter]);

  const fetchTrips = async () => {
    setLoading(true);
    setError("");
    try {
      const filters: any = {};
      if (countryFilter) filters.country = countryFilter;
      if (tripTypeFilter) filters.trip_type = tripTypeFilter;

      const data = await tripsApi.list(filters);
      setTrips(data);
    } catch (err: any) {
      setError("More Trips Coming Soon!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const uniqueCountries = Array.from(
    new Set(trips.map((t) => t.country))
  ).sort();

  const getTripTypeIcon = (tripType: string) => {
    const icons: Record<string, string> = {
      weekend: "🏃‍♂️",
      "spring break": "🌸",
      summer: "☀️",
      "winter break": "❄️",
      other: "✈️",
    };
    return icons[tripType] || "✈️";
  };

  const handlePostTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);
    setPostError("");

    try {
      await tripsApi.create(newTrip);
      setShowPostModal(false);
      setNewTrip({
        destination: "",
        country: "",
        description: "",
        trip_type: "weekend",
      });
      // Refresh the trips list
      fetchTrips();
    } catch (err: any) {
      setPostError(
        err.response?.data?.detail || "Failed to post trip. Please try again."
      );
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Plan Your Trips
            </h1>
            <p className="text-gray-600 text-lg">
              Discover weekend getaways and travel experiences from fellow
              students
            </p>
          </div>
          <button
            onClick={() => setShowPostModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition flex items-center gap-2 shadow-md"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Post a Trip</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="tripType"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Trip Type
              </label>
              <select
                id="tripType"
                value={tripTypeFilter}
                onChange={(e) => setTripTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Trip Types</option>
                {tripTypes.map((type) => (
                  <option key={type} value={type}>
                    {getTripTypeIcon(type)}{" "}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="country"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
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

            <div className="flex items-end">
              <button
                onClick={() => {
                  setCountryFilter("");
                  setTripTypeFilter("");
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        ) : trips.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">✈️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No Trips Found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or check back later for new trip
              recommendations.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-600">
              Found {trips.length} trip{trips.length !== 1 ? "s" : ""}
            </div>

            {/* Trip Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  isBookmarked={isBookmarked("trip", trip.id)}
                  onToggleBookmark={(bookmarked) =>
                    toggleBookmark("trip", trip.id, bookmarked)
                  }
                />
              ))}
            </div>
          </>
        )}

        {/* Post Trip Modal */}
        {showPostModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Post a Trip
                  </h2>
                  <button
                    onClick={() => setShowPostModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handlePostTrip}>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="destination"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Destination *
                      </label>
                      <input
                        type="text"
                        id="destination"
                        required
                        value={newTrip.destination}
                        onChange={(e) =>
                          setNewTrip({
                            ...newTrip,
                            destination: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Amsterdam, Prague, Paris"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="country"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Country *
                      </label>
                      <input
                        type="text"
                        id="country"
                        required
                        value={newTrip.country}
                        onChange={(e) =>
                          setNewTrip({ ...newTrip, country: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Netherlands, Czech Republic, France"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="trip_type"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Trip Type *
                      </label>
                      <select
                        id="trip_type"
                        required
                        value={newTrip.trip_type}
                        onChange={(e) =>
                          setNewTrip({ ...newTrip, trip_type: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {tripTypes.map((type) => (
                          <option key={type} value={type}>
                            {getTripTypeIcon(type)}{" "}
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        rows={4}
                        value={newTrip.description}
                        onChange={(e) =>
                          setNewTrip({
                            ...newTrip,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Share details about your trip - what you did, where you stayed, tips for others..."
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
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {posting ? "Posting..." : "Post Trip"}
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

export default Trips;
