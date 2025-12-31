// Contributors:
// Cursor AI Assistant - Bookmarks page (extracted from Profile)

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { bookmarksApi } from "../services/api";
import TripPlanner from "../components/TripPlanner";

const Bookmarks: React.FC = () => {
  const { user } = useAuth();
  const [bookmarkedPrograms, setBookmarkedPrograms] = useState<any[]>([]);
  const [bookmarkedPlaces, setBookmarkedPlaces] = useState<any[]>([]);
  const [bookmarkedTrips, setBookmarkedTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "programs" | "places" | "trips">("all");

  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const bookmarks = await bookmarksApi.getAllBookmarks();
        setBookmarkedPrograms(bookmarks?.programs || []);
        setBookmarkedPlaces(bookmarks?.places || []);
        setBookmarkedTrips(bookmarks?.trips || []);
      } catch (err) {
        console.error("Failed to load bookmarks:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadBookmarks();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Please log in to view your bookmarks.</p>
      </div>
    );
  }

  const totalBookmarks = bookmarkedPrograms.length + bookmarkedPlaces.length + bookmarkedTrips.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookmarks</h1>
          <p className="text-gray-600 mt-1">
            {totalBookmarks > 0 
              ? `You have ${totalBookmarks} saved item${totalBookmarks > 1 ? 's' : ''}`
              : 'Save programs, places, and trips for later'}
          </p>
        </div>

        {/* AI Trip Planner */}
        <TripPlanner hasBookmarks={totalBookmarks > 0} />

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab("all")}
                className={`flex-1 py-4 px-6 text-center font-semibold transition ${
                  activeTab === "all"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                All ({totalBookmarks})
              </button>
              <button
                onClick={() => setActiveTab("programs")}
                className={`flex-1 py-4 px-6 text-center font-semibold transition ${
                  activeTab === "programs"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                🎓 Programs ({bookmarkedPrograms.length})
              </button>
              <button
                onClick={() => setActiveTab("places")}
                className={`flex-1 py-4 px-6 text-center font-semibold transition ${
                  activeTab === "places"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                📍 Places ({bookmarkedPlaces.length})
              </button>
              <button
                onClick={() => setActiveTab("trips")}
                className={`flex-1 py-4 px-6 text-center font-semibold transition ${
                  activeTab === "trips"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                ✈️ Trips ({bookmarkedTrips.length})
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading bookmarks...</p>
          </div>
        ) : totalBookmarks === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🔖</div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">No Bookmarks Yet</h4>
            <p className="text-gray-600 mb-6">
              Start bookmarking programs, places, and trips to save them for later!
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to="/programs"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                Browse Programs
              </Link>
              <Link
                to="/places"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                Explore Places
              </Link>
              <Link
                to="/trips"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                Plan Trips
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Bookmarked Programs */}
            {(activeTab === "all" || activeTab === "programs") && bookmarkedPrograms.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">🎓</span>
                  Programs ({bookmarkedPrograms.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookmarkedPrograms.map((program: any) => (
                    <div key={program.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{program.program_name}</h3>
                      <p className="text-sm text-gray-600 mb-1">📚 {program.institution}</p>
                      <p className="text-sm text-gray-600 mb-2">📍 {program.city}, {program.country}</p>
                      {program.cost && (
                        <p className="text-sm text-gray-600 mb-2">💰 ${program.cost.toLocaleString()}</p>
                      )}
                      {program.description && (
                        <p className="text-sm text-gray-700 line-clamp-2 mb-4">{program.description}</p>
                      )}
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                        <Link
                          to={`/programs/${program.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          View Details →
                        </Link>
                        <button
                          onClick={async () => {
                            await bookmarksApi.unbookmarkProgram(program.id);
                            setBookmarkedPrograms(bookmarkedPrograms.filter((p: any) => p.id !== program.id));
                          }}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bookmarked Places */}
            {(activeTab === "all" || activeTab === "places") && bookmarkedPlaces.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">📍</span>
                  Places ({bookmarkedPlaces.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookmarkedPlaces.map((place: any) => (
                    <div key={place.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{place.name}</h3>
                      <p className="text-sm text-gray-600 mb-1 capitalize">🏷️ {place.category}</p>
                      <p className="text-sm text-gray-600 mb-2">📍 {place.city}, {place.country}</p>
                      {place.price_range && (
                        <p className="text-sm text-gray-600 mb-2">💰 {place.price_range}</p>
                      )}
                      {place.description && (
                        <p className="text-sm text-gray-700 line-clamp-2 mb-4">{place.description}</p>
                      )}
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                        <Link
                          to={`/places/${place.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          View Details →
                        </Link>
                        <button
                          onClick={async () => {
                            await bookmarksApi.unbookmarkPlace(place.id);
                            setBookmarkedPlaces(bookmarkedPlaces.filter((p: any) => p.id !== place.id));
                          }}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bookmarked Trips */}
            {(activeTab === "all" || activeTab === "trips") && bookmarkedTrips.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">✈️</span>
                  Trips ({bookmarkedTrips.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookmarkedTrips.map((trip: any) => (
                    <div key={trip.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{trip.destination}</h3>
                      <p className="text-sm text-gray-600 mb-1">📍 {trip.country}</p>
                      {trip.trip_type && (
                        <p className="text-sm text-gray-600 mb-2 capitalize">🏷️ {trip.trip_type}</p>
                      )}
                      {trip.description && (
                        <p className="text-sm text-gray-700 line-clamp-2 mb-4">{trip.description}</p>
                      )}
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                        <Link
                          to={`/trips/${trip.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          View Details →
                        </Link>
                        <button
                          onClick={async () => {
                            await bookmarksApi.unbookmarkTrip(trip.id);
                            setBookmarkedTrips(bookmarkedTrips.filter((t: any) => t.id !== trip.id));
                          }}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state for filtered view */}
            {activeTab !== "all" && (
              (activeTab === "programs" && bookmarkedPrograms.length === 0) ||
              (activeTab === "places" && bookmarkedPlaces.length === 0) ||
              (activeTab === "trips" && bookmarkedTrips.length === 0)
            ) && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">
                  {activeTab === "programs" && "🎓"}
                  {activeTab === "places" && "📍"}
                  {activeTab === "trips" && "✈️"}
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  No {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Bookmarked
                </h4>
                <p className="text-gray-600 mb-6">
                  Browse and bookmark {activeTab} to save them here.
                </p>
                <Link
                  to={`/${activeTab}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                  Browse {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;

