// Contributors:
// Auto-generated profile page component with editable profile

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { authApi, MyReviews, ProfileUpdate, Trip, StudyAbroadProgram, Place, tripsApi } from "../services/api";
import StarRating from "../components/StarRating";

const Profile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [reviews, setReviews] = useState<MyReviews | null>(null);
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [myPrograms, setMyPrograms] = useState<StudyAbroadProgram[]>([]);
  const [myPlaces, setMyPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<{ type: string; id: number } | null>(null);
  
  // Tab state - read from URL query parameter
  const tabParam = searchParams.get("tab") as "trips" | "places" | "reviews" | null;
  const validTabs = ["trips", "places", "reviews"];
  const [activeTab, setActiveTab] = useState<"trips" | "places" | "reviews">(
    tabParam && validTabs.includes(tabParam) ? tabParam : "trips"
  );

  // Update URL when tab changes
  const handleTabChange = (tab: "trips" | "places" | "reviews") => {
    setActiveTab(tab);
    if (tab === "trips") {
      // Remove tab param for default tab
      searchParams.delete("tab");
    } else {
      searchParams.set("tab", tab);
    }
    setSearchParams(searchParams, { replace: true });
  };
  
  // Edit trip state
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [editFormData, setEditFormData] = useState({
    destination: "",
    country: "",
    description: "",
    trip_type: "",
  });
  const [saving, setSaving] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileUpdate>({
    first_name: "",
    last_name: "",
    age: undefined,
    institution: "",
    majors: [],
    minors: [],
  });
  const [majorInput, setMajorInput] = useState("");
  const [minorInput, setMinorInput] = useState("");

  const handleEditTrip = (trip: Trip) => {
    setEditingTrip(trip);
    setEditFormData({
      destination: trip.destination,
      country: trip.country,
      description: trip.description || "",
      trip_type: trip.trip_type || "",
    });
  };

  const handleSaveTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrip) return;
    
    setSaving(true);
    try {
      await tripsApi.update(editingTrip.id, editFormData);
      // Refresh trips
      const updatedTrips = await authApi.getMyTrips();
      setMyTrips(updatedTrips);
      setEditingTrip(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update trip");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTrip = async (tripId: number) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    
    try {
      await tripsApi.delete(tripId);
      // Remove from list
      setMyTrips(myTrips.filter(t => t.id !== tripId));
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to delete trip");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profile, reviewsData, tripsData, programsData, placesData] = await Promise.all([
          authApi.getProfile(),
          authApi.getMyReviews(),
          authApi.getMyTrips(),
          authApi.getMyPrograms(),
          authApi.getMyPlaces(),
        ]);
        
        setProfileData({
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          age: profile.age || undefined,
          institution: profile.institution || "",
          majors: profile.majors || [],
          minors: profile.minors || [],
        });
        setReviews(reviewsData);
        setMyTrips(Array.isArray(tripsData) ? tripsData : []);
        setMyPrograms(Array.isArray(programsData) ? programsData : []);
        setMyPlaces(Array.isArray(placesData) ? placesData : []);
      } catch (err: any) {
        setError(
          err.response?.data?.detail ||
            err.message ||
            "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await authApi.updateProfile(profileData);
      await refreshUser();
      setIsEditing(false);
    } catch (err: any) {
      alert(
        err.response?.data?.detail ||
          err.message ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setProfileData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        age: user.age || undefined,
        institution: user.institution || "",
        majors: user.majors || [],
        minors: user.minors || [],
      });
    }
    setMajorInput("");
    setMinorInput("");
    setIsEditing(false);
  };

  const addMajor = () => {
    if (majorInput.trim() && !profileData.majors?.includes(majorInput.trim())) {
      setProfileData({
        ...profileData,
        majors: [...(profileData.majors || []), majorInput.trim()],
      });
      setMajorInput("");
    }
  };

  const removeMajor = (major: string) => {
    setProfileData({
      ...profileData,
      majors: profileData.majors?.filter((m) => m !== major) || [],
    });
  };

  const addMinor = () => {
    if (minorInput.trim() && !profileData.minors?.includes(minorInput.trim())) {
      setProfileData({
        ...profileData,
        minors: [...(profileData.minors || []), minorInput.trim()],
      });
      setMinorInput("");
    }
  };

  const removeMinor = (minor: string) => {
    setProfileData({
      ...profileData,
      minors: profileData.minors?.filter((m) => m !== minor) || [],
    });
  };

  const handleDeleteReview = async (reviewType: string, reviewId: number) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    setDeletingId({ type: reviewType, id: reviewId });
    try {
      await authApi.deleteReview(reviewType, reviewId);
      const data = await authApi.getMyReviews();
      setReviews(data);
    } catch (err: any) {
      alert(
        err.response?.data?.detail ||
          err.message ||
          "Failed to delete review"
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-1">Manage your personal information</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-gray-900 hover:bg-black text-white px-6 py-2 rounded-lg transition font-medium"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-gray-900 hover:bg-black text-white px-6 py-2 rounded-lg transition font-medium disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>

        {/* Profile Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Personal Information
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profileData.first_name || ""}
                    onChange={(e) =>
                      setProfileData({ ...profileData, first_name: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profileData.last_name || ""}
                    onChange={(e) =>
                      setProfileData({ ...profileData, last_name: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition disabled:bg-gray-50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  min="16"
                  max="100"
                  value={profileData.age || ""}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      age: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Contact Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institution
                </label>
                <input
                  type="text"
                  value={profileData.institution || ""}
                  onChange={(e) =>
                    setProfileData({ ...profileData, institution: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition disabled:bg-gray-50"
                  placeholder="Vanderbilt University"
                />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Academic Information
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Majors
                </label>
                {isEditing && (
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={majorInput}
                      onChange={(e) => setMajorInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addMajor();
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                      placeholder="Add major"
                    />
                    <button
                      type="button"
                      onClick={addMajor}
                      disabled={!majorInput.trim()}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                )}
                {profileData.majors && profileData.majors.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profileData.majors.map((major) => (
                      <span
                        key={major}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                      >
                        {major}
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => removeMajor(major)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No majors added</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minors
                </label>
                {isEditing && (
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={minorInput}
                      onChange={(e) => setMinorInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addMinor();
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                      placeholder="Add minor"
                    />
                    <button
                      type="button"
                      onClick={addMinor}
                      disabled={!minorInput.trim()}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                )}
                {profileData.minors && profileData.minors.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profileData.minors.map((minor) => (
                      <span
                        key={minor}
                        className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm"
                      >
                        {minor} (minor)
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => removeMinor(minor)}
                            className="ml-2 text-gray-600 hover:text-gray-800"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No minors added</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Study Abroad Status Card */}
        {user.study_abroad_status && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">
                  {user.study_abroad_status === 'prospective' && '🔍'}
                  {user.study_abroad_status === 'current' && '✈️'}
                  {user.study_abroad_status === 'former' && '🎓'}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {user.study_abroad_status === 'prospective' && 'Planning to Study Abroad'}
                    {user.study_abroad_status === 'current' && 'Currently Studying Abroad'}
                    {user.study_abroad_status === 'former' && 'Study Abroad Alumni'}
                  </h3>
                  {(user.study_abroad_status === 'current' || user.study_abroad_status === 'former') && user.program_name && (
                    <p className="text-gray-600">
                      {user.program_name} • {user.program_city}, {user.program_country}
                      {user.program_term && ` • ${user.program_term}`}
                    </p>
                  )}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                user.study_abroad_status === 'prospective' ? 'bg-blue-100 text-blue-800' :
                user.study_abroad_status === 'current' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {user.study_abroad_status === 'prospective' && 'Prospective'}
                {user.study_abroad_status === 'current' && 'Current'}
                {user.study_abroad_status === 'former' && 'Alumni'}
              </span>
            </div>
          </div>
        )}

        {/* Reminder for former students to write a review */}
        {user.study_abroad_status === 'former' && reviews && reviews.program_reviews?.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-3xl">✍️</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-amber-900 mb-1">Share your study abroad experience!</h3>
                <p className="text-amber-800 mb-4">
                  Your review helps future students make informed decisions about their study abroad journey.
                </p>
                <Link
                  to="/programs"
                  className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  Write a Program Review
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* My Programs Section - Always Visible */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Programs</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading programs...</p>
            </div>
          ) : myPrograms.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎓</div>
              <p className="text-gray-600 mb-4">You haven't posted any programs yet.</p>
              <Link
                to="/programs"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                Browse Programs
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myPrograms.map((program) => (
                <div key={program.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{program.program_name}</h3>
                  <p className="text-sm text-gray-600 mb-1">📚 {program.institution}</p>
                  <p className="text-sm text-gray-600 mb-2">📍 {program.city}, {program.country}</p>
                  {program.description && (
                    <p className="text-sm text-gray-700 line-clamp-2 mb-3">{program.description}</p>
                  )}
                  <Link
                    to={`/programs/${program.id}`}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    View Details →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabbed Content Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => handleTabChange("trips")}
                className={`flex-1 py-4 px-6 text-center font-semibold transition ${
                  activeTab === "trips"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                My Trips
              </button>
              <button
                onClick={() => handleTabChange("places")}
                className={`flex-1 py-4 px-6 text-center font-semibold transition ${
                  activeTab === "places"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                My Places
              </button>
              <button
                onClick={() => handleTabChange("reviews")}
                className={`flex-1 py-4 px-6 text-center font-semibold transition ${
                  activeTab === "reviews"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                My Reviews
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* My Trips Tab */}
            {activeTab === "trips" && (
              <div>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Loading trips...</p>
                  </div>
                ) : myTrips.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">✈️</div>
                    <p className="text-gray-600 mb-4">You haven't posted any trips yet.</p>
                    <Link
                      to="/trips"
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                    >
                      Post Your First Trip
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myTrips.map((trip) => (
                      <div key={trip.id} className="group border border-gray-200 rounded-lg p-4 hover:shadow-md transition relative">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex gap-2">
                          <button
                            onClick={() => handleEditTrip(trip)}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition"
                            title="Edit trip"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteTrip(trip.id)}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition"
                            title="Delete trip"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{trip.destination}</h3>
                        <p className="text-sm text-gray-600 mb-1">📍 {trip.country}</p>
                        {trip.trip_type && (
                          <p className="text-sm text-gray-600 mb-2 capitalize">🏷️ {trip.trip_type}</p>
                        )}
                        {trip.description && (
                          <p className="text-sm text-gray-700 line-clamp-2 mb-3">{trip.description}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          Posted {new Date(trip.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* My Places Tab */}
            {activeTab === "places" && (
              <div>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Loading places...</p>
                  </div>
                ) : myPlaces.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📍</div>
                    <p className="text-gray-600 mb-4">You haven't recommended any places yet.</p>
                    <Link
                      to="/places"
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                    >
                      Recommend a Place
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myPlaces.map((place) => (
                      <div key={place.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{place.name}</h3>
                        <p className="text-sm text-gray-600 mb-1 capitalize">🏷️ {place.category}</p>
                        <p className="text-sm text-gray-600 mb-2">📍 {place.city}, {place.country}</p>
                        {place.price_range && (
                          <p className="text-sm text-gray-600 mb-2">💰 {place.price_range}</p>
                        )}
                        {place.description && (
                          <p className="text-sm text-gray-700 line-clamp-2 mb-3">{place.description}</p>
                        )}
                        <Link
                          to={`/places/${place.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          View Details →
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* My Reviews Tab */}
            {activeTab === "reviews" && (
              <div>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Loading reviews...</p>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                ) : reviews && (
                  <div className="space-y-6">
              {(reviews.program_reviews?.length ?? 0) > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Program Reviews ({reviews.program_reviews?.length ?? 0})
                  </h3>
                  <div className="space-y-4">
                    {reviews.program_reviews?.map((review) => (
                      <div
                        key={review.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <StarRating rating={review.rating} />
                              <span className="text-sm text-gray-500">
                                {new Date(review.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700">{review.review_text}</p>
                          </div>
                          <button
                            onClick={() =>
                              handleDeleteReview("program", review.id)
                            }
                            disabled={
                              deletingId?.type === "program" &&
                              deletingId?.id === review.id
                            }
                            className="ml-4 px-3 py-1 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                          >
                            {deletingId?.type === "program" &&
                            deletingId?.id === review.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(reviews.course_reviews?.length ?? 0) > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Course Reviews ({reviews.course_reviews?.length ?? 0})
                  </h3>
                  <div className="space-y-4">
                    {reviews.course_reviews?.map((review) => (
                      <div
                        key={review.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <StarRating rating={review.rating} />
                              <span className="text-sm text-gray-500">
                                {new Date(review.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="font-medium text-gray-900">
                              {review.course_name}
                            </p>
                            {review.instructor_name && (
                              <p className="text-sm text-gray-600">
                                Instructor: {review.instructor_name}
                              </p>
                            )}
                            <p className="text-gray-700 mt-2">
                              {review.review_text}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handleDeleteReview("course", review.id)
                            }
                            disabled={
                              deletingId?.type === "course" &&
                              deletingId?.id === review.id
                            }
                            className="ml-4 px-3 py-1 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                          >
                            {deletingId?.type === "course" &&
                            deletingId?.id === review.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(reviews.housing_reviews?.length ?? 0) > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Housing Reviews ({reviews.housing_reviews?.length ?? 0})
                  </h3>
                  <div className="space-y-4">
                    {reviews.housing_reviews?.map((review) => (
                      <div
                        key={review.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <StarRating rating={review.rating} />
                              <span className="text-sm text-gray-500">
                                {new Date(review.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="font-medium text-gray-900">
                              {review.housing_description}
                            </p>
                            <p className="text-gray-700 mt-2">
                              {review.review_text}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handleDeleteReview("housing", review.id)
                            }
                            disabled={
                              deletingId?.type === "housing" &&
                              deletingId?.id === review.id
                            }
                            className="ml-4 px-3 py-1 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                          >
                            {deletingId?.type === "housing" &&
                            deletingId?.id === review.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(reviews.place_reviews?.length ?? 0) > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Place Reviews ({reviews.place_reviews?.length ?? 0})
                  </h3>
                  <div className="space-y-4">
                    {reviews.place_reviews?.map((review) => (
                      <div
                        key={review.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <StarRating rating={review.rating} />
                              <span className="text-sm text-gray-500">
                                {new Date(review.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700">{review.review_text}</p>
                          </div>
                          <button
                            onClick={() =>
                              handleDeleteReview("place", review.id)
                            }
                            disabled={
                              deletingId?.type === "place" &&
                              deletingId?.id === review.id
                            }
                            className="ml-4 px-3 py-1 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                          >
                            {deletingId?.type === "place" &&
                            deletingId?.id === review.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(reviews.trip_reviews?.length ?? 0) > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Trip Reviews ({reviews.trip_reviews?.length ?? 0})
                  </h3>
                  <div className="space-y-4">
                    {reviews.trip_reviews?.map((review) => (
                      <div
                        key={review.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <StarRating rating={review.rating} />
                              <span className="text-sm text-gray-500">
                                {new Date(review.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700">{review.review_text}</p>
                          </div>
                          <button
                            onClick={() =>
                              handleDeleteReview("trip", review.id)
                            }
                            disabled={
                              deletingId?.type === "trip" &&
                              deletingId?.id === review.id
                            }
                            className="ml-4 px-3 py-1 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                          >
                            {deletingId?.type === "trip" &&
                            deletingId?.id === review.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

                    {(reviews.program_reviews?.length ?? 0) === 0 &&
                      (reviews.course_reviews?.length ?? 0) === 0 &&
                      (reviews.housing_reviews?.length ?? 0) === 0 &&
                      (reviews.place_reviews?.length ?? 0) === 0 &&
                      (reviews.trip_reviews?.length ?? 0) === 0 && (
                        <div className="text-center py-8">
                          <p className="text-gray-600">
                            You haven't written any reviews yet.
                          </p>
                        </div>
                      )}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Edit Trip Modal */}
        {editingTrip && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Edit Trip</h2>
                  <button
                    onClick={() => setEditingTrip(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSaveTrip}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="edit-destination" className="block text-sm font-medium text-gray-700 mb-2">
                        Destination *
                      </label>
                      <input
                        type="text"
                        id="edit-destination"
                        required
                        value={editFormData.destination}
                        onChange={(e) => setEditFormData({ ...editFormData, destination: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-country" className="block text-sm font-medium text-gray-700 mb-2">
                        Country *
                      </label>
                      <input
                        type="text"
                        id="edit-country"
                        required
                        value={editFormData.country}
                        onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-trip_type" className="block text-sm font-medium text-gray-700 mb-2">
                        Trip Type *
                      </label>
                      <select
                        id="edit-trip_type"
                        required
                        value={editFormData.trip_type}
                        onChange={(e) => setEditFormData({ ...editFormData, trip_type: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="weekend">🏃‍♂️ Weekend</option>
                        <option value="spring break">🌸 Spring Break</option>
                        <option value="summer">☀️ Summer</option>
                        <option value="winter break">❄️ Winter Break</option>
                        <option value="other">✈️ Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        id="edit-description"
                        rows={4}
                        value={editFormData.description}
                        onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setEditingTrip(null)}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? "Saving..." : "Save Changes"}
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

export default Profile;
