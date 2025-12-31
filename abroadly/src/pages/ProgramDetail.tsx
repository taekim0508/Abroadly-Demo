// Contributors:
// Gordon Song - Program Details Setup (1 hr)
// Tae Kim - Program Details Page Enhancements (1 hr)

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  programsApi, 
  StudyAbroadProgram, 
  ProgramReview, 
  CourseReview, 
  ProgramHousingReview 
} from '../services/api';
import StarRating from '../components/StarRating';
import BookmarkButton from '../components/BookmarkButton';
import ReviewCard from '../components/ReviewCard';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../hooks/useBookmarks';

const ProgramDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [program, setProgram] = useState<StudyAbroadProgram | null>(null);
  const [reviews, setReviews] = useState<ProgramReview[]>([]);
  const [courseReviews, setCourseReviews] = useState<CourseReview[]>([]);
  const [housingReviews, setHousingReviews] = useState<ProgramHousingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'housing'>('overview');

  // Program Review form states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Course Review form states
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseFormData, setCourseFormData] = useState({
    course_name: '',
    instructor_name: '',
    rating: 5,
    review_text: '',
  });
  const [submittingCourse, setSubmittingCourse] = useState(false);

  // Housing Review form states
  const [showHousingForm, setShowHousingForm] = useState(false);
  const [housingFormData, setHousingFormData] = useState({
    housing_description: '',
    rating: 5,
    review_text: '',
  });
  const [submittingHousing, setSubmittingHousing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProgramData();
    }
  }, [id]);

  const fetchProgramData = async () => {
    setLoading(true);
    try {
      const programData = await programsApi.get(Number(id));
      const reviewsData = await programsApi.listReviews(Number(id));
      const coursesData = await programsApi.listCourseReviews(Number(id));
      const housingData = await programsApi.listHousingReviews(Number(id));
      
      setProgram(programData);
      setReviews(reviewsData);
      setCourseReviews(coursesData);
      setHousingReviews(housingData);
    } catch (err: any) {
      setError('Failed to load program details.');
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
      await programsApi.createReview(Number(id), {
        rating: reviewRating,
        review_text: reviewText,
      });
      setReviewText('');
      setReviewRating(5);
      setShowReviewForm(false);
      fetchProgramData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitCourseReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to submit a review');
      return;
    }

    setSubmittingCourse(true);
    try {
      await programsApi.createCourseReview(Number(id), courseFormData);
      setCourseFormData({
        course_name: '',
        instructor_name: '',
        rating: 5,
        review_text: '',
      });
      setShowCourseForm(false);
      fetchProgramData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit course review');
    } finally {
      setSubmittingCourse(false);
    }
  };

  const handleSubmitHousingReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to submit a review');
      return;
    }

    setSubmittingHousing(true);
    try {
      await programsApi.createHousingReview(Number(id), housingFormData);
      setHousingFormData({
        housing_description: '',
        rating: 5,
        review_text: '',
      });
      setShowHousingForm(false);
      fetchProgramData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit housing review');
    } finally {
      setSubmittingHousing(false);
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

  if (error || !program) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {error || 'Program not found'}
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
        <Link to="/programs" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Programs
        </Link>

        {/* Program Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{program.program_name}</h1>
              <p className="text-xl text-gray-700 mb-2">{program.institution}</p>
              <div className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-lg">{program.city}, {program.country}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BookmarkButton 
                type="program" 
                itemId={program.id} 
                initialBookmarked={isBookmarked('program', program.id)}
                onToggle={(bookmarked) => toggleBookmark('program', program.id, bookmarked)}
              />
              {program.cost && (
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">${program.cost.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Program Cost</div>
                </div>
              )}
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

        {/* Program Details */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {program.duration && (
              <div>
                <div className="text-sm text-gray-600 mb-1">Duration</div>
                <div className="font-semibold text-gray-900">{program.duration}</div>
              </div>
            )}
            {program.housing_type && (
              <div>
                <div className="text-sm text-gray-600 mb-1">Housing Type</div>
                <div className="font-semibold text-gray-900">{program.housing_type}</div>
              </div>
            )}
            {program.location && (
              <div>
                <div className="text-sm text-gray-600 mb-1">Location</div>
                <div className="font-semibold text-gray-900">{program.location}</div>
              </div>
            )}
          </div>

          {program.description && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">About This Program</h3>
              <p className="text-gray-700 leading-relaxed">{program.description}</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 font-semibold ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Reviews ({reviews.length})
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`px-6 py-4 font-semibold ${
                  activeTab === 'courses'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Courses ({courseReviews.length})
              </button>
              <button
                onClick={() => setActiveTab('housing')}
                className={`px-6 py-4 font-semibold ${
                  activeTab === 'housing'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Housing ({housingReviews.length})
              </button>
            </div>
          </div>

          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
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
                    <h3 className="text-xl font-bold mb-4">Write Your Review</h3>
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
                        placeholder="Share your experience with this program..."
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
                  <p className="text-gray-600">No reviews yet. Be the first to review this program!</p>
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
                          type: 'program',
                          id: program.id,
                          name: program.program_name,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Courses Tab */}
            {activeTab === 'courses' && (
              <div>
                {user && !showCourseForm && (
                  <button
                    onClick={() => setShowCourseForm(true)}
                    className="mb-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                  >
                    Write a Course Review
                  </button>
                )}

                {showCourseForm && (
                  <form onSubmit={handleSubmitCourseReview} className="mb-8 bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-4">Write a Course Review</h3>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Course Name *</label>
                      <input
                        type="text"
                        value={courseFormData.course_name}
                        onChange={(e) => setCourseFormData({ ...courseFormData, course_name: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., British Literature"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instructor Name (optional)</label>
                      <input
                        type="text"
                        value={courseFormData.instructor_name}
                        onChange={(e) => setCourseFormData({ ...courseFormData, instructor_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Dr. Smith"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      <StarRating
                        rating={courseFormData.rating}
                        interactive
                        onRatingChange={(rating) => setCourseFormData({ ...courseFormData, rating })}
                        size="lg"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Review *</label>
                      <textarea
                        value={courseFormData.review_text}
                        onChange={(e) => setCourseFormData({ ...courseFormData, review_text: e.target.value })}
                        required
                        rows={5}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Share your experience with this course..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={submittingCourse}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition disabled:opacity-50"
                      >
                        {submittingCourse ? 'Submitting...' : 'Submit Review'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCourseForm(false)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {courseReviews.length === 0 ? (
                  <p className="text-gray-600">No course reviews yet. Be the first to review a course!</p>
                ) : (
                  <div className="space-y-4">
                    {courseReviews.map((review) => (
                      <ReviewCard
                        key={review.id}
                        reviewId={review.id}
                        userId={review.user_id}
                        rating={review.rating}
                        reviewText={review.review_text}
                        date={review.date}
                        reviewer={review.reviewer}
                        context={{
                          type: 'program',
                          id: program.id,
                          name: program.program_name,
                        }}
                        extraContent={
                          <div className="bg-gray-50 rounded-lg px-3 py-2">
                            <h4 className="font-semibold text-gray-900">{review.course_name}</h4>
                            {review.instructor_name && (
                              <p className="text-sm text-gray-600">Instructor: {review.instructor_name}</p>
                            )}
                          </div>
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Housing Tab */}
            {activeTab === 'housing' && (
              <div>
                {user && !showHousingForm && (
                  <button
                    onClick={() => setShowHousingForm(true)}
                    className="mb-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                  >
                    Write a Housing Review
                  </button>
                )}

                {showHousingForm && (
                  <form onSubmit={handleSubmitHousingReview} className="mb-8 bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-4">Write a Housing Review</h3>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Housing Description *</label>
                      <input
                        type="text"
                        value={housingFormData.housing_description}
                        onChange={(e) => setHousingFormData({ ...housingFormData, housing_description: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Student Dormitory Building A, Apartment near campus"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      <StarRating
                        rating={housingFormData.rating}
                        interactive
                        onRatingChange={(rating) => setHousingFormData({ ...housingFormData, rating })}
                        size="lg"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Review *</label>
                      <textarea
                        value={housingFormData.review_text}
                        onChange={(e) => setHousingFormData({ ...housingFormData, review_text: e.target.value })}
                        required
                        rows={5}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Share your experience with this housing option..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={submittingHousing}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition disabled:opacity-50"
                      >
                        {submittingHousing ? 'Submitting...' : 'Submit Review'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowHousingForm(false)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {housingReviews.length === 0 ? (
                  <p className="text-gray-600">No housing reviews yet. Be the first to review housing!</p>
                ) : (
                  <div className="space-y-4">
                    {housingReviews.map((review) => (
                      <ReviewCard
                        key={review.id}
                        reviewId={review.id}
                        userId={review.user_id}
                        rating={review.rating}
                        reviewText={review.review_text}
                        date={review.date}
                        reviewer={review.reviewer}
                        context={{
                          type: 'program',
                          id: program.id,
                          name: program.program_name,
                        }}
                        extraContent={
                          <div className="bg-gray-50 rounded-lg px-3 py-2">
                            <h4 className="font-semibold text-gray-900">🏠 {review.housing_description}</h4>
                          </div>
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetail;

