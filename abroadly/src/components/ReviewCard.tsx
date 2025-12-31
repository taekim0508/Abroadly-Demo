import React from 'react';
import { Link } from 'react-router-dom';
import { ReviewerInfo } from '../services/api';
import StarRating from './StarRating';
import AskAboutButton from './AskAboutButton';
import { useAuth } from '../context/AuthContext';

interface ReviewCardProps {
  reviewId: number;
  userId: number;
  rating: number;
  reviewText: string;
  date: string;
  reviewer?: ReviewerInfo | null;
  // Context for messaging
  context?: {
    type: 'program' | 'place' | 'trip';
    id: number;
    name: string;
  };
  // Optional extra content (like course name, housing description)
  extraContent?: React.ReactNode;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  reviewId,
  userId,
  rating,
  reviewText,
  date,
  reviewer,
  context,
  extraContent,
}) => {
  const { user } = useAuth();
  const isOwnReview = user?.id === userId;

  // Get display name
  const getDisplayName = () => {
    if (!reviewer) return 'Anonymous';
    if (reviewer.first_name && reviewer.last_name) {
      return `${reviewer.first_name} ${reviewer.last_name.charAt(0)}.`;
    }
    if (reviewer.first_name) return reviewer.first_name;
    return 'Anonymous';
  };

  // Get institution display (e.g., "Vanderbilt '25")
  const getInstitutionDisplay = () => {
    if (!reviewer?.institution) return null;
    // Could add graduation year logic here if we have that data
    return reviewer.institution;
  };

  // Get study abroad info
  const getStudyAbroadInfo = () => {
    if (!reviewer) return null;
    if (reviewer.study_abroad_status === 'prospective') {
      return 'Planning to study abroad';
    }
    if (reviewer.program_city && reviewer.program_term) {
      const action = reviewer.study_abroad_status === 'current' ? 'Studying in' : 'Studied in';
      return `${action} ${reviewer.program_city} (${reviewer.program_term})`;
    }
    if (reviewer.program_city) {
      const action = reviewer.study_abroad_status === 'current' ? 'Studying in' : 'Studied in';
      return `${action} ${reviewer.program_city}`;
    }
    return null;
  };

  // Get status badge
  const getStatusBadge = () => {
    if (!reviewer?.study_abroad_status) return null;
    const badges = {
      prospective: { label: 'Prospective', color: 'bg-blue-100 text-blue-700' },
      current: { label: 'Currently Abroad', color: 'bg-green-100 text-green-700' },
      former: { label: 'Alumni', color: 'bg-purple-100 text-purple-700' },
    };
    const badge = badges[reviewer.study_abroad_status];
    return badge ? (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
        {badge.label}
      </span>
    ) : null;
  };

  // Get avatar initials
  const getInitials = () => {
    if (!reviewer) return '?';
    const first = reviewer.first_name?.charAt(0) || '';
    const last = reviewer.last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  };

  // Get avatar color based on user id
  const getAvatarColor = () => {
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
    return colors[userId % colors.length];
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header: User info */}
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <div className={`w-12 h-12 rounded-full ${getAvatarColor()} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
          {getInitials()}
        </div>

        {/* User details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900">{getDisplayName()}</span>
            {getStatusBadge()}
          </div>
          
          {getInstitutionDisplay() && (
            <p className="text-sm text-gray-600">
              🎓 {getInstitutionDisplay()}
            </p>
          )}
          
          {getStudyAbroadInfo() && (
            <p className="text-sm text-gray-500">
              📍 {getStudyAbroadInfo()}
            </p>
          )}
        </div>

        {/* Rating */}
        <div className="flex-shrink-0">
          <StarRating rating={rating} />
        </div>
      </div>

      {/* Extra content (course name, etc.) */}
      {extraContent && (
        <div className="mb-3">
          {extraContent}
        </div>
      )}

      {/* Review text */}
      <p className="text-gray-700 mb-4 leading-relaxed">
        "{reviewText}"
      </p>

      {/* Footer: Date and actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-sm text-gray-400">
          {new Date(date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </span>

        <div className="flex items-center gap-3">
          {/* View Profile link */}
          {reviewer?.id && (
            <Link
              to={`/profile/${reviewer.id}`}
              className="text-sm text-gray-500 hover:text-gray-700 transition"
            >
              View Profile
            </Link>
          )}

          {/* Ask button - only show if not own review */}
          {!isOwnReview && context && (
            <AskAboutButton
              recipientId={userId}
              context={context}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;


