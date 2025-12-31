// Contributors:
// Cursor AI Assistant - PlaceCard component with rating display

import React from 'react';
import { Link } from 'react-router-dom';
import { Place } from '../services/api';
import BookmarkButton from './BookmarkButton';

interface PlaceCardProps {
  place: Place;
  isBookmarked?: boolean;
  onToggleBookmark?: (bookmarked: boolean) => void;
}

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

const PlaceCard: React.FC<PlaceCardProps> = ({ place, isBookmarked = false, onToggleBookmark }) => {
  return (
    <div className="relative bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Bookmark button */}
      <div className="absolute top-3 right-3 z-10">
        <BookmarkButton 
          type="place" 
          itemId={place.id} 
          initialBookmarked={isBookmarked}
          onToggle={onToggleBookmark}
        />
      </div>

      <Link to={`/places/${place.id}`} className="block p-6 pr-14">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <span className="text-3xl mr-3">{getCategoryIcon(place.category)}</span>
            <div>
              <h3 className="text-xl font-bold text-gray-900 hover:text-gray-600 transition">
                {place.name}
              </h3>
              <span className="text-sm text-gray-600 capitalize">{place.category}</span>
            </div>
          </div>
        </div>

        {/* Rating Display */}
        <div className="flex items-center mb-3">
          {place.average_rating ? (
            <div className="flex items-center">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-700">
                {place.average_rating.toFixed(1)}
              </span>
              <span className="ml-1 text-sm text-gray-500">
                ({place.review_count} {place.review_count === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-400 italic">No reviews yet</span>
          )}
        </div>

        <div className="flex items-center text-gray-600 text-sm mb-3">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{place.city}, {place.country}</span>
        </div>

        {place.address && (
          <p className="text-sm text-gray-600 mb-3">
            📮 {place.address}
          </p>
        )}

        {place.description && (
          <p className="text-gray-600 text-sm line-clamp-3 mb-4">
            {place.description}
          </p>
        )}

        <span className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm">
          View Details
        </span>
      </Link>
    </div>
  );
};

export default PlaceCard;

