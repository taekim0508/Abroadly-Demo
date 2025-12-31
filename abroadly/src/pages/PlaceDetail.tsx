// Contributors:
// Gordon Song - Setup and enhancements (1.5 hr)
// Tae Kim - Setup Enhancements (1.5 hrs)

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { placesApi, Place, PlaceReview } from '../services/api';
import StarRating from '../components/StarRating';
import BookmarkButton from '../components/BookmarkButton';
import ReviewCard from '../components/ReviewCard';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../hooks/useBookmarks';

const PlaceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [place, setPlace] = useState<Place | null>(null);
  const [reviews, setReviews] = useState<PlaceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPlaceData();
    }
  }, [id]);

  const fetchPlaceData = async () => {
    setLoading(true);
    try {
      const placeData = await placesApi.get(Number(id));
      const reviewsData = await placesApi.listReviews(Number(id));
      
      setPlace(placeData);
      setReviews(reviewsData);
    } catch (err: any) {
      setError('Failed to load place details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to submit a review');
      return;
    }

    setSubmitting(true);
    try {
      await placesApi.createReview(Number(id), {
        rating: reviewRating,
        review_text: reviewText,
      });
      setReviewText('');
      setReviewRating(5);
      setShowReviewForm(false);
      fetchPlaceData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {error || 'Place not found'}
          </div>
        </div>
      </div>
    );
  }

  const avgRating = calculateAverageRating();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to="/places" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Places
        </Link>

        {/* Place Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center mb-2">
                <span className="text-5xl mr-4">
                  {place.category === 'restaurant' && '🍽️'}
                  {place.category === 'cafe' && '☕'}
                  {place.category === 'activity' && '🎯'}
                  {place.category === 'museum' && '🏛️'}
                  {place.category === 'housing' && '🏠'}
                  {place.category === 'nightlife' && '🎉'}
                  {place.category === 'shopping' && '🛍️'}
                  {!['restaurant', 'cafe', 'activity', 'museum', 'housing', 'nightlife', 'shopping'].includes(place.category) && '📍'}
                </span>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">{place.name}</h1>
                  <p className="text-lg text-gray-600 capitalize">{place.category}</p>
                </div>
              </div>
              <div className="flex items-center text-gray-600 mt-2">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-lg">{place.city}, {place.country}</span>
              </div>
              {place.address && (
                <p className="text-gray-600 mt-2">📮 {place.address}</p>
              )}
            </div>
            <div>
              <BookmarkButton
                type="place"
                itemId={place.id}
                initialBookmarked={isBookmarked('place', place.id)}
                onToggle={(bookmarked) => toggleBookmark('place', place.id, bookmarked)}
              />
            </div>
          </div>

          {reviews.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center">
                <StarRating rating={avgRating} size="lg" />
                <span className="ml-4 text-gray-600">
                  ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Place Description */}
        {place.description && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">About</h3>
            <p className="text-gray-700 leading-relaxed">{place.description}</p>
          </div>
        )}

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h3>

          {user && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="mb-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Write a Review
            </button>
          )}

          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="mb-8 bg-gray-50 p-6 rounded-lg">
              <h4 className="text-xl font-bold mb-4">Write Your Review</h4>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <StarRating
                  rating={reviewRating}
                  interactive
                  onRatingChange={setReviewRating}
                  size="lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Share your experience at this place..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {reviews.length === 0 ? (
            <p className="text-gray-600">No reviews yet. Be the first to review this place!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  reviewId={review.id}
                  userId={review.user_id}
                  rating={review.rating}
                  reviewText={review.review_text}
                  date={review.date}
                  reviewer={review.reviewer}
                  context={{
                    type: 'place',
                    id: place.id,
                    name: place.name,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaceDetail;

