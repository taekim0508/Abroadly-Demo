import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authApi, User } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';

interface UserReview {
  id: number;
  type: 'program' | 'place' | 'trip';
  rating: number;
  review_text: string;
  date: string;
  program_id?: number;
  program_name?: string;
  program_city?: string;
  program_country?: string;
  place_id?: number;
  place_name?: string;
  place_city?: string;
  place_country?: string;
  trip_id?: number;
  trip_destination?: string;
  trip_country?: string;
}

interface UserReviewsResponse {
  program_reviews: UserReview[];
  place_reviews: UserReview[];
  trip_reviews: UserReview[];
}

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [reviews, setReviews] = useState<UserReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const [profileData, reviewsData] = await Promise.all([
          authApi.getPublicProfile(parseInt(id)),
          authApi.getUserReviews(parseInt(id)),
        ]);
        setProfile(profileData);
        setReviews(reviewsData);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Get display name
  const getDisplayName = () => {
    if (!profile) return 'User';
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile.first_name) return profile.first_name;
    return 'User';
  };

  // Get initials for avatar
  const getInitials = () => {
    if (!profile) return '?';
    const first = profile.first_name?.charAt(0) || '';
    const last = profile.last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  };

  // Get avatar color based on user id
  const getAvatarColor = () => {
    if (!profile) return 'bg-gray-400';
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-red-500',
    ];
    return colors[profile.id % colors.length];
  };

  // Get total review count
  const getTotalReviews = () => {
    if (!reviews) return 0;
    return reviews.program_reviews.length + reviews.place_reviews.length + reviews.trip_reviews.length;
  };

  // Get all reviews combined and sorted by date
  const getAllReviews = () => {
    if (!reviews) return [];
    const all = [
      ...reviews.program_reviews,
      ...reviews.place_reviews,
      ...reviews.trip_reviews,
    ];
    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'This user profile could not be found.'}</p>
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;
  const allReviews = getAllReviews();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600" />
          
          {/* Profile Info */}
          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className={`-mt-16 mb-4 w-32 h-32 rounded-full ${getAvatarColor()} border-4 border-white shadow-lg flex items-center justify-center text-white text-4xl font-bold`}>
              {getInitials()}
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {getDisplayName()}
                </h1>
                
                {profile.institution && (
                  <p className="text-lg text-gray-600 mb-2">
                    🎓 {profile.institution}
                  </p>
                )}

                {/* Study Abroad Status Badge */}
                {profile.study_abroad_status && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      profile.study_abroad_status === 'prospective' ? 'bg-blue-100 text-blue-700' :
                      profile.study_abroad_status === 'current' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {profile.study_abroad_status === 'prospective' && '🔍 Planning to Study Abroad'}
                      {profile.study_abroad_status === 'current' && '✈️ Currently Studying Abroad'}
                      {profile.study_abroad_status === 'former' && '🎓 Study Abroad Alumni'}
                    </span>
                  </div>
                )}

                {/* Program Info */}
                {(profile.study_abroad_status === 'current' || profile.study_abroad_status === 'former') && profile.program_name && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{profile.program_name}</h3>
                    {profile.program_city && profile.program_country && (
                      <p className="text-gray-600">
                        📍 {profile.program_city}, {profile.program_country}
                      </p>
                    )}
                    {profile.program_term && (
                      <p className="text-gray-500 text-sm">
                        📅 {profile.program_term}
                      </p>
                    )}
                  </div>
                )}

                {/* Majors/Minors */}
                {((profile.majors && profile.majors.length > 0) || (profile.minors && profile.minors.length > 0)) && (
                  <div className="flex flex-wrap gap-2">
                    {profile.majors?.map((major) => (
                      <span key={major} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {major}
                      </span>
                    ))}
                    {profile.minors?.map((minor) => (
                      <span key={minor} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {minor} (minor)
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {isOwnProfile ? (
                  <Link
                    to="/profile"
                    className="px-4 py-2 bg-gray-900 hover:bg-black text-white font-medium rounded-lg transition"
                  >
                    Edit Profile
                  </Link>
                ) : (
                  currentUser && (
                    <button
                      onClick={() => {
                        alert('Use the "Ask about this" button on reviews to message this user!');
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Message
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Reviews ({getTotalReviews()})
          </h2>

          {allReviews.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">📝</div>
              <p className="text-gray-600">
                {profile.first_name || 'This user'} hasn't written any reviews yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {allReviews.map((review) => (
                <div key={`${review.type}-${review.id}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      {review.type === 'program' && (
                        <Link 
                          to={`/programs/${review.program_id}`}
                          className="font-semibold text-gray-900 hover:text-blue-600 transition"
                        >
                          🎓 {review.program_name}
                        </Link>
                      )}
                      {review.type === 'place' && (
                        <Link 
                          to={`/places/${review.place_id}`}
                          className="font-semibold text-gray-900 hover:text-blue-600 transition"
                        >
                          📍 {review.place_name}
                        </Link>
                      )}
                      {review.type === 'trip' && (
                        <Link 
                          to={`/trips/${review.trip_id}`}
                          className="font-semibold text-gray-900 hover:text-blue-600 transition"
                        >
                          ✈️ {review.trip_destination}
                        </Link>
                      )}
                      <p className="text-sm text-gray-500">
                        {review.type === 'program' && review.program_city && `${review.program_city}, ${review.program_country}`}
                        {review.type === 'place' && review.place_city && `${review.place_city}, ${review.place_country}`}
                        {review.type === 'trip' && review.trip_country}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        review.type === 'program' ? 'bg-purple-100 text-purple-700' :
                        review.type === 'place' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {review.type}
                      </span>
                      <StarRating rating={review.rating} />
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-gray-700 mb-2">"{review.review_text}"</p>

                  {/* Date */}
                  <p className="text-sm text-gray-400">
                    {new Date(review.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
